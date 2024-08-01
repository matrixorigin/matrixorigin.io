# BITMAP function

## Function Description

A `BITMAP` function is a set of built-in functions for processing bitmaps, which are contiguous pieces of memory stored as binary data types. These functions are particularly useful for counting distinct values when dealing with hierarchical aggregations, such as multiple grouped sets, and return results consistent with [`count (distinct`]( count.md)), but more efficiently.

We can use only one bit to identify the presence or absence of an element, 1 for presence or 0 for absence, and the nth bit of bitmap to record whether the element exists.

We specify that the maximum width of bitmap is 32768 (2^15 = 4K), and for non-negative integer n, take its lower 15 bits (binary) as the position in bitmap and the other high bits as the number of the bitmap bucket. The following diagram shows the logic of bitmap:

![](https://github.com/matrixorigin/artwork/blob/main/docs/reference/bitmap.png?raw=true)

Each bucket is a bitmap, and since the buckets are orthogonal, each bucket doing the operation (or,bit_count) can be done only in the current bucket, regardless of the other buckets.

Here are some common `BITMAP` functions and their usage:

### BITMAP_BUCKET_NUMBER

The purpose of the `BITMAP_BUCKET_NUMBER()` function is to determine the number of the bucket to which the given value belongs. A bucket is a larger set of bits that can contain multiple bits, each representing a specific value in the data set. This function returns the number of the bucket. A bucket number is typically used to group bitmaps when performing aggregation operations.

#### Grammar

```
> BITMAP_BUCKET_NUMBER(numeric_expr)
```

#### Parameter interpretation

| Parameters | Description |
| ---- | ---- |
| numeric_expr | Required. Expressions that can be cast into non-negative integers. |

#### Examples

```sql
mysql> SELECT bitmap_bucket_number(0);-- Returns 0, indicating that it belongs to the first bucket, which records the position 0-32767.
+-------------------------+
| bitmap_bucket_number(0) |
+-------------------------+
|                       0 |
+-------------------------+
1 row in set (0.00 sec)

mysql> SELECT bitmap_bucket_number(32767);-- Returns 0, since 32767 belongs to the end of the first bucket
+-----------------------------+
| bitmap_bucket_number(32767) |
+-----------------------------+
|                           0 |
+-----------------------------+
1 row in set (0.00 sec)

mysql> SELECT bitmap_bucket_number(32768);-- Returns 1, since 32768 is the starting position of the second bucket
+-----------------------------+
| bitmap_bucket_number(32768) |
+-----------------------------+
|                           1 |
+-----------------------------+
1 row in set (0.00 sec)
```

### BITMAP_BIT_POSITION

The `BITMAP_BIT_POSITION()` function returns the relative bit position of the given value in the bucket (indexed from 0 to 32767). Used with `BITMAP_BUCKET_NUMBER()` to uniquely identify any number in the bitmap. Because the actual `BITMAP_BIT_POSITION()` marks the lower 15 bits of the parameter (in binary), `BITMAP_BUCKET_NUMBER()` marks the higher bits of the parameter.

#### Grammar

```
BITMAP_BIT_POSITION(numeric_expr) 
```

#### Parameter interpretation

| Parameters | Description |
| ---- | ---- |
| numeric_expr | Required. Expressions that can be cast into non-negative integers. |

#### Examples

```sql
mysql> SELECT bitmap_bit_position(0);-- Returns 0, since 0 is in the first position of the first bucket
+------------------------+
| bitmap_bit_position(0) |
+------------------------+
|                      0 |
+------------------------+
1 row in set (0.00 sec)

mysql> SELECT bitmap_bit_position(32767);-- Returns 32767, since 32767 is the last position in the first bucket
+----------------------------+
| bitmap_bit_position(32767) |
+----------------------------+
|                      32767 |
+----------------------------+
1 row in set (0.00 sec)

mysql> SELECT bitmap_bit_position(32768);-- returns 0 because 32768 is in the first position of the second bucket
+----------------------------+
| bitmap_bit_position(32768) |
+----------------------------+
|                          0 |
+----------------------------+
1 row in set (0.00 sec)

--The binary of 40000 is: 1001110001000000, bitmap_bit_position records the lower 15 bits: 001110001000000, and bitmap_bucket_number records the higher 1 bit.
mysql> select bin(bitmap_bucket_number(40000)), bin(bitmap_bit_position(40000)),bin(40000);
+----------------------------------+---------------------------------+------------------+
| bin(bitmap_bucket_number(40000)) | bin(bitmap_bit_position(40000)) | bin(40000)       |
+----------------------------------+---------------------------------+------------------+
| 1                                | 1110001000000                   | 1001110001000000 |
+----------------------------------+---------------------------------+------------------+
1 row in set (0.01 sec)
```

### BITMAP_COUNT

The `BITMAP_COUNT()` function is used to calculate the number of bits set to 1 in bitmap to get the total number of different values. This is equivalent to a `COUNT (DISTINCT)` operation on a bitmap, but is usually faster than a traditional `COUNT (DISTINCT`) query.

