# Time window

Time windows aggregate timestamped rows into fixed periods, such as website hits per minute. An `INTERVAL` query reads the rows visible to that query and returns aggregates for their time buckets.

The time window is divided into Tumble Window and Sliding Window. Tumble Window has a fixed time window length with no overlap in each window time. Sliding Window's time window length is also fixed, but there is overlap between the windows to capture data changes more frequently.

`SLIDING` specifies the distance between consecutive window starts. It does not make a SELECT continuously subscribe to incoming rows. Event-time watermarks, late-event policies and checkpoint recovery belong to a separately configured stream-processing pipeline.

## Downsampling

Downsampling refers to the process of extracting smaller, more manageable subsets of data from large amounts of data. This is especially important when dealing with large-scale time series data, reducing storage requirements, improving query efficiency, and providing clearer trend maps in data visualization. The time window function is the core capability of the database to implement the downsampling function. By defining the time window, we can aggregate the data within each window to achieve downsampling. The size of the time window and the sliding distance determine the granularity of the downsampling.

## Timesheet and Time Window Syntax

In MatrixOne, a time window needs to be used in conjunction with a timing table, which is a table that must have `ts` as the primary key when it is built and is of type `timestamp`.

```
DDL Clause:
    CREATE TABLE TS_TBL (ts timestamp(6) primary key, SIGNAL1 FLOAT, SIGNAL2 DOUBLE, ...);

time_window_clause:
    INTERVAL(timestamp_col, interval_val, time_unit)
    [SLIDING(sliding_val, time_unit)] [fill_clause]

time_unit:
    SECOND | MINUTE | HOUR | DAY

fill_clause:
    FILL(NONE) | FILL(PREV) | FILL(NEXT) | FILL(LINEAR) | FILL(VALUE, expr)
```

When creating a timing table, the `ts` column can specify the precision of `timestamp` up to `timestamp(6)` (microsecond level).

Parameter meaning in INTERVAL statement:

* timestamp_col: timestamp column.
* interval_val: length of the time window.
* time_unit: unit of time (seconds, minutes, hours, days).
* SLIDING(sliding_val, time_unit): Optionally, specifies the distance between window starts, for example `SLIDING(5, MINUTE)`.
* FILL(fill_method): Optionally, specifies how to populate the data within the window.

`INTERVAL(timestamp_col, interval_val, time_unit)` specifies the window width. Without `SLIDING`, consecutive windows have that same distance between starts. With `SLIDING`, compare width and distance in the same units:

- Tumble window when interval_val equals sliding_val.

- Sliding window when interval_val is greater than sliding_val.

Other instructions for use:

- The INTERVAL and SLIDING clauses need to be used in conjunction with aggregate or select functions, which are currently supported in the time window: max, min, sum, avg, count aggregate functions.
- The window width of the aggregation time period is specified by the keyword INTERVAL with a minimum interval of 1 second.
- The time series increases strictly monotonously in the results returned by the time window.
- interval\_val must be a positive integer.
- When querying with `INTERVAL`, `_wstart` and `_wend` are generated pseudocolumns containing the window start and end. Select them directly; they are not function calls and do not take `ts` as an argument.

The bare pseudocolumn syntax and the examples below were checked against MatrixOne commit `23d8f61252f3017dff218b530817a240206fd762`. Record the session timezone when comparing timestamp output. These examples set it to UTC:

```sql
SET time_zone = '+00:00';
```

Example of use:

This example demonstrates how to slide every 5 minutes over a 10-minute time window, giving a maximum and minimum temperature every 5 minutes.

