# Multi-table Join Queries

In many scenarios, you need to use one query to get data from multiple tables. You can use the `JOIN` statement to combine the data from two or more tables.

## Before you start

Make sure you have already [Deployed standalone MatrixOne](../../Get-Started/install-standalone-matrixone.md).

### Preparation

1. Download the dataset:

    ```
    https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/tpch/tpch-1g.zip
    ```

2. Create the database and tables:

    ```sql
    create database d1;
    use d1;
    CREATE TABLE NATION  ( N_NATIONKEY  INTEGER NOT NULL,
                       N_NAME       CHAR(25) NOT NULL,
                       N_REGIONKEY  INTEGER NOT NULL,
                       N_COMMENT    VARCHAR(152),
                       PRIMARY KEY (N_NATIONKEY));

    CREATE TABLE REGION  ( R_REGIONKEY  INTEGER NOT NULL,
                       R_NAME       CHAR(25) NOT NULL,
                       R_COMMENT    VARCHAR(152),
                       PRIMARY KEY (R_REGIONKEY));

    CREATE TABLE PART  ( P_PARTKEY     INTEGER NOT NULL,
                     P_NAME        VARCHAR(55) NOT NULL,
                     P_MFGR        CHAR(25) NOT NULL,
                     P_BRAND       CHAR(10) NOT NULL,
                     P_TYPE        VARCHAR(25) NOT NULL,
                     P_SIZE        INTEGER NOT NULL,
                     P_CONTAINER   CHAR(10) NOT NULL,
                     P_RETAILPRICE DECIMAL(15,2) NOT NULL,
                     P_COMMENT     VARCHAR(23) NOT NULL,
                     PRIMARY KEY (P_PARTKEY));

    CREATE TABLE SUPPLIER ( S_SUPPKEY     INTEGER NOT NULL,
                        S_NAME        CHAR(25) NOT NULL,
                        S_ADDRESS     VARCHAR(40) NOT NULL,
                        S_NATIONKEY   INTEGER NOT NULL,
                        S_PHONE       CHAR(15) NOT NULL,
                        S_ACCTBAL     DECIMAL(15,2) NOT NULL,
                        S_COMMENT     VARCHAR(101) NOT NULL,
                        PRIMARY KEY (S_SUPPKEY));

    CREATE TABLE PARTSUPP ( PS_PARTKEY     INTEGER NOT NULL,
                        PS_SUPPKEY     INTEGER NOT NULL,
                        PS_AVAILQTY    INTEGER NOT NULL,
                        PS_SUPPLYCOST  DECIMAL(15,2)  NOT NULL,
                        PS_COMMENT     VARCHAR(199) NOT NULL,
                        PRIMARY KEY (PS_PARTKEY, PS_SUPPKEY));

    CREATE TABLE CUSTOMER ( C_CUSTKEY     INTEGER NOT NULL,
                        C_NAME        VARCHAR(25) NOT NULL,
                        C_ADDRESS     VARCHAR(40) NOT NULL,
                        C_NATIONKEY   INTEGER NOT NULL,
                        C_PHONE       CHAR(15) NOT NULL,
                        C_ACCTBAL     DECIMAL(15,2)   NOT NULL,
                        C_MKTSEGMENT  CHAR(10) NOT NULL,
                        C_COMMENT     VARCHAR(117) NOT NULL,
                        PRIMARY KEY (C_CUSTKEY));

    CREATE TABLE ORDERS  ( O_ORDERKEY       BIGINT NOT NULL,
                       O_CUSTKEY        INTEGER NOT NULL,
                       O_ORDERSTATUS    CHAR(1) NOT NULL,
                       O_TOTALPRICE     DECIMAL(15,2) NOT NULL,
                       O_ORDERDATE      DATE NOT NULL,
                       O_ORDERPRIORITY  CHAR(15) NOT NULL,
                       O_CLERK          CHAR(15) NOT NULL,
                       O_SHIPPRIORITY   INTEGER NOT NULL,
                       O_COMMENT        VARCHAR(79) NOT NULL,
                       PRIMARY KEY (O_ORDERKEY));

    CREATE TABLE LINEITEM ( L_ORDERKEY    BIGINT NOT NULL,
                        L_PARTKEY     INTEGER NOT NULL,
                        L_SUPPKEY     INTEGER NOT NULL,
                        L_LINENUMBER  INTEGER NOT NULL,
                        L_QUANTITY    DECIMAL(15,2) NOT NULL,
                        L_EXTENDEDPRICE  DECIMAL(15,2) NOT NULL,
                        L_DISCOUNT    DECIMAL(15,2) NOT NULL,
                        L_TAX         DECIMAL(15,2) NOT NULL,
                        L_RETURNFLAG  CHAR(1) NOT NULL,
                        L_LINESTATUS  CHAR(1) NOT NULL,
                        L_SHIPDATE    DATE NOT NULL,
                        L_COMMITDATE  DATE NOT NULL,
                        L_RECEIPTDATE DATE NOT NULL,
                        L_SHIPINSTRUCT CHAR(25) NOT NULL,
                        L_SHIPMODE     CHAR(10) NOT NULL,
                        L_COMMENT      VARCHAR(44) NOT NULL,
                        PRIMARY KEY (L_ORDERKEY, L_LINENUMBER));
    ```

