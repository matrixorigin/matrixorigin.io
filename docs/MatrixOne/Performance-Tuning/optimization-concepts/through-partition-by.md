# Performance Tuning with Partitioned Tables

## What is a Partitioned Table?

A partitioned table organizes data in a database, which involves dividing the table data into multiple partitions. Each partition acts as an independent sub-table.

In MatrixOne, table data is divided into different storage objects based on the key values of one or more table columns. These key values are referred to as data partitions or ranges.

A data partition or range is a subset of table rows stored separately from other row sets. The table data is divided into multiple data partitions or ranges based on the specifications provided in the `PARTITION BY` clause of the `CREATE TABLE` statement.

Partitioned tables can bring many benefits, such as faster query speed, optimized data maintenance, and increased availability. Partitioned tables simplify the reading and writing of table data. When SQL is executed on a partitioned table, the system first determines which partition the data belongs to and then reads or writes only that partition, avoiding operations on all the data in the table.

## Scenarios for Partitioned Tables

- Improving query performance by scanning only a portion of the table.
- Improving write performance by inserting, updating, or deleting only a portion of the table data.
- Batch deleting data within a specific range rather than performing an entire table operation.
- Fine-tuning and managing data.

## What Performance Tuning can be done with Partitioned Tables?

- **Query performance tuning**: Using partitioned tables can make queries more efficient by targeting specific partitions, thus improving query efficiency. For example, if a table is partitioned by date, specific data within a certain date range can be queried without scanning the entire table.

<!--- **Data Maintenance Performance Tuning**: Partitioned tables can speed up data maintenance operations such as inserting, updating, and deleting. Partitioned tables can reduce the amount of data that needs to be processed by utilizing I/O and CPU resources more efficiently, thereby improving maintenance performance. -->

- **Storage Space Usage Performance Tuning**: Partitioned tables can better manage table data and reduce unnecessary storage space usage. For example, if a table is partitioned by time, old partitions can be quickly deleted or archived without affecting data in other partitions.

<!--- **Availability and Reliability Performance Tuning**: Using partitioned tables can improve system availability and reliability. For example, specific partitions can be backed up or replicated to increase system recovery capability, thus reducing the risk of system failures. -->

## Impact of Partitioned Tables on Performance

Typically, as data increases within a table, performance gradually decreases. However, if the same data is stored in partitioned tables, data access can be optimized by partitioning data into different storage objects based on different ranges.

Compared to full table access, the optimized access method will prioritize accessing specific partitions, making it possible for requests for data addition, deletion, and modification to be more effectively distributed to different partitions, avoiding the occurrence of IO hotspots and ultimately achieving better performance improvements.

## How to Use Partitioned Tables for Tuning

When using partitioned tables, the following prerequisites need to be considered:

- The table has a large amount of data distributed according to some rules, such as by year or month.
- Improved query performance is desired by scanning only a portion of the table.
- Frequent data reads, and writes are limited to a specific range, while other fields have a lower frequency of reads and write.
- Frequent data reads and writes typically have certain fixed filtering conditions.

### Choosing the Partition Key

The partition key is a key factor in physically dividing the table, and choosing the right partition key can significantly improve read and write performance.

When selecting a partition key, the following factors need to be considered:

- High cardinality: A partition key with high cardinality will result in better data distribution and scalability. For example, for a table with student gender and age attributes, age has a higher cardinality than gender and is more suitable as the partition key.
- Uniqueness: The partition key should be as unique as possible to avoid a partition becoming a standalone hotspot. Using a composite key can achieve uniqueness. For example, in a company, if more than half of the employees in different departments are in the same city, partitioning the town as the partition key will result in that department becoming a hotspot. However, using a composite key such as department ID + city ID can significantly reduce the probability of a hot partition.

### Establishing Partitioning Strategy

Even if a column with high cardinality and uniqueness is selected as the partitioning key, hotspot partitions may still occur if the partitioning range is inappropriate. Therefore, more sophisticated management is required in the partitioning strategy.

- Data distribution should be as evenly as possible to avoid extreme distribution. For example, if student age is used as the partitioning key, the company's age distribution needs to be evaluated to prevent overly concentrated age ranges in a partition. For instance, a school may have many students aged 18-22 but relatively few under 18 or over 22, so each age can be partitioned.
- Add a random number to disperse the partition. Combine the partitioning key with a random number sequence in high-concurrency write scenarios. For example, in an order system, the number of orders for a particular item is very high. A random number sequence can be added when designing the table, with a value range of 1-10, and used as the partitioning key with the item type. Each time an order is written, a number from 1 to 10 is randomly generated, and these orders are randomly written to 10 partitions, reducing the likelihood of hotspot partitions.

## MatrixOne Partitioned Table Types

In MatrixOne, multiple partitioning modes are supported for tables, each corresponding to a different partitioning method.

### Range Partition

Range partitioning is a partitioning method based on continuous values. The partitioning key can be an integer type, DATE, or DATETIME in date type. Partitions must not overlap, and the partition definition uses the `VALUES LESS THAN` operator.

**Example**

The following two tables use an integer column and a date column as partitioning keys, respectively:

```sql
CREATE TABLE members (
    firstname VARCHAR(25) NOT NULL,
    lastname VARCHAR(25) NOT NULL,
    username VARCHAR(16) NOT NULL,
    email VARCHAR(35),
    joined DATE NOT NULL
)
PARTITION BY RANGE COLUMNS(joined) (
    PARTITION p0 VALUES LESS THAN ('1960-01-01'),
    PARTITION p1 VALUES LESS THAN ('1970-01-01'),
    PARTITION p2 VALUES LESS THAN ('1980-01-01'),
    PARTITION p3 VALUES LESS THAN ('1990-01-01'),
    PARTITION MySQL :: MySQL 8.0 Reference Manual :: 13.1.20 CREATE TABLE Statement
)
PARTITION BY RANGE COLUMNS(joined) (
    PARTITION p0 VALUES LESS THAN ('1960-01-01'),
    PARTITION p1 VALUES LESS THAN ('1970-01-01'),
    PARTITION p2 VALUES LESS THAN ('1980-01-01'),
    PARTITION p3 VALUES LESS THAN ('1990-01-01')
);
```

