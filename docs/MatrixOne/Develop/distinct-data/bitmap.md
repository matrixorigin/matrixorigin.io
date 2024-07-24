# Deduplication of data using BITMAP

Matrixone supports the use [`of BITMAP`](../../Reference/Functions-and-Operators/Aggregate-Functions/bitmap.md) for counting different values (distinct values).

This article will cover some of `BITMAP`'s application scenarios and cases.

## Application scenarios

In MatrixOne, `BITMAP` is used to optimize specific types of query operations, especially when dealing with columns with low cardinality, helping users achieve fast data analysis and decision support in big data environments. Here are some scenarios for using `BITMAP`:

1. **User Behavior Analysis**: Suppose an e-commerce platform wants to analyze the behavior patterns of different users. They have an event table that records every click event a user has, including user ID, timestamp, event type, etc. By using `BITMAP`, it is possible to quickly categorize and count the behavior of users, e.g. to find out the number of users who have all made a "purchase" behavior.

2. **Multidimensional analysis**: In a data warehouse, it is often necessary to analyze multiple dimensions, such as sales in different regions over a given time period. With `BITMAP`, the two dimensions of date and region can be quickly filtered to improve query efficiency.

3. **Counting different values**: When working with columns with a large number of unique values, such as product category or user status, `BITMAP` allows you to efficiently calculate the number of different values in those columns. For example, a social media platform may need to count different numbers of its users active (online, offline).

4. **Hierarchical aggregation acceleration**: `BITMAP` accelerates the calculation process when hierarchical aggregation queries are required, such as quarterly and annual aggregation of sales data. By using `BITMAP`, data can be grouped and aggregated quickly to get the statistics you need.

5. **Optimize complex queries**: For complex queries with multiple criteria, `BITMAP` can quickly filter out eligible data. For example, a financial firm may need to identify users who satisfy both "high net worth clients" and "invest in specific funds".

## Prepare before you start

Completed [standalone deployment of](../../Get-Started/install-standalone-matrixone.md) MatrixOne.

## Cases

According to the above scenario one design case,the behavior patterns of different users of e-commerce platform are analyzed.

### Steps

#### 1. Create user tables and import data

Prepare a table named `user_behavior_table` and the corresponding csv data, which has 39270760 rows of data.

```sql
CREATE TABLE user_behavior_table(
user_id int,--user id 
behavior varchar(100),--behavior, including browser,purchase,returns
occur_year varchar(100)----behavior occurred year
);

LOAD DATA INFILE '/your_path/user_behavior_table.csv' INTO TABLE user_behavior_table FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"';
```

#### 2. Define the precalculation table

The coarse-grained calculation results are saved in the pre-computed table.Subsequent aggregation of various different dimensions can use the results in the pre-computed table.After simple calculation,the results can be obtained and the query can be accelerated.

```sql
CREATE TABLE precompute AS
SELECT
  behavior,
  occur_year,
  BITMAP_BUCKET_NUMBER(user_id) as bucket,
  BITMAP_CONSTRUCT_AGG(BITMAP_BIT_POSITION(user_id)) as bitmap 
FROM user_behavior_table
GROUP BY  behavior,occur_year,bucket;
```

#### 3. Aggregate filter data by different dimensions

Calculates the number of deduplications for user\_id in case of user behavior and year aggregation, reflecting the number of users who browsed, purchased, and returned items in different years.

```sql
mysql> SELECT
    ->     behavior,
    ->     occur_year,
    ->     SUM(BITMAP_COUNT(bitmap))
    ->     FROM precompute
    ->     GROUP BY  behavior,occur_year;
+----------+------------+---------------------------+
| behavior | occur_year | sum(bitmap_count(bitmap)) |
+----------+------------+---------------------------+
| browser  | 2022       |                    939995 |
| browser  | 2023       |                   1003173 |
| purchase | 2022       |                    669474 |
| purchase | 2023       |                    660605 |
| returns  | 2023       |                      4910 |
| returns  | 2022       |                      4350 |
+----------+------------+---------------------------+
6 rows in set (0.01 sec)

mysql> select behavior,occur_year,count(distinct user_id) from user_behavior_table group by behavior,occur_year;
+----------+------------+---------------------------+
| behavior | occur_year | sum(bitmap_count(bitmap)) |
+----------+------------+---------------------------+
| browser  | 2022       |                    939995 |
| browser  | 2023       |                   1003173 |
| purchase | 2022       |                    669474 |
| purchase | 2023       |                    660605 |
| returns  | 2023       |                      4910 |
| returns  | 2022       |                      4350 |
+----------+------------+---------------------------+
6 rows in set (3.26 sec)
```

Calculate the number of users viewing, purchasing, and returning items from 2022-2023.

```sql
mysql> SELECT behavior, SUM(cnt) FROM (
    -> SELECT
    -> behavior,
    -> BITMAP_COUNT(BITMAP_OR_AGG(bitmap)) cnt
    -> FROM precompute
    -> GROUP BY behavior,bucket
    -> )
    -> GROUP BY behavior;
+----------+----------+
| behavior | sum(cnt) |
+----------+----------+
| browser  |  1003459 |
| purchase |   780308 |
| returns  |     9260 |
+----------+----------+
3 rows in set (0.01 sec)

mysql> select behavior,count(distinct user_id) from user_behavior_table group by behavior;
+----------+-------------------------+
| behavior | count(distinct user_id) |
+----------+-------------------------+
| browser  |                 1003459 |
| purchase |                  780308 |
| returns  |                    9260 |
+----------+-------------------------+
3 rows in set (1.44 sec)
```

It is obviously more efficient to use `BITMAP` when comparing the return times of the two queries. By using `BITMAP`, merchants can quickly filter out specific types of events to count the total number of users with a certain behavior.

## Reference Documents

- [BITMAP](../../Reference/Functions-and-Operators/Aggregate-Functions/bitmap.md)
- [COUNT](../../Reference/Functions-and-Operators/Aggregate-Functions/count.md)