3. Load data into the created tables:

    ```sql
    load data infile '/YOUR_TPCH_DATA_PATH/nation.tbl' into table NATION FIELDS TERMINATED BY '|' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY '\n';

    load data infile '/YOUR_TPCH_DATA_PATH/region.tbl' into table REGION FIELDS TERMINATED BY '|' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY '\n';

    load data infile '/YOUR_TPCH_DATA_PATH/part.tbl' into table PART FIELDS TERMINATED BY '|' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY '\n';

    load data infile '/YOUR_TPCH_DATA_PATH/supplier.tbl' into table SUPPLIER FIELDS TERMINATED BY '|' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY '\n';

    load data infile '/YOUR_TPCH_DATA_PATH/partsupp.tbl' into table PARTSUPP FIELDS TERMINATED BY '|' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY '\n';

    load data infile '/YOUR_TPCH_DATA_PATH/orders.tbl' into table ORDERS FIELDS TERMINATED BY '|' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY '\n';

    load data infile '/YOUR_TPCH_DATA_PATH/customer.tbl' into table CUSTOMER FIELDS TERMINATED BY '|' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY '\n';

    load data infile '/YOUR_TPCH_DATA_PATH/lineitem.tbl' into table LINEITEM FIELDS TERMINATED BY '|' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY '\n';
    ```

Then you can query data in MatrixOne with the created table.

## Join Types

### `INNER JOIN`

The join result of an inner join returns only rows that match the join condition.

