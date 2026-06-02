---
title: "CREATE TASK (SQL Task)"
doc_type: reference
mysql_compat: mo_only
differs_from_mysql: []
mo_only:
  - "CREATE TASK / ALTER TASK / DROP TASK / EXECUTE TASK / SHOW TASKS (MO-specific scheduled SQL tasks; MySQL uses CREATE EVENT instead)"
since: v3.0.10
last_updated: 2026-05-08
llms_summary: "Define, alter, drop, execute, and inspect MatrixOne SQL tasks that run a SQL body on a cron schedule or on demand, with optional gate, retry, and timeout options."
---

# CREATE TASK / ALTER TASK / DROP TASK / EXECUTE TASK / SHOW TASKS

> Create, alter, drop, execute, and inspect MatrixOne SQL tasks. A SQL task is a named server-side job that runs a SQL body on a cron schedule or on demand, with optional WHEN gate, RETRY count, and TIMEOUT; run history is exposed via SHOW TASKS and SHOW TASK RUNS.

## Description

A SQL task is a MatrixOne-managed scheduled job that runs a user-supplied SQL body. Tasks are owned by the account that created them; each task has an optional cron schedule, an optional `WHEN` gate that must evaluate truthy before a run is allowed, a retry limit, a timeout, and a SQL body placed between `BEGIN` and `END`.

Task runs can be triggered:

- automatically by the scheduler whenever the cron expression fires, or
- manually with `EXECUTE TASK`.

Run history is persisted in `mo_task.sql_task_run` and is also exposed via `SHOW TASK RUNS`.

## Syntax

### CREATE TASK

```text
CREATE TASK [IF NOT EXISTS] <task_name>
    [SCHEDULE '<cron_expr>' [TIMEZONE '<tz_name>']]
    [WHEN ( <gate_expr> )]
    [RETRY <retry_limit>]
    [TIMEOUT '<duration>']
    AS BEGIN
        <sql_statement>;
        [<sql_statement>; ...]
    END;
```

### ALTER TASK

```text
ALTER TASK <task_name> SUSPEND
ALTER TASK <task_name> RESUME
ALTER TASK <task_name> SET SCHEDULE '<cron_expr>' [TIMEZONE '<tz_name>']
ALTER TASK <task_name> SET WHEN ( <gate_expr> )
ALTER TASK <task_name> SET RETRY <retry_limit>
ALTER TASK <task_name> SET TIMEOUT '<duration>'
```

### DROP TASK

```text
DROP TASK [IF EXISTS] <task_name>
```

### EXECUTE TASK

```text
EXECUTE TASK <task_name>
```

### SHOW TASKS / SHOW TASK RUNS

```text
SHOW TASKS
SHOW TASK RUNS [FOR <task_name>] [LIMIT <n>]
```

## Arguments

| Parameter | Description |
|-----------|-------------|
| `task_name` | Identifier of the task. Unique per account. |
| `SCHEDULE 'cron_expr'` | Cron expression parsed by the `robfig/cron/v3` library (6-field form with seconds is supported). Omit to create a manual-only task. |
| `TIMEZONE 'tz_name'` | IANA time-zone name applied to the cron schedule (e.g. `'UTC'`, `'Asia/Shanghai'`). Defaults to the server default when omitted. |
| `WHEN ( gate_expr )` | Optional gate expression re-evaluated at every run. The run body executes only when the expression returns a non-zero / non-empty result; otherwise the run is recorded with `GATE_BLOCKED` status and does not consume a retry attempt. |
| `RETRY retry_limit` | Maximum number of extra retry attempts after a failing run. Default is `0` (no retry). Each attempt is recorded as a separate row in `mo_task.sql_task_run`. |
| `TIMEOUT 'duration'` | Per-run timeout, parsed by Go's `time.ParseDuration` (`'500ms'`, `'30s'`, `'5m'`, `'1h'`). The value must be non-negative. |
| `AS BEGIN ... END` | SQL body. Each inner statement ends with `;`; statements execute sequentially inside the run. |
| `SUSPEND` / `RESUME` | Disable or re-enable scheduler firing for the task. `SUSPEND` does not affect manual `EXECUTE TASK`. |

## Usage Notes

