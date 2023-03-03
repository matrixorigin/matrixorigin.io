# Snapshot Isolation in MatrixOne

In MatrixOne, the supported isolation level is Snapshot Isolation, which is also known as REPEATABLE READS to maintain consistency with the isolation level in MySQL. The isolation implementation principle of this level is as follows:

## Snapshot isolation principle

- When a transaction starts, the database generates a transaction ID for the transaction, which is a unique ID.
- At the timestamp when the transaction ID is generated, a snapshot of the corresponding data is generated, and all transaction operations are performed based on the snapshot.
- After the transaction commits to modify the data, release the transaction ID and data snapshot.

## Snapshot Isolation Example

You can take the example below to help understand snapshot isolation.

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
