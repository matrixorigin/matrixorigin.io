# SQL Task

## Description

A **SQL Task** is a server-side scheduled SQL job: you register a
named SQL body (one or more statements) together with a schedule and
optional gate condition, and the server runs it on that schedule.
Tasks and their execution history are persisted in
`mo_task.sql_task` and `mo_task.sql_task_run`.

The v3.0.10 release adds six statements to manage SQL Tasks:

- `CREATE TASK` — register a new task.
- `ALTER TASK` — suspend, resume, or edit an existing task.
- `DROP TASK` — remove a task.
- `EXECUTE TASK` — run a task once, immediately (a manual trigger).
- `SHOW TASKS` — list all tasks for the current account.
- `SHOW TASK RUNS` — list run history for tasks.

This documents the `sql_task` feature.

## Syntax

### CREATE TASK

```
CREATE TASK [IF NOT EXISTS] task_name
    [SCHEDULE 'cron_expression' [TIMEZONE 'timezone']]
    [WHEN (expression | select_stmt)]
    [RETRY n]
    [TIMEOUT 'duration_string']
    AS BEGIN
        sql_statement [; sql_statement ...] [;]
    END
```

### ALTER TASK

```
ALTER TASK task_name SUSPEND;
ALTER TASK task_name RESUME;
ALTER TASK task_name SET SCHEDULE 'cron_expression' [TIMEZONE 'timezone'];
ALTER TASK task_name SET WHEN (expression | select_stmt);
ALTER TASK task_name SET RETRY n;
ALTER TASK task_name SET TIMEOUT 'duration_string';
```

### DROP TASK

```
DROP TASK [IF EXISTS] task_name;
```

### EXECUTE TASK

```
EXECUTE TASK task_name;
```

### SHOW TASKS / SHOW TASK RUNS

```
SHOW TASKS;

SHOW TASK RUNS [FOR task_name] [LIMIT n];
```

## Arguments

| Parameter | Description |
|-----------|-------------|
| `task_name` | Identifier. Unique per account. |
| `IF NOT EXISTS` | On `CREATE TASK`: silently succeed if a task with the same name already exists. |
| `IF EXISTS` | On `DROP TASK`: silently succeed if no such task exists. |
| `SCHEDULE 'cron_expression'` | Standard cron expression that drives the scheduler. |
| `TIMEZONE 'timezone'` | Timezone name used to interpret the cron expression. Defaults to `UTC`. |
| `WHEN (expression)` | Gate condition evaluated before each scheduled run. The expression must evaluate to a truthy value; otherwise the run is recorded with status `SKIPPED`. |
| `WHEN (select_stmt)` | Subquery form of the gate condition. |
| `RETRY n` | Maximum number of extra attempts after a failure. `0` (default) means no retry. |
| `TIMEOUT 'duration_string'` | Maximum run duration (for example `'10s'`, `'5m'`, `'1h'`). When exceeded, the run is marked `TIMEOUT`. |
| `AS BEGIN ... END` | Task body. One or more SQL statements separated by `;`. |
| `FOR task_name` | On `SHOW TASK RUNS`: restrict results to a specific task. |
| `LIMIT n` | On `SHOW TASK RUNS`: cap the number of returned rows. |

### Alter actions

`ALTER TASK task_name <action>` accepts the following actions:

| Action | Effect |
|--------|--------|
| `SUSPEND` | Disable the task. The scheduler will not fire it until it is resumed. |
| `RESUME` | Enable the task and recompute its next fire time using the current schedule. |
| `SET SCHEDULE '...' [TIMEZONE '...']` | Replace the cron expression (and optional timezone). The trigger counter is reset and the next fire time is recomputed. |
| `SET WHEN (...)` | Replace the gate condition. |
| `SET RETRY n` | Replace the retry limit. |
| `SET TIMEOUT '...'` | Replace the run timeout. |

### SHOW TASKS columns

`SHOW TASKS` returns one row per task for the current account:

| Column | Description |
|--------|-------------|
| `task_name` | Task name. |
| `schedule` | Effective schedule string (cron expression, combined with timezone when present). |
| `enabled` | `1` if the task is active, `0` if it has been suspended. |
| `gate_condition` | The most recent `WHEN (...)` expression, as a text representation. Empty if no gate was set. |
| `retry_limit` | Current retry limit (integer). |
| `timeout` | Current timeout string (for example `'10s'`). Empty if no timeout is set. |
| `created_at` | Task creation time. |
| `last_run_status` | Status of the most recent run, or empty if the task has never run. |
| `last_run_time` | Start time of the most recent run, or empty. |

### SHOW TASK RUNS columns

| Column | Description |
|--------|-------------|
| `run_id` | Monotonically assigned run identifier. |
| `task_name` | Task name. |
| `trigger_type` | `SCHEDULED` or `MANUAL` (manual = invoked via `EXECUTE TASK`). |
| `status` | One of `RUNNING`, `SUCCESS`, `FAILED`, `SKIPPED`, `TIMEOUT`. |
| `started_at` | Run start time; empty if not yet started. |
| `finished_at` | Run finish time; empty if still running. |
| `duration` | Run duration, in seconds. |
| `attempt` | Attempt number within this run's retry sequence. |
| `rows_affected` | Total rows affected by the task body. |
| `error_message` | Error text for `FAILED` / `TIMEOUT`; empty otherwise. |

