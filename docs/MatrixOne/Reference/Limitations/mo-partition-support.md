# MatrixOne DDL statement partitioning supported

## 1. The partition type supported by MatrixOne

MatrixOne DDL statements support six partition types, which are the same as the MySQL official website:

- KEY Partitioning
- HASH Partitioning

Subpartitioning syntax is currently supported, but plan builds are not.

## 2. About Partition Keys

### Partition Keys, Primary Keys and Unique Keys

The relationship rules of Partition Keys, Primary Keys, and Unique Keys can be summarized as follows:

- All columns used in a partitioning expression for a partitioned table must be part of every unique key that the table may have.

   !!! note
       The Unique KEY includes PrimaryKey and unique key.

- That is, each unique key on a table must use each column of the table's partitioning expression. A unique key also includes the primary key of a table because, by definition, a table's primary key is also a unique one.

#### Examples

For example, because the unique key on the table does not use every column in the table, each statement that creates the table below is invalid:

```sql
> CREATE TABLE t1 (
      col1 INT NOT NULL,
      col2 DATE NOT NULL,
      col3 INT NOT NULL,
      col4 INT NOT NULL,
      UNIQUE KEY (col1, col2)
  )
  PARTITION BY HASH(col3)
  PARTITIONS 4;
ERROR 1503 (HY000): A PRIMARY KEY must include all columns in the table's partitioning function

> CREATE TABLE t2 (
     col1 INT NOT NULL,
     col2 DATE NOT NULL,
     col3 INT NOT NULL,
     col4 INT NOT NULL,
     UNIQUE KEY (col1),
     UNIQUE KEY (col3)
 )
  PARTITION BY HASH(col1 + col3)
  PARTITIONS 4;

ERROR 1503 (HY000): A PRIMARY KEY must include all columns in the table's partitioning function
```

### About the partition KEY is NULL

1. KEY only accepts lists with Null or more column names. In cases where the table has a primary key, any column used as a partitioning key must contain some or all of the table's primary keys.

    If no column name is specified as the partitioning key, you can ues the table's primary key. For example, the following `CREATE TABLE` statement is valid in MySQL.

2. If there is no primary KEY but a UNIQUE KEY, the UNIQUE KEY is used as the partitioning key.

    For example, in the following table construction sentence, the KEY partition key is NULL, no primary key is defined, but the unique key is used as the partitioning key when the partition expression is constructed:

```sql
CREATE TABLE t1 (
	col1 INT  NOT NULL,
	col2 DATE NOT NULL,
	col3 INT NOT NULL,
	col4 INT NOT NULL,
	UNIQUE KEY (col1, col2)
)
PARTITION BY KEY()
PARTITIONS 4;
```

!!! note
    Other partition rules are the same as MySQL.

## 3. About MatrixOne Partition Expressions

​When a DDL statement constructs a partitioned table, a partition expression is generated for each partition definition. The partition expression can calculate the partition to which the data belongs.

In the plan build phase, the partition information data structure in the DDL statement is plan.PartitionInfo:

```sql
type PartitionInfo struct {
	Type                 PartitionType
	Expr                 *Expr
	PartitionExpression  *Expr
	Columns              []*Expr
	PartitionColumns     []string
	PartitionNum         uint64
	Partitions           []*PartitionItem
	Algorithm            int64
	IsSubPartition       bool
	PartitionMsg         string
}
```

`PartitionExpression` is the partition expression. Partition expressions are MatrixOne's way of converting a partition clause into an expression. Each partition expression is constructed as follows:

### KEY Partitioning

KEY partitioning will construct a partition expression based on the partition key and the number of partitions. The result of the partition expression is an integer greater than or equal to 0, representing the partition sequence number, which increases sequentially from zero.

SQL example is as below:

```sql
CREATE TABLE t1 (
    col1 INT NOT NULL,
    col2 DATE NOT NULL,
    col3 INT NOT NULL,
    col4 INT NOT NULL,
    PRIMARY KEY (col1, col2)
)
PARTITION BY KEY(col1)
PARTITIONS 4;
```

### HASH Partitioning

HASH partitioning will construct a partition expression based on the partition function and the number of partitions. The result of the partition expression is an integer greater than or equal to 0, representing the partition sequence number, which increases sequentially from zero.

SQL example is as below:

```sql
CREATE TABLE t1 (
    col1 INT,
    col2 CHAR(5),
    col3 DATE
)
PARTITION BY LINEAR HASH( YEAR(col3))
PARTITIONS 6;
```