```sql
mysql> drop table if exists sensor_data;
CREATE TABLE sensor_data (ts timestamp(3) primary key, temperature FLOAT);
INSERT INTO sensor_data VALUES('2023-08-01 00:00:00', 25.0);
INSERT INTO sensor_data VALUES('2023-08-01 00:05:00', 26.0);
INSERT INTO sensor_data VALUES('2023-08-01 00:15:00', 28.0);
INSERT INTO sensor_data VALUES('2023-08-01 00:20:00', 30.0);
INSERT INTO sensor_data VALUES('2023-08-01 00:25:00', 27.0);
INSERT INTO sensor_data VALUES('2023-08-01 00:30:00', null);
INSERT INTO sensor_data VALUES('2023-08-01 00:35:00', null);
INSERT INTO sensor_data VALUES('2023-08-01 00:40:00', 28);
INSERT INTO sensor_data VALUES('2023-08-01 00:45:00', 38);
INSERT INTO sensor_data VALUES('2023-08-01 00:50:00', 31);
insert into sensor_data values('2023-07-31 23:55:00', 22);
mysql> select _wstart, _wend, max(temperature), min(temperature) from sensor_data where ts > "2023-08-01 00:00:00.000" and ts < "2023-08-01 00:50:00" interval(ts, 10, minute) sliding(5, minute);
+-------------------------+-------------------------+------------------+------------------+
| _wstart                 | _wend                   | max(temperature) | min(temperature) |
+-------------------------+-------------------------+------------------+------------------+
| 2023-08-01 00:00:00.000 | 2023-08-01 00:10:00.000 |               26 |               26 |
| 2023-08-01 00:05:00.000 | 2023-08-01 00:15:00.000 |               26 |               26 |
| 2023-08-01 00:10:00.000 | 2023-08-01 00:20:00.000 |               28 |               28 |
| 2023-08-01 00:15:00.000 | 2023-08-01 00:25:00.000 |               30 |               28 |
| 2023-08-01 00:20:00.000 | 2023-08-01 00:30:00.000 |               30 |               27 |
| 2023-08-01 00:25:00.000 | 2023-08-01 00:35:00.000 |               27 |               27 |
| 2023-08-01 00:30:00.000 | 2023-08-01 00:40:00.000 |             NULL |             NULL |
| 2023-08-01 00:35:00.000 | 2023-08-01 00:45:00.000 |               28 |               28 |
| 2023-08-01 00:40:00.000 | 2023-08-01 00:50:00.000 |               38 |               28 |
| 2023-08-01 00:45:00.000 | 2023-08-01 00:55:00.000 |               38 |               38 |
+-------------------------+-------------------------+------------------+------------------+
10 rows in set (0.04 sec)

```

## Interpolation

The `FILL` clause fills NULL aggregate results. It changes the result, not the source rows. For example, the all-NULL temperature window below can be filled from the previous non-NULL aggregate. A filled value is an estimate; preserve observation counts when downstream analysis needs to distinguish estimates from observations.

MatrixOne offers several interpolation methods to accommodate different data processing needs:

- FILL(NONE): No padding, i.e. column unchanged
- FILL(VALUE, expr): Populate expr results
- FILL(PREV): Populate data with previous non-NULL value
- FILL(NEXT): Populate data with next non-NULL value
- FILL(LINEAR): Linear interpolation padding based on nearest non-NULL value before and after

Example of use:

This example fills the all-NULL aggregate results in the previous table with the preceding non-NULL aggregate values.

```sql
mysql> SELECT _wstart, _wend, MAX(temperature), MIN(temperature)
FROM sensor_data
WHERE ts > '2023-08-01 00:00:00.000' AND ts < '2023-08-01 00:50:00.000'
INTERVAL(ts, 10, MINUTE) SLIDING(5, MINUTE) FILL(PREV);
+---------------------+---------------------+------------------+------------------+
| _wstart             | _wend               | max(temperature) | min(temperature) |
+---------------------+---------------------+------------------+------------------+
| 2023-08-01 00:00:00 | 2023-08-01 00:10:00 | 26               | 26               |
| 2023-08-01 00:05:00 | 2023-08-01 00:15:00 | 26               | 26               |
| 2023-08-01 00:10:00 | 2023-08-01 00:20:00 | 28               | 28               |
| 2023-08-01 00:15:00 | 2023-08-01 00:25:00 | 30               | 28               |
| 2023-08-01 00:20:00 | 2023-08-01 00:30:00 | 30               | 27               |
| 2023-08-01 00:25:00 | 2023-08-01 00:35:00 | 27               | 27               |
| 2023-08-01 00:30:00 | 2023-08-01 00:40:00 | 27               | 27               |
| 2023-08-01 00:35:00 | 2023-08-01 00:45:00 | 28               | 28               |
| 2023-08-01 00:40:00 | 2023-08-01 00:50:00 | 38               | 28               |
| 2023-08-01 00:45:00 | 2023-08-01 00:55:00 | 38               | 38               |
+---------------------+---------------------+------------------+------------------+
```

After completing the examples, remove the tutorial table:

```sql
DROP TABLE sensor_data;
```
