---
title: "SHOW STAGES"
doc_type: reference
mysql_compat: mo_only
differs_from_mysql: []
mo_only:
  - "SHOW STAGES"
since: unknown
last_updated: 2026-05-08
llms_summary: "SHOW STAGES returns stage specific information."
---
# **SHOW STAGES**

> SHOW STAGES returns stage specific information.

## **Syntax description**

`SHOW STAGES` returns stage specific information.

## **Grammar structure**

```
> SHOW STAGES [LIKE 'pattern']
```

## **Example**

<!-- validator-ignore-exec -->
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
