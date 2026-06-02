# Using `Cluster by` for performance tuning

`Cluster by` is a commonly used performance-tuning technique that can help optimize the execution efficiency of queries. This article explains how to use `Cluster by` for performance tuning.

## What is `Cluster by`?

`Cluster by` is a command used to optimize the physical arrangement of a table. When `Cluster by` is used during table creation, tables without primary keys can be physically sorted according to a specified column. The data rows will be rearranged in the same order as the values of that column. This physical sorting helps improve query performance.

The following are some considerations when using `Cluster by`:

`Cluster by` cannot coexist with a primary key because the primary key already specifies the sorting order. Otherwise, it will result in a syntax error.

`Cluster by` can only be specified during table creation and does not support dynamic creation.

The syntax for using `Cluster by` is as follows:

- Single column syntax: `create table() cluster by col;`
- Multi-column syntax: `create table() cluster by (col1, col2);`

## How to use `Cluster by` for performance tuning?

The steps for using `Cluster by` for performance tuning are as follows:

1. Determine the column to be sorted.

    First, it is necessary to determine the column to be sorted. Generally, columns that are frequently used for filtering can be selected. For example, if there is an order table, the orders can be sorted by time. The time column is a commonly used sorting column for data with time series characteristics.

2. Execute the `Cluster by` command.

    Once the sorting column is determined, the `Cluster by` command can be executed during table creation to perform the sorting.

    Here is an example:

    ```sql
    create table t1(a int, b int, c varchar(10)) cluster by(a,b,c);
    desc t1;
    +-------+-------------+------+------+---------+-------+---------+
    | Field | Type        | Null | Key  | Default | Extra | Comment |
    +-------+-------------+------+------+---------+-------+---------+
    | a     | INT(32)     | YES  |      | NULL    |       |         |
    | b     | INT(32)     | YES  |      | NULL    |       |         |
    | c     | VARCHAR(10) | YES  |      | NULL    |       |         |
    +-------+-------------+------+------+---------+-------+---------+
    3 rows in set (0.02 sec)
    ```

    In this example, we first create a table named t1. Then, we use the `Cluster by` command to physically sort the table according to columns a, b, and c. This way, all data rows will be arranged in the order of values of columns a, b, and c.

### How to Make the Best Use of Cluster by for Performance Tuning?

There are two ways to make the best use of `Cluster by` for performance tuning:

1. Put the most frequently queried columns at the front.

    In the case of `Cluster by` with multiple columns, the first column will get the best query acceleration effect because the data distribution of the first column is ultimately ordered. Only when the first column is the same the remaining data will be sorted according to the second column. Therefore, the query acceleration effect of the second column is weaker than that of the first column, and the subsequent columns will decrease. Consequently, it is generally not recommended to specify too many columns in `Cluster by`; usually, 3-4 columns are sufficient.

2. Put low cardinality columns at the front.

    Cardinality refers to the number of different values in a column. For example, gender, with only two values, is a typical low cardinality column. For example, ID card numbers are usually not duplicated, which is a high cardinality column. If the tall cardinality column is placed in the first column of `Cluster by`, the data distribution of the whole table has been thoroughly sorted on the first column, which leads to the subsequent columns not being effective. In this case, it is recommended to use `Cluster by` for a single column or to build a separate index for the high cardinality column rather than including it in `Cluster by`.

### To consider when using `Cluster by`

- `Cluster by` may take a long time to complete on large tables

It may take a long time to complete when using `Cluster by` on a large table. This is because the operation requires reorganizing, reordering, and storing the data in the table. Therefore, when executing the `Cluster by` command, the table size and hardware configuration need to be considered.

- `Cluster by` may affect the performance of insert and update operations

Using `Cluster by` to sort data in a table physically may affect the performance of insert and update operations. When specific columns sort the data in a table, insert and update procedures may need to move many rows. Therefore, this impact must be considered when using `Cluster by`.

- `Cluster by` needs to be regularly executed to maintain performance

As data grows and changes, the physical sorting of data in a table may lose its effectiveness. Therefore, the `Cluster by` command needs to be regularly executed to ensure that the physical sorting of data remains effective.

It is important to note that using the `Cluster by` command needs to be carefully considered. It is recommended first to validate its effects in a testing environment to avoid negative impacts on the data in the table.
