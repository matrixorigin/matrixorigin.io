# Point-in-time features and revisions

A historical feature must use information that was available at its cutoff. Event time, arrival time, revisions and label readiness are different constraints.

## Filter visibility before choosing the latest version

This small fixture has two events. An event-1 correction arrives on day 5; an event-2 invalidation arrives on day 4:

```sql
CREATE TABLE doc_pit_example(
    rid INT PRIMARY KEY,event_id INT,event_day INT,received_day INT,
    revision INT,valid INT,v DOUBLE
);
INSERT INTO doc_pit_example VALUES
(1,1,1,2,1,1,10),(2,1,1,5,2,1,99),
(3,2,2,3,1,1,20),(4,2,2,4,2,0,NULL);

mysql> WITH visible AS (
    SELECT *,ROW_NUMBER() OVER(
        PARTITION BY event_id ORDER BY revision DESC,rid DESC
    ) choice
    FROM doc_pit_example WHERE event_day<3 AND received_day<=3
)
SELECT event_id,v FROM visible
WHERE choice=1 AND valid=1 ORDER BY event_id;
+----------+----+
| event_id | v  |
+----------+----+
| 1        | 10 |
| 2        | 20 |
+----------+----+
```

Expected rows: (1,10), (2,20).

Choose the latest revision among visible rows, then apply invalidation. Selecting the globally latest revision before filtering arrival time removes versions that were genuinely known at the cutoff. Filtering invalid records before ranking can incorrectly resurrect an older valid version.

At cutoff 4 the second event's latest visible version is invalid, so the result contains only (1,10):

```sql
mysql> WITH visible AS (
    SELECT *,ROW_NUMBER() OVER(
        PARTITION BY event_id ORDER BY revision DESC,rid DESC
    ) choice
    FROM doc_pit_example WHERE event_day<4 AND received_day<=4
)
SELECT event_id,v FROM visible
WHERE choice=1 AND valid=1 ORDER BY event_id;

+----------+----+
| event_id | v  |
+----------+----+
| 1        | 10 |
+----------+----+
```

```sql
DROP TABLE doc_pit_example;
```

## Verify future-only invariance

The complete [point_in_time.py example](examples/point_in_time.py) creates its own event and label tables, reads the entire selected result and compares it with an independent literal reference. It then changes future-arriving values and future-ready labels and requires the cutoff-3 result to remain unchanged.

```bash
python point_in_time.py
```

Expected output:

```text
cutoff 3: [(1,10),(2,20)]; cutoff 4: [(1,10)]; future-only invariance verified
```

Extend the same contract to versioned dimensions: require valid_from <= cutoff < valid_to and recorded_time <= cutoff, choose a deterministic visible version and verify one dimension row per entity/anchor. Require label_ready_time <= the training cutoff independently of label event time.

## Corrections and incremental aggregates

A correction is a replacement, not another observation to add. For an incrementally maintained aggregate, subtract the prior accepted contribution, add the new contribution and publish the state and affected aggregate in the same transaction. Deletion removes a contribution.

The [business seeds](business-analysis.md) demonstrate a correction and rollback with a complete source readback. For a durable incremental service, also persist the processed delivery key/checkpoint and compare the incremental aggregate with a fresh full recomputation after replay. A UNIQUE delivery key helps deduplicate messages but does not define event-time lateness or checkpoint recovery on its own.
