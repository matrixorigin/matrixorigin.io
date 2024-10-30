# **SHOW STAGES**

## **Syntax description**

`SHOW STAGES` returns stage specific information.

## **Grammar structure**

```
> SHOW STAGES [LIKE 'pattern']
```

## **Example**

```sql
mysql> create stage stage_fs url = 'file:///Users/admin/test';
Query OK, 0 rows affected (0.03 sec)

mysql> show stages;
+------------+--------------------------+----------+---------+
| STAGE_NAME | URL                      | STATUS   | COMMENT |
+------------+--------------------------+----------+---------+
| stage_fs   | file:///Users/admin/test | DISABLED |         |
+------------+--------------------------+----------+---------+
1 row in set (0.00 sec)
```
