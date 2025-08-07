# RESTORE ... FROM PITR

## Syntax description

`RESTORE ... FROM PITR` is used to restore data from a previously created PITR.

## Grammar structure

```
> RESTORE [CLUSTER]|[[ACCOUNT <account_name>] [DATABASE database_name [TABLE table_name]]]FROM PITR <snapshot_name> [TO ACCOUNT <account_name>];
```

## Example

### Example 1: Restoring the cluster

```sql

--Execute under sys tenant
create account acc1 admin_name 'root' identified by '111';
create account acc2 admin_name 'root' identified by '111';

--Executed under tenants acc1, acc2
create database db1;

mysql> show databases;

+--------------------+
| Database           |

+--------------------+
| db1                |
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |

+--------------------+
6 rows in set (0.01 sec)

--Create pitr
mysql> create pitr clu_pitr1 for cluster range 1 'h';
Query OK, 0 rows affected (0.01 sec)

mysql> show pitr where pitr_name='clu_pitr1';

+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| pitr_name | created_time        | modified_time       | pitr_level | account_name | database_name | table_name | pitr_length | pitr_unit |

+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| clu_pitr1 | 2024-10-18 17:06:49 | 2024-10-18 17:06:49 | cluster    | *            | *             | *          |           1 | h         |

+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
1 row in set (0.00 sec)

--Executed under tenants acc1, acc2
drop database db1;--Delete database db1

mysql> show databases;

+--------------------+
| Database           |

+--------------------+
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |

+--------------------+
6 rows in set (0.01 sec)

--recover
mysql> restore cluster from pitr clu_pitr1 "2024-10-18 17:06:50";
Query OK, 0 rows affected (1.84 sec)

--Executed under tenants acc1 and acc2, you can see that the recovery is successful.
mysql> show databases;

+--------------------+
| Database           |

+--------------------+
| db1                |
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |

+--------------------+
6 rows in set (0.01 sec)
```

### Example 2: Restoring a tenant

```sql
CREATE database db1;
CREATE database db2;

mysql> show databases;

+--------------------+
| Database           |

+--------------------+
| db1                |
| db2                |
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |

+--------------------+
7 rows in set (0.00 sec)

--Create pitr
mysql> create pitr acc_pitr1 range 1 "h";
Query OK, 0 rows affected (0.02 sec)

mysql> show pitr;

+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| PITR_NAME | CREATED_TIME        | MODIFIED_TIME       | PITR_LEVEL | ACCOUNT_NAME | DATABASE_NAME | TABLE_NAME | PITR_LENGTH | PITR_UNIT |

+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| acc_pitr1 | 2024-10-18 16:09:34 | 2024-10-18 16:09:34 | account    | acc1         | *             | *          |           1 | h         |

+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
1 row in set (0.01 sec)

--Delete database db1,db2 after a while
drop database db1;
drop database db2;

mysql> show databases;

+--------------------+
| Database           |

+--------------------+
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |

+--------------------+
5 rows in set (0.01 sec)

--recover
mysql> restore from pitr acc_pitr1 "2024-10-18 16:09:35";
Query OK, 0 rows affected (0.78 sec)

mysql> show databases;

+--------------------+
| Database           |

+--------------------+
| db1                |
| db2                |
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |

+--------------------+
7 rows in set (0.00 sec)
```

### Example 3: Restoring the database

```sql
CREATE database db1;

mysql> show databases;

+--------------------+
| Database           |

+--------------------+
| db1                |
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |

+--------------------+
7 rows in set (0.00 sec)

--Create pitr
mysql> create pitr db_pitr1 for database db1 range 2 "d";
Query OK, 0 rows affected (0.01 sec)

mysql> show pitr where pitr_name='db_pitr1';

+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| pitr_name | created_time        | modified_time       | pitr_level | account_name | database_name | table_name | pitr_length | pitr_unit |

+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| db_pitr1  | 2024-10-18 16:16:03 | 2024-10-18 16:16:03 | database   | acc1         | db1           | *          |           2 | d         |

+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
1 row in set (0.01 sec)

--delete db1
drop database db1;

mysql> show databases;

+--------------------+
| Database           |

+--------------------+
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |

+--------------------+
6 rows in set (0.01 sec)

--recover db1
mysql> restore database db1 from pitr db_pitr1 "2024-10-18 16:16:05";
Query OK, 0 rows affected (0.02 sec)

mysql> show databases;

+--------------------+
| Database           |

+--------------------+
| db1                |
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |

+--------------------+
7 rows in set (0.00 sec)
```

### Example 4: Restore table

```sql

--Executed under tenant acc1
CREATE TABLE t1(n1 int);
INSERT INTO t1 values(1);

mysql> SELECT * FROM t1;

+------+
| n1   |

+------+
|    1 |

+------+
1 row in set (0.00 sec)

create pitr tab_pitr for database db1 table t1 range 1 'd';--create pitr

mysql> show pitr where pitr_name='tab_pitr';

+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| pitr_name | created_time        | modified_time       | pitr_level | account_name | database_name | table_name | pitr_length | pitr_unit |

+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| tab_pitr  | 2024-10-23 14:32:17 | 2024-10-23 14:32:17 | table      | sys          | db1           | t1         |           1 | d         |

+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
1 row in set (0.01 sec)

truncate TABLE t1;--truncate t1

mysql> SELECT * FROM t1;
Empty set (0.01 sec)

restore database db1 table t1 from pitr tab_pitr "2024-10-23 14:32:18";--恢复 pitr

mysql> SELECT * FROM t1;--Recovery successful

+------+
| n1   |

+------+
|    1 |

+------+
1 row in set (0.00 sec)
```

## 限制

- Deleted tenants do not currently support recovery.

- Cluster-level pitr can restore cluster basic and tenant levels.

- System tenant restoration from a normal tenant to a new tenant only allows tenant level restoration.

- Only the system tenant can perform restore data to the new tenant, and only tenant-level restores are allowed. New tenants need to be created in advance. In order to avoid object conflicts, it is best to create new tenants.