The `BITMAP_COUNT()` function is generally used in conjunction with the `BITMAP_CONSTRUCT_AGG()`, `BITMAP_OR_AGG()` functions described below.

### BITMAP_CONSTRUCT_AGG

`BITMAP_CONSTRUCT_AGG()` is an aggregate function that is used in the database to build bitmaps.

The `BITMAP_CONSTRUCT_AGG()` function is useful when you need to count a dense set of non-repeating integer values because it efficiently converts those values into bitmap form.

#### Grammar

```
BITMAP_CONSTRUCT_AGG( <bit_position> )
```

#### Parameter interpretation

| Parameters | Description |
| ---- | ---- |
| bit_position | Required. Location in bitmap (returned by BITMAP_BIT_POSITION function) |

#### Examples

```sql
CREATE TABLE t1 ( n1 int);
INSERT INTO t1 VALUES(0),(1),(1),(32767);--Inserted data in [0,32767].

mysql> select * from t1;
+-------+
| n1    |
+-------+
|     0 |
|     1 |
|     1 |
| 32767 |
+-------+
4 rows in set (0.01 sec)

mysql> SELECT BITMAP_CONSTRUCT_AGG(BITMAP_BIT_POSITION(n1)) AS bitmap FROM t1;
+------------------------+
| bitmap                 |
+------------------------+
| :0              ?  |
+------------------------+
1 row in set (0.00 sec)
```

!!! note
    bitmap column contains the physical representation of bitmap and is not readable. To determine which bits are set, we should use a combination of `BITMAP` functions (rather than checking binary values ourselves).

```sql
mysql> SELECT bitmap_count(BITMAP_CONSTRUCT_AGG(BITMAP_BIT_POSITION(n1))) AS n1_discnt FROM t1;The number set to 1 in the --bitmap.
+-----------+
| n1_discnt |
+-----------+
|         3 |
+-----------+
1 row in set (0.00 sec)

mysql> SELECT count(DISTINCT n1) AS n1_discnt FROM t1;--Return Consistency
+-----------+
| n1_discnt |
+-----------+
|         3 |
+-----------+
1 row in set (0.01 sec)

INSERT INTO t1 VALUES(32768),(32769),(65535);--Insert data greater than 32767

mysql> select * from t1;
+-------+
| n1    |
+-------+
|     0 |
|     1 |
|     1 |
| 32767 |
| 32768 |
| 32769 |
| 65535 |
+-------+
7 rows in set (0.01 sec)

--The result is the same as the first insertion because bucket_bit_position = n1 % 32768 and the data inserted the second time is in the same position in a different bucket than the first insertion, so it is de-emphasized.
mysql> SELECT bitmap_count(BITMAP_CONSTRUCT_AGG(BITMAP_BIT_POSITION(n1))) AS n1_discnt FROM t1;
+-----------+
| t1_bitmap |
+-----------+
|         3 |
+-----------+
1 row in set (0.00 sec)

mysql> SELECT bitmap_bit_position(0),bitmap_bit_position(1),bitmap_bit_position(32767),bitmap_bit_position(32768),bitmap_bit_position(65535);
+------------------------+------------------------+----------------------------+----------------------------+----------------------------+
| bitmap_bit_position(0) | bitmap_bit_position(1) | bitmap_bit_position(32767) | bitmap_bit_position(32768) | bitmap_bit_position(65535) |
+------------------------+------------------------+----------------------------+----------------------------+----------------------------+
|                      0 |                      1 |                      32767 |                          0 |                      32767 |
+------------------------+------------------------+----------------------------+----------------------------+----------------------------+
1 row in set (0.00 sec)
```

