# DROP SNAPSHOT

## Syntax Description

`DROP SNAPSHOT` is used to delete snapshots created under the current tenant.

## Syntax structure

```
> DROP SNAPSHOT snapshot_name;
```

## Examples

```sql
create snapshot sp1 for account sys;

mysql>  show snapshots;
+---------------+----------------------------+----------------+--------------+---------------+------------+
| SNAPSHOT_NAME | TIMESTAMP                  | SNAPSHOT_LEVEL | ACCOUNT_NAME | DATABASE_NAME | TABLE_NAME |
+---------------+----------------------------+----------------+--------------+---------------+------------+
| sp1           | 2024-05-10 09:55:11.601605 | account        | sys          |               |            |
+---------------+----------------------------+----------------+--------------+---------------+------------+
1 row in set (0.01 sec)

drop snapshot sp1;

mysql>  show snapshots;
Empty set (0.01 sec)
```
