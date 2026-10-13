# Calendar and rolling features

A row-based window does not automatically represent consecutive calendar days. Build the calendar grain explicitly when missing days must occupy a position in the lookback.

## Preserve missingness before applying a window

```sql
CREATE TABLE doc_calendar(day INT PRIMARY KEY);
CREATE TABLE doc_readings(day INT PRIMARY KEY,v DOUBLE);
INSERT INTO doc_calendar VALUES(1),(2),(3),(4);
INSERT INTO doc_readings VALUES(1,10),(3,30),(4,NULL);

mysql> WITH daily AS (
    SELECT c.day,r.v,CASE WHEN r.day IS NULL THEN 0 ELSE 1 END row_present
    FROM doc_calendar c LEFT JOIN doc_readings r ON c.day=r.day
)
SELECT day,row_present,
       COUNT(v) OVER(ORDER BY day ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) n_valid,
       AVG(v) OVER(ORDER BY day ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) mean_value
FROM daily ORDER BY day;
+-----+-------------+---------+------------+
| day | row_present | n_valid | mean_value |
+-----+-------------+---------+------------+
| 1   | 1           | 1       | 10         |
| 2   | 0           | 1       | 10         |
| 3   | 1           | 1       | 30         |
| 4   | 1           | 1       | 30         |
+-----+-------------+---------+------------+
```

Day 2 has no observation row. Day 4 has an observation row with a missing value. Neither means a measured zero. To require two valid observations, return NULL when n_valid < 2 using an outer SELECT or CTE.

```sql
DROP TABLE doc_readings;
DROP TABLE doc_calendar;
```

For several entities, create one entity/day anchor row, use LEFT JOIN to retain empty anchors, and partition windows by entity. Preaggregate duplicate events to the required daily grain first.

## Native time buckets and streaming boundaries

The [native time-window guide](../../Develop/read-data/window-function/time-window.md) covers INTERVAL, SLIDING and FILL. The [window guide](../../Develop/read-data/window-function/window-function.md) covers SQL OVER. Native SQL buckets and calendar densification are distinct techniques.

Forward/backward/linear filling changes aggregate estimates. NEXT or interpolation using a later endpoint can leak future information into a historical predictive feature; choose a policy appropriate to a strictly known-at-time feature.

A bounded SQL snapshot does not provide arrival-time watermarks, continuous session merging or restart recovery. The [connector guide](connectors.md) separates the tested Spark streaming supplement from the bounded Flink example. Late revisions require recomputing affected buckets or maintaining explicitly versioned state.
