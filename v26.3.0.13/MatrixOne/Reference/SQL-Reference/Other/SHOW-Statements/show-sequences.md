---
title: "SHOW SEQUENCES"
doc_type: reference
mysql_compat: mo_only
differs_from_mysql: []
mo_only:
  - "SHOW SEQUENCES"
since: unknown
last_updated: 2026-05-08
llms_summary: "SHOW SEQUENCES is used to view the name and list type of the current sequence list."
---
# **SHOW SEQUENCES**

> SHOW SEQUENCES is used to view the name and list type of the current sequence list.

## **Description**

`SHOW SEQUENCES` is used to view the name and list type of the current sequence list.

## **Syntax**

```
> SHOW SEQUENCES
       [WHERE expr]
```

## **Examples**

<!-- validator-ignore-exec -->
```sql
CREATE SEQUENCE s1 START 101;
CREATE SEQUENCE s3 as smallint INCREMENT 10 MINVALUE -100 MAXVALUE 100 START 0 CYCLE;
CREATE SEQUENCE seq_id INCREMENT BY 1 MAXVALUE 1000 START with 1;
mysql> show sequences;
+--------+-----------+
| Names  | Data Type |
+--------+-----------+
| s3     | SMALLINT  |
| s1     | BIGINT    |
| seq_id | BIGINT    |
+--------+-----------+
3 rows in set (0.01 sec)
```