Note that if the value of the partition column in the data being inserted or updated does not correspond to a partition, the corresponding insert or update operation will fail. For example, if you insert a row with a "joined" date of 2000-01-01 but no corresponding partition, the process will fail because the partition cannot be located. So, when performing insert or update operations, you must ensure that the value of the partition column belongs to the corresponding partition.

### List Partition

List partitioning requires each partition to be composed of a defined value list, and each partition member in the list cannot have duplicate values. List partitioning can only use an integer type as the partition key.

**Example**

```sql
CREATE TABLE employees (
    id INT NOT NULL,
    fname VARCHAR(30),
    lname VARCHAR(30),
    hired DATE NOT NULL DEFAULT '1970-01-01',
    separated DATE NOT NULL DEFAULT '9999-12-31',
    job_code INT,
    store_id INT
)
PARTITION BY LIST(store_id) (
    PARTITION pNorth VALUES IN (3,5,6,9,17),
    PARTITION pEast VALUES IN (1,2,10,11,19,20),
    PARTITION pWest VALUES IN (4,12,13,14,18),
    PARTITION pCentral VALUES IN (7,8,15,16)
);
```

Please note that if the value of the partitioning column in the data being inserted or updated does not correspond to any partition, the insertion will fail.

### Hash Partition

Hash partitioning is commonly used to distribute data among different partitions evenly. Common types of hash partitioning include HASH function partitioning and KEY function partitioning.

In HASH function partitioning, the column or expression used for partitioning must be explicitly specified, and its type must be an integer. It is also recommended to explicitly specify the number of partitions, which must be a positive integer.

**Example**

```sql
CREATE TABLE employees (
    id INT NOT NULL,
    fname VARCHAR(30),
    lname VARCHAR(30),
    hired DATE NOT NULL DEFAULT '1970-01-01',
    separated DATE NOT NULL DEFAULT '9999-12-31',
    job_code INT,
    store_id INT
)
PARTITION BY HASH( YEAR(hired) )
PARTITIONS 4;
```

Unlike HASH function partitioning, KEY function partitioning supports all types of partition keys except for large object types (TEXT/BLOB), and it is unnecessary to specify the number of partitions. When using KEY function partitioning, the database service provides its hashing method, so explicitly defining the number of partitions is unnecessary. For example, the following statement can be used to create a table with a partition key of s1:

```sql
CREATE TABLE tm1 (
s1 CHAR(32) PRIMARY KEY
)
PARTITION BY KEY(s1);
```

It should be noted that if the partition key is the table's primary key column, the system will default to using the primary key column as the partition key if it is not explicitly specified. For example:

```sql
CREATE TABLE tm1 (
s1 CHAR(32) PRIMARY KEY
)
PARTITION BY KEY();
```

### Composite Partition

Composite partitioning is a variant of range partitioning and list partitioning that allows combinations of multiple columns in the partition key. Depending on the type of partition key, composite partitioning can be divided into range and list composite partitioning.

The types that can be used in composite partitioning include:

- All integer types, including [UNSIGNED] SMALLINT/INT/BIGINT
- Data types, including DATE and DATETIME
- Character types, including CHAR, VARCHAR, BINARY, and VARBINARY.

Range composite partitioning allows multiple types of columns to be combined, such as:

```sql
CREATE TABLE rcx (
         a INT,
         b INT,
         c CHAR(3),
         d date
     )
     PARTITION BY RANGE COLUMNS(a,d,c) (
         PARTITION p0 VALUES LESS THAN (5,'2022-01-01','ggg'),
         PARTITION p1 VALUES LESS THAN (10,'2012-01-01','mmm'),
         PARTITION p2 VALUES LESS THAN (15,'2002-01-01','sss'),
         PARTITION p3 VALUES LESS THAN (MAXVALUE,MAXVALUE,MAXVALUE)
     );
```

List composite partitions allow users to define partitions in the same way that multiple columns can be combined, such as:

```sql
CREATE TABLE t1 (
    a INT,
    b int,
    c date
)
PARTITION BY LIST COLUMNS(a,floor(b),c) (
    PARTITION p0 VALUES IN( (0,0,NULL), (NULL,NULL,NULL) ),
    PARTITION p1 VALUES IN( (0,1,'2000-01-01'), (0,2,'2000-01-01'), (0,3,'2000-01-01'), (1,1,'2000-01-01'), (1,2,'2000-01-01') ),
    PARTITION p2 VALUES IN( (1,0,'2000-01-01'), (2,0,'2000-01-01'), (2,1,'2000-01-01'), (3,0,'2000-01-01'), (3,1,'2000-01-01') ),
    PARTITION p3 VALUES IN( (1,3,'2000-01-01'), (2,2,'2000-01-01'), (2,3,'2000-01-01'), (3,2,'2000-01-01'), (3,3,'2000-01-01') )
);
```

<!--##分区调优 best practice-->

## Constraints

1. The partition table does not support the following partitions for the time being:

    - Range partition: Only supports integer and date (date/datetime).
    - List partition: Only supports integers.
    - Hash partition: The HASH function only supports integers .
    - Composite partition: Only supports integers, dates, and strings.

2. The partition table cannot be used for acceleration for now.