- **Name uniqueness.** `CREATE TASK` fails with `sql task <name> already exists` when a task with the same name already exists for the account. `IF NOT EXISTS` turns re-creation into a no-op.
- **Missing task.** `ALTER TASK`, `DROP TASK`, and `EXECUTE TASK` fail with `sql task <name> not found` when the task does not exist. `DROP TASK IF EXISTS` turns this into a no-op.
- **Non-overlapping runs.** At most one run of a given task executes at a time; `EXECUTE TASK` on a task that is already running fails with `sql task is already running`.
- **Task service readiness.** If the task service has not yet initialized on the current CN, the statement fails with `task service not ready yet, please try again later.` and can be retried once the service comes up.
- **Timeout format.** `'1h30m'`, `'90s'`, `'500ms'`, `'0'` are all accepted. A malformed duration returns the underlying `time.ParseDuration` error; a negative value fails with `invalid argument timeout`.
- **Gate semantics.** The `WHEN` expression is re-evaluated at every run. A skipped run is recorded with status `GATE_BLOCKED`; it does not consume a retry attempt.
- **SHOW TASKS columns.** `task_name`, `schedule`, `enabled`, `gate_condition`, `retry_limit`, `timeout`, `created_at`, `last_run_status`, `last_run_time`.
- **SHOW TASK RUNS columns.** `run_id`, `task_name`, `trigger_type`, `status`, `started_at`, `finished_at`, `duration`, `attempt`, `rows_affected`, `error_message`. `trigger_type` is `MANUAL` for `EXECUTE TASK` and `SCHEDULE` for cron-fired runs. `LIMIT n` caps the most recent rows; `FOR task_name` filters by task.
- **Manual and scheduled history share `mo_task.sql_task_run`.** Filter on `trigger_type` to distinguish them.

## Examples

> The task body is delimited by `BEGIN` / `END` and contains embedded `;` terminators, so the statement cannot be sent through a plain `;`-delimited client without a custom delimiter. Treat the following SQL blocks as templates; in practice, use a client that supports a delimiter switch (for example the `mysql` client's `DELIMITER` command) to issue the `CREATE TASK` statements.

Example 1 — scheduled task with a cron expression:

<!-- validator-ignore -->
```sql
CREATE TASK IF NOT EXISTS <task_name>
    SCHEDULE '0 0 0 1 1 *'
    TIMEZONE 'UTC'
AS BEGIN
    INSERT INTO <target_table>(<marker_col>) VALUES ('cron');
END;
```

Example 2 — manual-only task (no `SCHEDULE`), fired via `EXECUTE TASK`:

<!-- validator-ignore -->
```sql
CREATE TASK IF NOT EXISTS <task_name>
AS BEGIN
    INSERT INTO <target_table>
    SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM <target_table> WHERE id = 1);
END;
```

Example 3 — gated task with `WHEN`, retry, and per-run timeout:

<!-- validator-ignore -->
```sql
CREATE TASK IF NOT EXISTS <task_name>
    WHEN (EXISTS (SELECT 1 FROM <gate_table> WHERE id = 1))
    RETRY 1
    TIMEOUT '30s'
AS BEGIN
    INSERT INTO <sink_table>
    SELECT 'gate-ok'
    WHERE NOT EXISTS (SELECT 1 FROM <sink_table> WHERE tag = 'gate-ok');
END;
```

Example 4 — alter, suspend, resume, execute, inspect, drop:

<!-- validator-ignore -->
```sql
ALTER TASK <task_name> SET SCHEDULE '*/1 * * * * *' TIMEZONE 'UTC';
ALTER TASK <task_name> SET WHEN (EXISTS (SELECT 1 FROM <gate_table> WHERE id = 1));
ALTER TASK <task_name> SET RETRY 2;
ALTER TASK <task_name> SET TIMEOUT '1m';

ALTER TASK <task_name> SUSPEND;
ALTER TASK <task_name> RESUME;

EXECUTE TASK <task_name>;

SHOW TASKS;
SHOW TASK RUNS FOR <task_name> LIMIT 5;

DROP TASK IF EXISTS <task_name>;
```

## Notes

1. `SCHEDULE` accepts the 6-field cron form used by `robfig/cron/v3` (including seconds); classic 5-field expressions may be rejected. Use `TIMEZONE` to anchor the schedule to a specific IANA zone.
2. The SQL body runs with the creating user's role and default database; cross-account access is not granted implicitly.
3. A `TIMEOUT` that elapses mid-run aborts the current statement and records the run as a timeout in `mo_task.sql_task_run`. Retries (if any) are performed up to `RETRY retry_limit` additional attempts.
4. Dropping a task removes its definition but does not delete rows already written to `mo_task.sql_task_run`.
