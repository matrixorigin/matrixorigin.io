# Time window

In a timing scenario, data is usually streamed, and streamed data is usually endless. We can't know when the data source will continue/stop sending data, so processing aggregate events (count, sum, etc.) on a stream will be handled differently than in a batch. Time windows (Windows) are generally used on time-series data streams to limit the scope of aggregations, such as Count of Website Hits in the Last 2 Minutes. The concept of a time window is equivalent to helping us collect a dynamic table of finite data based on acquisition time, and we can aggregate the data in the table. Over time, this window slides forward, continuously capturing new data for calculations.

The time window is divided into Tumble Window and Sliding Window. Tumble Window has a fixed time window length with no overlap in each window time. Sliding Window's time window length is also fixed, but there is overlap between the windows to capture data changes more frequently.

When users use the time window feature, they can do calculations within each time window, which slides forward as time passes. When defining a continuous query, you need to specify the size of the time window and the incremental time the next window goes forward.

## Downsampling

Downsampling refers to the process of extracting smaller, more manageable subsets of data from large amounts of data. This is especially important when dealing with large-scale time series data, reducing storage requirements, improving query efficiency, and providing clearer trend maps in data visualization. The time window function is the core capability of the database to implement the downsampling function. By defining the time window, we can aggregate the data within each window to achieve downsampling. The size of the time window and the sliding distance determine the granularity of the downsampling.

## Timesheet and Time Window Syntax

In MatrixOne, a time window needs to be used in conjunction with a timing table, which is a table that must have `ts` as the primary key when it is built and is of type `timestamp`.

```sql
DDL Clause:
    CREATE TABLE TS_TBL (ts timestamp(6) primary key, SIGNAL1 FLOAT, SIGNAL2 DOUBLE, ...);

time_window_clause:
	INTERVAL(timestamp_col, interval_val, time_unit) [SLIDING (sliding_val)] [fill_clause]

time_unit:
	SECOND | MINUTE | HOUR | DAY

fill_clause:
	FILL(NONE | PREV | NEXT | NULL | VALUE, val | LINEAR)
```

When creating a timing table, the `ts` column can specify the precision of `timestamp` up to `timestamp(6)` (microsecond level).

Parameter meaning in INTERVAL statement:

* timestamp_col: timestamp column.
* interval_val: length of the time window.
* time_unit: unit of time (seconds, minutes, hours, days).
* SLIDING (sliding_val): Optionally, specifies the time distance the window slides.
* FILL(fill_method): Optionally, specifies how to populate the data within the window.

INTERVAL (timestamp_col, interval_val) acts on the data to produce the equivalent time period interval_val window, and SLIDING is used to specify the sliding_val time distance the window slides forward.

- Tumble window when interval_val equals sliding_val.

- Sliding window when interval_val is greater than sliding_val.

Other instructions for use:

- The INTERVAL and SLIDING clauses need to be used in conjunction with aggregate or select functions, which are currently supported in the time window: max, min, sum, avg, count aggregate functions.
- The window width of the aggregation time period is specified by the keyword INTERVAL with a minimum interval of 1 second.
- The time series increases strictly monotonously in the results returned by the time window.
- interval\_val must be a positive integer.
- When querying with INTERVAL, \_wstart(ts), \_wend(ts) are pseudo-columns generated from the window, the start and end times of the window, respectively.

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

## interpolation

Missing values are often encountered when processing timing data. The interpolation (FILL) feature allows us to populate these missing values in a variety of ways, ensuring continuity and integrity of the data, which is critical to the data analysis and downsampling process. The `FIll` clause of the time window acts to populate the aggregate results.

MatrixOne offers several interpolation methods to accommodate different data processing needs:

- FILL(NONE): No padding, i.e. column unchanged
- FILL(VALUE, expr): Populate expr results
- FILL(PREV): Populate data with previous non-NULL value
- FILL(NEXT): Populate data with next non-NULL value
- FILL(LINEAR): Linear interpolation padding based on nearest non-NULL value before and after

Example of use:

This example adds interpolation logic to the previous table and populates it with NULL values.

```sql
select _wstart(ts), _wend(ts), max(temperature), min(temperature) from sensor_data where ts > "2023-08-01 00:00:00.000" and ts < "2023-08-01 00:50:00.000" interval(ts, 10, minute) sliding(5, minute) fill(prev);
         _wstart         |          _wend          |   max(temperature)   |   min(temperature)   |
==================================================================================================
 2023-08-01 00:00:00.000 | 2023-08-01 00:10:00.000 |           26.0000000 |           26.0000000 |
 2023-08-01 00:05:00.000 | 2023-08-01 00:15:00.000 |           26.0000000 |           26.0000000 |
 2023-08-01 00:10:00.000 | 2023-08-01 00:20:00.000 |           28.0000000 |           28.0000000 |
 2023-08-01 00:15:00.000 | 2023-08-01 00:25:00.000 |           30.0000000 |           28.0000000 |
 2023-08-01 00:20:00.000 | 2023-08-01 00:30:00.000 |           30.0000000 |           27.0000000 |
 2023-08-01 00:25:00.000 | 2023-08-01 00:35:00.000 |           27.0000000 |           27.0000000 |
 2023-08-01 00:30:00.000 | 2023-08-01 00:40:00.000 |           27.0000000 |           27.0000000 |
 2023-08-01 00:35:00.000 | 2023-08-01 00:45:00.000 |           28.0000000 |           28.0000000 |
 2023-08-01 00:40:00.000 | 2023-08-01 00:50:00.000 |           38.0000000 |           28.0000000 |
 2023-08-01 00:45:00.000 | 2023-08-01 00:55:00.000 |           38.0000000 |           38.0000000 |
```