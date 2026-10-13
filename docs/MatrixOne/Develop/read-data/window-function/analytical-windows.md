# Analytical windows: frames, NULLs and migration

The examples on this page were verified on MatrixOne commit `23d8f61252f3017dff218b530817a240206fd762`. Record your server revision when reproducing them. Function availability and parameter correctness are separate concerns. The reviewed 3.0-dev grammar at `b2c51d10f9a2829629fe14b9edab79c9b02a2780` does not accept NTILE or named WINDOW syntax; the main-revision examples for those features are provided separately below.

Run the examples in a dedicated test database. SQL performs the window calculations in MatrixOne; the expected values below describe the complete result, including NULLs.

## Rankings and peer groups

```sql
CREATE TABLE doc_window_values(id INT PRIMARY KEY, tick INT, v DOUBLE);
INSERT INTO doc_window_values VALUES (1,0,1),(2,0,2),(3,1,4),(4,3,8);
```

```sql
mysql> SELECT id,
       ROW_NUMBER() OVER(ORDER BY tick,id) row_num,
       RANK() OVER(ORDER BY tick) rank_num,
       DENSE_RANK() OVER(ORDER BY tick) dense_num,
       PERCENT_RANK() OVER(ORDER BY tick) relative_rank,
       CUME_DIST() OVER(ORDER BY tick) cumulative_fraction
FROM doc_window_values ORDER BY id;
+----+---------+----------+-----------+--------------------+---------------------+
| id | row_num | rank_num | dense_num | relative_rank      | cumulative_fraction |
+----+---------+----------+-----------+--------------------+---------------------+
| 1  | 1       | 1        | 1         | 0                  | 0.5                 |
| 2  | 2       | 1        | 1         | 0                  | 0.5                 |
| 3  | 3       | 3        | 2         | 0.6666666666666666 | 0.75                |
| 4  | 4       | 4        | 3         | 1                  | 1                   |
+----+---------+----------+-----------+--------------------+---------------------+
```

Ranking orders contain only tick, preserving peer groups. The row-number order also contains id, making row identity deterministic. The final ORDER BY controls presentation; the window order alone does not guarantee result-set order. On the tested main revision, NTILE(2) with ORDER BY tick,id assigns buckets 1,1,2,2; see the [complete main-revision fixture](main-window-features.sql).

## ROWS versus RANGE

ROWS counts physical rows in the window order. RANGE uses the ordering value and includes peers at the same value.

```sql
mysql> SELECT id,
       SUM(v) OVER(
           ORDER BY tick,id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW
       ) rows_sum,
       SUM(v) OVER(
           ORDER BY tick RANGE BETWEEN 1 PRECEDING AND CURRENT ROW
       ) range_sum
FROM doc_window_values ORDER BY id;
+----+----------+-----------+
| id | rows_sum | range_sum |
+----+----------+-----------+
| 1  | 1        | 3         |
| 2  | 3        | 3         |
| 3  | 6        | 7         |
| 4  | 12       | 8         |
+----+----------+-----------+
```

For id=1, RANGE includes both tick=0 rows. For id=4, [2,3] contains only tick=3, whereas ROWS also includes the preceding tick=1 row.

A DATETIME INTERVAL RANGE offset was also verified:

```sql
CREATE TABLE doc_window_times(id INT PRIMARY KEY, ts DATETIME, v DOUBLE);
INSERT INTO doc_window_times VALUES
(1,'2024-01-01 00:00:00',1),(2,'2024-01-01 00:00:00',2),
(3,'2024-01-01 00:01:00',4),(4,'2024-01-01 00:03:00',8);

mysql> SELECT id,SUM(v) OVER(
    ORDER BY ts RANGE BETWEEN INTERVAL 1 MINUTE PRECEDING AND CURRENT ROW
) total
FROM doc_window_times ORDER BY id;
+----+-------+
| id | total |
+----+-------+
| 1  | 3     |
| 2  | 3     |
| 3  | 7     |
| 4  | 8     |
+----+-------+
```

Expected totals in id order: 3, 3, 7, 8. When migrating a time-based rolling calculation, match the units and boundary inclusion explicitly.

## Navigation and explicit full frames

```sql
mysql> SELECT id,
       LAG(v) OVER(ORDER BY id) prev_v,
       LEAD(v) OVER(ORDER BY id) next_v,
       FIRST_VALUE(v) OVER(
           ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
       ) first_v,
       LAST_VALUE(v) OVER(
           ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
       ) last_v,
       NTH_VALUE(v,2) OVER(
           ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
       ) second_v
FROM doc_window_values ORDER BY id;
+----+--------+--------+---------+--------+----------+
| id | prev_v | next_v | first_v | last_v | second_v |
+----+--------+--------+---------+--------+----------+
| 1  | NULL   | 2      | 1       | 8      | 2        |
| 2  | 1      | 4      | 1       | 8      | 2        |
| 3  | 2      | 8      | 1       | 8      | 2        |
| 4  | 4      | NULL   | 1       | 8      | 2        |
+----+--------+--------+---------+--------+----------+
```

The explicit full frame makes last_v equal to 8 on every row. LAG and LEAD navigate the partition; an aggregate frame does not turn them into ClickHouse lagInFrame/leadInFrame. A LEAD-derived predictive feature can expose future information: apply event-time and arrival-visibility cutoffs before navigation.

