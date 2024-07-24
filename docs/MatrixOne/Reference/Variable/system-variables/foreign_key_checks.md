# Foreign key constraint checking

In MatrixOne, `foreign_key_checks` is a system variable that controls the checking of foreign key constraints. This variable can be global or session level. When set to 1 (the default), MatrixOne checks the integrity of the foreign key constraint, ensuring the referential integrity of the data. If set to 0, these checks are skipped.

!!! note
    What is inconsistent with MySQL behavior is that when foreign key constraint checking is turned off, the parent table is deleted and MySQL does not delete the foreign key relationship of the child table referencing the parent table, but MatrixOne deletes the foreign key relationship of the child table referencing the parent table and reestablishes the foreign key relationship after rebuilding the parent table.

## View foreign_key_checks

Use the following command in MatrixOne to view foreign_key_checks:

```sql

--global mode
SELECT @@global.foreign_key_checks;
SHOW global VARIABLES LIKE 'foreign_key_checks';

--session mode
SELECT @@session.foreign_key_checks;
SHOW session VARIABLES LIKE 'foreign_key_checks';
```

## Set foreign_key_checks

Set foreign_key_checks in MatrixOne with the following command:

```sql
--Global mode, reconnecting the database takes effect
set global foreign_key_checks = 'xxx' 

--session mode
set session foreign_key_checks = 'xxx'
```

## Examples

```sql
mysql>  SELECT @@session.foreign_key_checks;
+----------------------+
| @@foreign_key_checks |
+----------------------+
| 1                    |
+----------------------+
1 row in set (0.00 sec)

create table t2(a int primary key,b int);
create table t1( b int, constraint `c1` foreign key `fk1` (b) references t2(a));

insert into t2 values(1,2);
mysql> insert into t1 values(3);--When foreign key constraint checking is turned on, values that violate the constraint cannot be inserted
ERROR 20101 (HY000): internal error: Cannot add or update a child row: a foreign key constraint fails

mysql> drop table t2;--Parent table cannot be deleted when foreign key constraint checking is turned on
ERROR 20101 (HY000): internal error: can not drop table 't2' referenced by some foreign key constraint

set session foreign_key_checks =0;--Turn off foreign key constraint checking
mysql>  SELECT @@session.foreign_key_checks;
+----------------------+
| @@foreign_key_checks |
+----------------------+
| 0                    |
+----------------------+
1 row in set (0.00 sec)

mysql> insert into t1 values(3);--When you turn off foreign key constraint checking, you can insert values that violate constraints
Query OK, 1 row affected (0.01 sec)

mysql> drop table t2;--When you turn off foreign key constraint checking, you can delete the parent table.
Query OK, 0 rows affected (0.02 sec)

mysql> show create table t1;--Delete the parent table and the foreign key constraints are also deleted
+-------+--------------------------------------------+
| Table | Create Table                               |
+-------+--------------------------------------------+
| t1    | CREATE TABLE `t1` (
`b` INT DEFAULT NULL
) |
+-------+--------------------------------------------+
1 row in set (0.00 sec)

mysql> create table t2(n1 int);--Rebuild the deleted parent table t2 with the original foreign key reference columns of the child table.
ERROR 20101 (HY000): internal error: column 'a' no exists in table ''

mysql> create table t2(n1 int,a int primary key);--Contains referenced primary key column a, rebuild successful
Query OK, 0 rows affected (0.01 sec)

mysql> show create table t1;--After rebuilding t2, the foreign key relationship is automatically re-established
+-------+-------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                              |
+-------+-------------------------------------------------------------------------------------------------------------------------------------------+
| t1    | CREATE TABLE `t1` (
`b` INT DEFAULT NULL,
CONSTRAINT `c1` FOREIGN KEY (`b`) REFERENCES `t2` (`a`) ON DELETE RESTRICT ON UPDATE RESTRICT
) |
+-------+-------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)
```