## Usage Notes

- **One task, one account.** Task names are unique per account;
  two accounts may each own a task with the same name.
- **Task body must be `BEGIN ... END`.** A single-statement body is
  also written as `BEGIN stmt; END`. Statements are separated by
  `;` and the compound wrapper is mandatory.
- **Gate semantics.** When `WHEN (...)` is present, the gate is
  evaluated before each scheduled run. A truthy result proceeds
  with the run; a falsy or NULL result marks the run as
  `SKIPPED` without executing the body.
- **Retries.** If `RETRY n` is set, a failed run is retried up to
  `n` additional times. Each attempt appears as its own row in
  `SHOW TASK RUNS` with an incrementing `attempt`.
- **Timeouts.** If the body exceeds `TIMEOUT 'duration_string'`,
  the run is aborted and recorded with status `TIMEOUT`.
- **Suspend / resume.** `ALTER TASK ... SUSPEND` clears the task's
  scheduler slot but preserves its definition; `RESUME` recomputes
  the next fire time from the current schedule.
- **Manual run overlap.** `EXECUTE TASK` is rejected while a run
  of the same task is already in progress, with
  `sql task is already running`.
- **Missing task.** `DROP TASK` without `IF EXISTS` on an unknown
  task returns `sql task <name> not found`. `EXECUTE TASK` and the
  non-suspend/resume forms of `ALTER TASK` on an unknown task also
  return `sql task <name> not found`.
- **Duplicate on CREATE.** `CREATE TASK` without `IF NOT EXISTS`
  returns `sql task <name> already exists` when the task is already
  registered for the current account.

## Examples

### Example 1: Schedule a task and let it run

```sql
CREATE TASK rollup_hourly
    SCHEDULE '0 * * * *' TIMEZONE 'UTC'
    AS BEGIN
        INSERT INTO rollup_hourly_tgt
            SELECT hour_bucket, COUNT(*) FROM events
            WHERE ts < NOW() GROUP BY hour_bucket;
    END;

SHOW TASKS;
-- One row named 'rollup_hourly' with enabled=1 and schedule '0 * * * * UTC'.
```

### Example 2: Manually trigger a task and inspect its run

```sql
EXECUTE TASK rollup_hourly;

SHOW TASK RUNS FOR rollup_hourly LIMIT 5;
-- Rows with trigger_type = 'MANUAL' for the run just kicked off,
-- plus any earlier 'SCHEDULED' rows.
```

### Example 3: Gate condition that skips runs

```sql
CREATE TASK refresh_cache
    SCHEDULE '*/5 * * * *'
    WHEN ((SELECT COUNT(*) FROM pending_updates) > 0)
    AS BEGIN
        CALL refresh_cache_proc();
    END;

-- When pending_updates is empty at fire time, the run is recorded
-- with status 'SKIPPED' instead of executing the body.
SHOW TASK RUNS FOR refresh_cache;
```

### Example 4: Retry + timeout

```sql
CREATE TASK import_feed
    SCHEDULE '*/10 * * * *'
    RETRY 3
    TIMEOUT '30s'
    AS BEGIN
        LOAD DATA INFILE '/data/feed.csv' INTO TABLE feed_raw;
    END;

-- A failing run is retried up to 3 more times. A run that exceeds
-- 30 seconds is cancelled and recorded with status 'TIMEOUT'.
SHOW TASK RUNS FOR import_feed LIMIT 10;
```

### Example 5: Edit schedule, gate, retry, timeout; then suspend/resume

```sql
ALTER TASK rollup_hourly SET SCHEDULE '*/15 * * * *' TIMEZONE 'Asia/Shanghai';
ALTER TASK rollup_hourly SET WHEN (SELECT should_rollup());
ALTER TASK rollup_hourly SET RETRY 1;
ALTER TASK rollup_hourly SET TIMEOUT '1m';

ALTER TASK rollup_hourly SUSPEND;
-- enabled=0 after this

ALTER TASK rollup_hourly RESUME;
-- recomputes the next fire time
```

### Example 6: Remove a task

```sql
DROP TASK IF EXISTS rollup_hourly;
```

## Notes

1. Task definitions live in `mo_task.sql_task`; run history lives in
   `mo_task.sql_task_run`. Both tables are created by the bootstrap
   upgrade for the 3.0-dev line and are visible to the system
   account.
2. `SCHEDULED` vs `MANUAL` is recorded per run in the `trigger_type`
   column of `SHOW TASK RUNS`. Manual runs come from `EXECUTE TASK`.
3. A timezone-less `SCHEDULE` uses UTC.
4. The default retry limit is `0` (no retry). The default timeout is
   empty (no timeout).
