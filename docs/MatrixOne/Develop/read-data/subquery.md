# Subquery

This document describes how to use subquery statements in MatrixOne.

## Overview

An subquery is a query within another SQL query. With subquery, the query result can be used in another query.

In most cases, there are five types of subqueries:

- Scalar Subquery, such as `SELECT (SELECT s1 FROM t2) FROM t1`.
- Derived Tables, such as `SELECT t1.s1 FROM (SELECT s1 FROM t2) t1`.
- Existential Test, such as `WHERE NOT EXISTS(SELECT ... FROM t2)`, `WHERE t1.a IN (SELECT ... FROM t2)`.
- Quantified Comparison, such as `WHERE t1.a = ANY(SELECT ... FROM t2)`, `WHERE t1.a = ANY(SELECT ... FROM t2)`.
- Subquery as a comparison operator operand, such as `WHERE t1.a > (SELECT ... FROM t2)`.

For more information on SQL statement, see [SUBQUERY](../../Reference/SQL-Reference/Data-Query-Language/subqueries/subquery.md).

In addition, from the execution of SQL statements, subquery generally has the following two types:

- Correlated Subquery: In Correlated Subquery nested in databases, the inner and outer queries would not be independent, and the inner queries would depend on the outer queries.The execution sequence is as follows:

    + Queries a record from the outer query.

    + Put the queried records into the inner query, then put the records that meet the conditions into the outer query.

    + Repeat the above steps

    For example: `select * from tableA where tableA.cloumn &lt; (select column from tableB where tableA.id = tableB.id))`

- Self-contained Subquery: In a database nested query, the inner query is entirely independent of the outer query. The execution sequence is as follows:

    + Execute the inner query first.

    + The result of the inner query is carried into the outer layer, and then the outer query is executed.

    For example: `select * from tableA where tableA.column = (select tableB.column from tableB)`

**Key Feature**:

- Subqueries allow structured queries so that each part of a query statement can be separated.

- Subqueries provides another way to perform operations that require complex `JOIN` and `UNION`.

## Example

### Before you start

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

#### Self-contained subquery

For a self-contained subquery that uses subquery as operand of comparison operators (`>`, `>=`, `<`, `<=`, `=` , or `! =`), the inner subquery queries only once, and MatrixOne rewrites it as a constant during the execution plan phase.

```sql
mysql> select p.p_name from (select * from part where p_brand='Brand#21' and p_retailprice between 1100 and 1200)  p, partsupp ps where p.p_partkey=ps.ps_partkey and p.p_name like '%pink%' limit 10;
```

The inner subquery is executed before MatrixOne executes the above query:

```sql
mysql> select * from part where p_brand='Brand#21' and p_retailprice between 1100 and 1200
```

Result is as below:

```sql
+-----------------------------------+
| p_name                            |
+-----------------------------------+
| olive chartreuse smoke pink tan   |
| olive chartreuse smoke pink tan   |
| olive chartreuse smoke pink tan   |
| olive chartreuse smoke pink tan   |
| pink sienna dark bisque turquoise |
| pink sienna dark bisque turquoise |
| pink sienna dark bisque turquoise |
| pink sienna dark bisque turquoise |
| honeydew orchid cyan magenta pink |
| honeydew orchid cyan magenta pink |
+-----------------------------------+
10 rows in set (0.06 sec)
```

For self-contained subqueries such as Existential Test and Quantified Comparison, MatrixOne rewrites and replaces them with equivalent queries for better performance.

#### Correlated subquery

For correlated subquery, because the inner subquery references the columns from the outer query, each subquery is executed once for each row of the outer query. That is, assuming that the outer query gets 10 million results, the subquery will also be executed 10 million times, which will consume more time and resources.

Therefore, in the process of processing, MatrixOne will try to Decorrelate of Correlated Subquery to improve the query efficiency at the execution plan level.

```sql
mysql> select p_name from part where P_PARTKEY in (select PS_PARTKEY from PARTSUPP where PS_SUPPLYCOST>=500) and p_name like '%pink%' limit 10;
```

Rewrites it to an equivalent join query:

```
select p_name from part join partsupp on P_PARTKEY=PS_PARTKEY where PS_SUPPLYCOST>=500 and p_name like '%pink%' limit 10;
```

Result is as below:

```sql
+------------------------------------+
| p_name                             |
+------------------------------------+
| papaya red almond hot pink         |
| turquoise hot smoke green pink     |
| purple cornsilk red pink floral    |
| pink cyan purple white burnished   |
| sandy dark pink indian cream       |
| powder cornsilk chiffon slate pink |
| rosy light black pink orange       |
| pink white goldenrod ivory steel   |
| cornsilk dim pink tan sienna       |
| lavender navajo steel sandy pink   |
+------------------------------------+
10 rows in set (0.23 sec)
```

As a best practice, in actual development, it is recommended to avoid querying through a correlated subquery if you can write another equivalent query with better performance.