On the tested build, explicit untyped NULL defaults in LAG/LEAD can produce a recovered internal error on a multi-partition fixture. A typed NULL default can execute but incorrectly return zero. See [the NULL-default issue](https://github.com/matrixorigin/matrixone/issues/29925). Omitted-default controls returned correct NULLs on that fixture; typed NULL is not a correct workaround. Verify the target release and complete values before adopting a workaround.

## NULLs and minimum observations

COUNT(*) counts rows; COUNT(v) counts non-NULL observations. Missing values and missing rows are different.

```sql
CREATE TABLE doc_window_nulls(id INT PRIMARY KEY, v DOUBLE);
INSERT INTO doc_window_nulls VALUES (1,NULL),(2,2),(3,NULL);

mysql> SELECT id,
       COUNT(*) OVER(ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) n_rows,
       COUNT(v) OVER(ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) n_valid,
       SUM(v) OVER(ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) total,
       FIRST_VALUE(v) OVER(
           ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
       ) first_v
FROM doc_window_nulls ORDER BY id;
+----+--------+---------+-------+---------+
| id | n_rows | n_valid | total | first_v |
+----+--------+---------+-------+---------+
| 1  | 1      | 0       | NULL  | NULL    |
| 2  | 2      | 1       | 2     | NULL    |
| 3  | 2      | 1       | 2     | NULL    |
+----+--------+---------+-------+---------+
```

FIRST_VALUE retains the first NULL in this fixture. To impose a minimum number of valid observations, calculate n_valid and the statistic in a CTE, then conditionally return the statistic. COUNT(*) alone does not implement a valid-observation threshold.

## Frame reuse and named windows

```sql
mysql> SELECT id,
       SUM(v) OVER(ORDER BY tick,id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) total,
       COUNT(v) OVER(ORDER BY tick,id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) n_valid
FROM doc_window_values
ORDER BY id;
+----+-------+---------+
| id | total | n_valid |
+----+-------+---------+
| 1  | 1     | 1       |
| 2  | 3     | 2       |
| 3  | 6     | 2       |
| 4  | 12    | 2       |
+----+-------+---------+
```

Expected (id,total,n_valid): (1,1,1), (2,3,2), (3,6,2), (4,12,2). Keep the frame identical across statistics. On the tested main revision, `WINDOW recent AS (ORDER BY tick,id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW)` permits `SUM(v) OVER recent` and `COUNT(v) OVER recent`. The [main-revision fixture](main-window-features.sql) demonstrates the named form and inheritance from a partition-only window; use inline frames on releases whose grammar does not accept it.

## Composed rolling weighted mean

This recipe uses SUM windows, not a native WAVG function. Both numerator and denominator use the same valid (value,weight) pairs.

```sql
CREATE TABLE doc_window_weights(id INT PRIMARY KEY,v DOUBLE,w DOUBLE);
INSERT INTO doc_window_weights VALUES (1,10,1),(2,20,3),(3,NULL,2),(4,40,0);

mysql> WITH statistics AS (
    SELECT id,
           SUM(v*w) OVER(ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) numerator,
           SUM(CASE WHEN v IS NOT NULL AND w IS NOT NULL THEN w END)
               OVER(ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) denominator,
           COUNT(CASE WHEN v IS NOT NULL AND w IS NOT NULL THEN 1 END)
               OVER(ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) n_pairs
    FROM doc_window_weights
)
SELECT id,n_pairs,numerator/NULLIF(denominator,0) weighted_mean
FROM statistics ORDER BY id;
+----+---------+---------------+
| id | n_pairs | weighted_mean |
+----+---------+---------------+
| 1  | 1       | 10            |
| 2  | 2       | 17.5          |
| 3  | 1       | 20            |
| 4  | 1       | NULL          |
+----+---------+---------------+
```

A zero-weight row is a valid pair but contributes no weight. This profile assumes finite, nonnegative weights. Define your policy for negative weights and a zero denominator.

For covariance/correlation rewrites, use pairwise-valid x/y observations, specify sample or population denominators and handle zero variance. SUM-based identities can lose precision for large offsets with small variation; compare with an independent stable reference.

## Migration boundaries

| Area | Verified behavior or adaptation |
|---|---|
| GROUPS, EXCLUDE, IGNORE NULLS, window DISTINCT, FILTER | Rejected on the tested revision. Check availability by release; see the [feature roadmap](https://github.com/matrixorigin/matrixone/issues/29950). |
| ClickHouse frame-aware navigation | lagInFrame/leadInFrame differ from partition-based LAG/LEAD. |
| FIRST_VALUE/LAST_VALUE NULLs | ClickHouse defaults can differ from the NULL-retaining MO fixture; match the policy explicitly. |
| DolphinDB m/tm/cum | Match output shape, minPeriods, time boundaries, visibility of peer timestamps and reset policies. |
| Local rank and TopN | Partition-wide RANK is not a local rolling rank. Specify oldest/latest/all tie policies. |
| Variance/skewness/kurtosis | Specify sample/population, bias correction and Pearson/excess conventions. |
| Dedicated kernels versus composed SQL | An expressible formula does not establish equal incremental complexity or speed. |

See [native time windows](time-window.md) for INTERVAL, SLIDING and FILL. Rejected advanced OVER syntax does not mean native time-window aggregation is absent.

## Cleanup

```sql
DROP TABLE doc_window_weights;
DROP TABLE doc_window_nulls;
DROP TABLE doc_window_times;
DROP TABLE doc_window_values;
```