So you need to combine the `BITMAP_BUCKET_NUMBER()` function if you want to dedupe data larger than 32767.

```sql
--Grouped in buckets, the first bucket contains three non-repeating numbers (0,1,32767) and the second bucket contains three non-repeating numbers (32768,32769,65535).
mysql> SELECT bitmap_count(BITMAP_CONSTRUCT_AGG(BITMAP_BIT_POSITION(n1))) AS t1_bitmap FROM t1 GROUP BY BITMAP_BUCKET_NUMBER(n1);
+-----------+
| t1_bitmap |
+-----------+
|         3 |
|         3 |
+-----------+
2 rows in set (0.01 sec)

--Combine this with the sum() function to calculate the non-repeating value of n1.
mysql> SELECT SUM(t1_bitmap) FROM (
    -> SELECT bitmap_count(BITMAP_CONSTRUCT_AGG(BITMAP_BIT_POSITION(n1))) AS t1_bitmap
    -> FROM t1 
    -> GROUP BY BITMAP_BUCKET_NUMBER(n1)
    -> );
+----------------+
| sum(t1_bitmap) |
+----------------+
|              6 |
+----------------+
1 row in set (0.01 sec)
```

### BITMAP_OR_AGG

The `BITMAP_OR_AGG()` function is used to calculate the bitwise or (OR) results of multiple bitmaps. Typically used to merge multiple bitmaps to represent the combined information of all input bitmaps in one bitmap.

`BITMAP_OR_AGG()` is useful when aggregate aggregation of data of different dimensions is required, especially in data warehouses and analytic queries.

#### Grammar

```
BITMAP_OR_AGG( bitmap )
```

#### Parameter interpretation

| Parameters | Description |
| ---- | ---- |
| bitmap | Required. All bitmaps by bit or merged resulting bitmap. |

#### Examples