|Statement| Image |
|---|---|
|SELECT <select_list> FROM TableA A INNER JOIN TableB B ON A.Key=B.Key|![innerjoin](https://github.com/matrixorigin/artwork/blob/main/docs/reference/inner_join.png?raw=true)|

There are two ways of writing an `inner join` that are completely equivalent in results:

```sql
mysql> SELECT   
    l_orderkey,
    SUM(l_extendedprice * (1 - l_discount)) AS revenue,
    o_orderdate,
    o_shippriority
FROM
    CUSTOMER,
    ORDERS,
    LINEITEM
WHERE
    c_mktsegment = 'BUILDING'
        AND c_custkey = o_custkey
        AND l_orderkey = o_orderkey
        AND o_orderdate < DATE '1995-03-15'
        AND l_shipdate > DATE '1995-03-15'
GROUP BY l_orderkey , o_orderdate , o_shippriority
ORDER BY revenue DESC , o_orderdate
LIMIT 10;
+------------+---------------------+-------------+----------------+
| l_orderkey | revenue             | o_orderdate | o_shippriority |
+------------+---------------------+-------------+----------------+
|    2456423 | 406181.011100000000 | 1995-03-05  |              0 |
|    3459808 | 405838.698900000000 | 1995-03-04  |              0 |
|     492164 | 390324.061000000000 | 1995-02-19  |              0 |
|    1188320 | 384537.935900000000 | 1995-03-09  |              0 |
|    2435712 | 378673.055800000000 | 1995-02-26  |              0 |
|    4878020 | 378376.795200000000 | 1995-03-12  |              0 |
|    5521732 | 375153.921500000000 | 1995-03-13  |              0 |
|    2628192 | 373133.309400000000 | 1995-02-22  |              0 |
|     993600 | 371407.459500000000 | 1995-03-05  |              0 |
|    2300070 | 367371.145200000000 | 1995-03-13  |              0 |
+------------+---------------------+-------------+----------------+
10 rows in set (0.20 sec)
```

Write as `Join`, the syntax is as follows:

```sql
mysql> SELECT   
    l_orderkey,
    SUM(l_extendedprice * (1 - l_discount)) AS revenue,
    o_orderdate,
    o_shippriority
FROM
    CUSTOMER
    join ORDERS on c_custkey = o_custkey
    join LINEITEM on l_orderkey = o_orderkey
WHERE
    c_mktsegment = 'BUILDING'
        AND o_orderdate < DATE '1995-03-15'
        AND l_shipdate > DATE '1995-03-15'
GROUP BY l_orderkey , o_orderdate , o_shippriority
ORDER BY revenue DESC , o_orderdate
LIMIT 10;
+------------+---------------------+-------------+----------------+
| l_orderkey | revenue             | o_orderdate | o_shippriority |
+------------+---------------------+-------------+----------------+
|    2456423 | 406181.011100000000 | 1995-03-05  |              0 |
|    3459808 | 405838.698900000000 | 1995-03-04  |              0 |
|     492164 | 390324.061000000000 | 1995-02-19  |              0 |
|    1188320 | 384537.935900000000 | 1995-03-09  |              0 |
|    2435712 | 378673.055800000000 | 1995-02-26  |              0 |
|    4878020 | 378376.795200000000 | 1995-03-12  |              0 |
|    5521732 | 375153.921500000000 | 1995-03-13  |              0 |
|    2628192 | 373133.309400000000 | 1995-02-22  |              0 |
|     993600 | 371407.459500000000 | 1995-03-05  |              0 |
|    2300070 | 367371.145200000000 | 1995-03-13  |              0 |
+------------+---------------------+-------------+----------------+
10 rows in set (0.20 sec)
```

### `LEFT JOIN` and `RIGHT JOIN`

Outer joins are further divided into **left join** and **right join**, and equivalent semantics can be achieved between the two:

- `LEFT JOIN`

The `LEFT JOIN` returns all the rows in the left table and the values ​​in the right table that match the join condition. If no rows are matched in the right table, it will be filled with NULL.

|Statement| Image |
|---|---|
|SELECT <select_list> FROM TableA A LEFT JOIN TableB B ON A.Key=B.Key|![leftjoin](https://github.com/matrixorigin/artwork/blob/main/docs/reference/left_join.png?raw=true)|
|SELECT <select_list> FROM TableA A LEFT JOIN TableB B ON A.Key=B.Key WHERE B.Key IS NULL|![leftjoinwhere](https://github.com/matrixorigin/artwork/blob/main/docs/reference/left_join_where.png?raw=true)|

- `RIGHT JOIN`

A `RIGHT JOIN` returns all the records in the right table and the values ​​in the left table that match the join condition. If there is no matching value, it is filled with NULL.

|Statement| Image |
|---|---|
|SELECT <select_list> FROM TableA A RIGHT JOIN TableB B ON A.Key=B.Key|![leftjoinwhere](https://github.com/matrixorigin/artwork/blob/main/docs/reference/right_join.png?raw=true)|
|SELECT <select_list> FROM TableA A RIGHT JOIN TableB B ON A.Key=B.Key WHERE A.Key IS NULL|![leftjoinwhere](https://github.com/matrixorigin/artwork/blob/main/docs/reference/right_join_where.png?raw=true)|

The example is as below:

```sql
SELECT
        c_custkey, COUNT(o_orderkey) AS c_count
    FROM
        CUSTOMER
    LEFT OUTER JOIN ORDERS ON (c_custkey = o_custkey
        AND o_comment NOT LIKE '%special%requests%')
    GROUP BY c_custkey limit 10;

+-----------+---------+
| c_custkey | c_count |
+-----------+---------+
|    147457 |      16 |
|    147458 |       7 |
|    147459 |       0 |
|    147460 |      16 |
|    147461 |       7 |
|    147462 |       0 |
|    147463 |      14 |
|    147464 |      11 |
|    147465 |       0 |
|    147466 |      17 |
+-----------+---------+
10 rows in set (0.93 sec)
```

Or:

```sql
SELECT
        c_custkey, COUNT(o_orderkey) AS c_count
    FROM
        ORDERS
    RIGHT OUTER JOIN CUSTOMER ON (c_custkey = o_custkey
        AND o_comment NOT LIKE '%special%requests%')
    GROUP BY c_custkey limit 10;

+-----------+---------+
| c_custkey | c_count |
+-----------+---------+
|    147457 |      16 |
|    147458 |       7 |
|    147459 |       0 |
|    147460 |      16 |
|    147461 |       7 |
|    147462 |       0 |
|    147463 |      14 |
|    147464 |      11 |
|    147465 |       0 |
|    147466 |      17 |
+-----------+---------+
10 rows in set (0.93 sec)
```

### `FULL JOIN`

A `full join` is the union of left and right outer joins. The join table contains all records from the joined tables or is filled with `NULL` if a matching record is missing.

```sql
SELECT
        c_custkey, COUNT(o_orderkey) AS c_count
    FROM
        CUSTOMER
    FULL JOIN ORDERS ON (c_custkey = o_custkey
        AND o_comment NOT LIKE '%special%requests%')
    GROUP BY c_custkey limit 10;

+-----------+---------+
| c_custkey | c_count |
+-----------+---------+
|         1 |       6 |
|         2 |       7 |
|         4 |      20 |
|         5 |       4 |
|         7 |      16 |
|         8 |      13 |
|        10 |      20 |
|        11 |      13 |
|        13 |      18 |
|        14 |       9 |
+-----------+---------+
10 rows in set (0.77 sec)
```

The `full join` can also be rewritten to obtain the same semantics:

```sql
SELECT
        c_custkey, COUNT(o_orderkey) AS c_count
    FROM
        CUSTOMER
    LEFT OUTER JOIN ORDERS ON (c_custkey = o_custkey
        AND o_comment NOT LIKE '%special%requests%')
    GROUP BY c_custkey
UNION
SELECT
        c_custkey, COUNT(o_orderkey) AS c_count
    FROM
        CUSTOMER
    LEFT OUTER JOIN ORDERS ON (c_custkey = o_custkey
        AND o_comment NOT LIKE '%special%requests%')
    WHERE c_custkey IS NULL
    GROUP BY c_custkey
limit 10;

+-----------+---------+
| c_custkey | c_count |
+-----------+---------+
|    147457 |      16 |
|    147458 |       7 |
|    147459 |       0 |
|    147460 |      16 |
|    147461 |       7 |
|    147462 |       0 |
|    147463 |      14 |
|    147464 |      11 |
|    147465 |       0 |
|    147466 |      17 |
+-----------+---------+
10 rows in set (1.09 sec)
```

## Implicit join

Before the `JOIN` statement that explicitly declared a join was added to the SQL standard, it was possible to join two or more tables in a SQL statement using the `FROM t1, t2` clause, and specify the conditions for the join using the `WHERE t1.id = t2.id` clause. You can understand it as an implicit join, which uses the inner join to join tables.
