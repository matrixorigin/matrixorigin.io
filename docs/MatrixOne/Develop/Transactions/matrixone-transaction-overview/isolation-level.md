# Isolation level in MatrixOne

## Read Committed

MatrixOne defaults to the **Read Committed** isolation level and its characteristics are as follows:

- Between different transactions, only the data submitted by other transactions can be read, and the uncommitted data cannot be viewed.
- The read-committed isolation level can effectively prevent dirty writes and dirty reads but cannot avoid non-repeatable reads and phantom reads.

### Read Committed Principles

- When a transaction starts, the database generates a unique transaction ID.
- When generating the timestamp of the transaction ID, TAE (Transactional Analytic Engine) automatically detects whether there is an updated timestamp in the corresponding table every time the data is added, deleted, modified, or checked. If so, the updated timestamp is the latest.
- When operating on data, TAE caches the user data in memory. When committing a transaction, TAE writes the data in memory to the disk (the S3 path where the data is stored or the local disk path).

### Read Committed Examples

You can participate in the following example to understand the **read committed** isolation level.

First in MatrixOne, we create a database *test* and table *t1*:

```sql
create database test;
use test;
CREATE TABLE t1
(
tid INT NOT NULL primary key,
tname VARCHAR(50) NOT NULL
);
INSERT INTO t1 VALUES(1,'version1');
INSERT INTO t1 VALUES(2,'version2');
```

In session 1, start a transaction:

```sql
use test;
begin;
UPDATE t1 SET tname='version3' WHERE tid=2;
SELECT * FROM t1;
```

In session 1, the results are as follows:

```sql
+------+----------+
| tid  | tname    |
+------+----------+
|    2 | version3 |
|    1 | version1 |
+------+----------+
```

At this time, open session 2 to query *t1*:

```sql
use test;
begin;
SELECT * FROM t1;
```

The result is still the original data:

```sql
+------+----------+
| tid  | tname    |
+------+----------+
|    1 | version1 |
|    2 | version2 |
+------+----------+
```

In session 2, modify the line for `tid=1`:

```sql
UPDATE t1 SET tname='version0' WHERE tid=1;
```

At this point, the content of query `t1` in session 1 is still the modified data:

```sql
SELECT * FROM t1;
+------+----------+
| tid  | tname    |
+------+----------+
|    1 | version1 |
|    2 | version3 |
+------+----------+
```

After session 2 submits its data, then query session 1, you will find that the content of session 1 has become the data after session two submits:

- Session 2:

```sql
-- Submit data in session 2:
COMMIT;
```

- Session 1:

```sql
-- Query whether the content of session 1 has become the data submitted by session 2:
SELECT * FROM t1;
+------+----------+
| tid  | tname    |
+------+----------+
|    1 | version0 |
|    2 | version3 |
+------+----------+
```

## Snapshot isolation

In MatrixOne, the supported isolation level is Snapshot Isolation, which is also known as `REPEATABLE READS` to maintain consistency with the isolation level in MySQL. The isolation implementation principle of this level is as follows:

### Snapshot isolation principle

- When a transaction starts, the database generates a transaction ID for the transaction, which is a unique ID.
- At the timestamp when the transaction ID is generated, a snapshot of the corresponding data is generated, and all transaction operations are performed based on the snapshot.
- After the transaction commits to modify the data, release the transaction ID and data snapshot.

### Snapshot Isolation Example

See the example below to help you understand snapshot isolation.

First in MatrixOne, we create a database *test* and table *t1*:

```
create database test;
use test;
CREATE TABLE t1
(
tid INT NOT NULL primary key,
tname VARCHAR(50) NOT NULL
);
INSERT INTO t1 VALUES(1,'version1');
INSERT INTO t1 VALUES(2,'version2');
```

In session 1, start a transaction:

```
use test;
begin;
UPDATE t1 SET tname='version3' WHERE tid=2;
SELECT * FROM t1;
```

In session 1, the results are as follows, the modification results based on the snapshot data:

```
+------+----------+
| tid  | tname    |
+------+----------+
|    2 | version3 |
|    1 | version1 |
+------+----------+
```

At this time, open session 2 to query *t1*:

```
use test;
SELECT * FROM t1;
```

The result is still the original data:

```
+------+----------+
| tid  | tname    |
+------+----------+
|    1 | version1 |
|    2 | version2 |
+------+----------+
```

Commit the transaction in session 1:

```
COMMIT;
```

At this point, the result of *t1* in session 2 becomes the submitted data:

```
+------+----------+
| tid  | tname    |
+------+----------+
|    1 | version1 |
|    2 | version3 |
+------+----------+
```