```sql
--Create a table to store information about the author's published books, including the author's name, the year of publication, and the book id.
CREATE TABLE book_table(
    id int auto_increment primary key,
    author varchar(100),
    pub_year varchar(100),
    book_id int
);
INSERT INTO book_table(author,pub_year,book_id) VALUES
('A author','2020',1),('A author','2020',1),('A author','2020',32768),
('A author','2021',32767),('A author','2021',32768),('A author','2021',65536),
('B author','2020',2),('B author','2020',10),('B author','2020',32769),
('B author','2021',5),('B author','2021',65539);

mysql> select * from book_table;
+------+----------+----------+---------+
| id   | author   | pub_year | book_id |
+------+----------+----------+---------+
|    1 | A author | 2020     |       1 |
|    2 | A author | 2020     |       1 |
|    3 | A author | 2020     |   32768 |
|    4 | A author | 2021     |   32767 |
|    5 | A author | 2021     |   32768 |
|    6 | A author | 2021     |   65536 |
|    7 | B author | 2020     |       2 |
|    8 | B author | 2020     |      10 |
|    9 | B author | 2020     |   32769 |
|   10 | B author | 2021     |       5 |
|   11 | B author | 2021     |   65539 |
+------+----------+----------+---------+
11 rows in set (0.00 sec)

--Define a pre-calculated table to save the results of coarse-grained calculations in the table, followed by a variety of different dimensions of aggregation can be used to pre-calculate the results of the table, after a simple calculation of the results can be obtained to accelerate the query.
CREATE TABLE precompute AS
SELECT
  author,
  pub_year,
  BITMAP_BUCKET_NUMBER(book_id) as bucket,
  BITMAP_CONSTRUCT_AGG(BITMAP_BIT_POSITION(book_id)) as bitmap 
FROM book_table
GROUP BY  author,pub_year,bucket;

mysql> select * from precompute;
+---------+----------+--------+----------------------+
| author  | pub_year | bucket | bitmap               |
+---------+----------+--------+----------------------+
| A author| 2020     |      0 | :0                |
| A author| 2020     |      1 | :0                 |
| A author| 2021     |      0 | :0            ?    |
| A author| 2021     |      1 | :0                 |
| A author| 2021     |      2 | :0                 |
| B author| 2020     |      0 | :0                |
| B author| 2020     |      1 | :0                |
| B author| 2021     |      0 | :0                |
| B author| 2021     |      2 | :0                |
+---------+----------+--------+----------------------+

--Calculates the number of book_id de-duplications in the case of author and publication year aggregation, reflecting the number of book types published by the author in different years.
--The sum() function sums the number of 1's in the bitmaps of different buckets.
--For example, when author=A author, pub_year=2020, book_id=(1,1,32768), after de-emphasis is book_id=(1,32768), but 1 is located in the first bucket, 32768 is located in the second bucket, so we need to sum for accumulation.
mysql> SELECT
    ->   author,
    ->   pub_year,
    ->   SUM(BITMAP_COUNT(bitmap))
    -> FROM precompute
    -> GROUP BY  author,pub_year;
+---------+----------+---------------------------+
| author  | pub_year | sum(bitmap_count(bitmap)) |
+---------+----------+---------------------------+
| A author| 2020     |                         2 |
| A author| 2021     |                         3 |
| B author| 2020     |                         3 |
| B author| 2021     |                         2 |
+---------+----------+---------------------------+
4 rows in set (0.00 sec)

mysql> SELECT author,pub_year,count( DISTINCT book_id) FROM book_table group by author,pub_year;--返回一致
+----------+----------+-------------------------+
| author   | pub_year | count(distinct book_id) |
+----------+----------+-------------------------+
| A author | 2020     |                       2 |
| A author | 2021     |                       3 |
| B author | 2020     |                       3 |
| B author | 2021     |                       2 |
+----------+----------+-------------------------+
4 rows in set (0.00 sec)

--Calculates the number of book_id de-duplications in the case of author aggregation, reflecting the number of book types published by the author in total.
--The BITMAP_OR_AGG() function merges bitmaps of different dimensions (same author different years).
--For example, when author=A author, pub_date=2020, book_id is (1,32768) after de-weighting, when pub_date=2021, book_id is (32767,32768,65536) after de-weighting, BITMAP_OR_AGG do or operation on the bitmap of the two different years to get book_id=(1,32767,32768,65536), finally sum() accumulates book_id of different bucktets.
mysql> SELECT author, SUM(cnt) FROM (
    ->   SELECT
    ->     author,
    ->     BITMAP_COUNT(BITMAP_OR_AGG(bitmap)) cnt
    ->   FROM precompute
    ->   GROUP BY author,bucket
    -> )
    -> GROUP BY author;
+---------+----------+
| author  | sum(cnt) |
+---------+----------+
| A author|        4 |
| B author|        5 |
+---------+----------+
2 rows in set (0.01 sec)

mysql> SELECT author,count(DISTINCT book_id) FROM book_table GROUP BY author;--Return Consistency
+----------+-------------------------+
| author   | count(distinct book_id) |
+----------+-------------------------+
| A author |                       4 |
| B author |                       5 |
+----------+-------------------------+
2 rows in set (0.00 sec)

```
