---
title: "SHOW COLLATION"
doc_type: reference
mysql_compat: partial
differs_from_mysql:
  - "Only utf8mb4_bin is effective; other collations appear but are inert"
  - "MO 3.0.12 returns 11 collations (with `Default` and `Pad_attribute` columns); older doc examples show only 1 row with 5 columns"
  - "Output columns (Collation, Charset, Id, Default, Compiled, Sortlen, Pad_attribute) differ slightly from MySQL which also includes Pad_attribute"
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "This statement lists collations supported by MatrixOne."
---
# **SHOW COLLATION**

> This statement lists collations supported by MatrixOne.

## **Description**

This statement lists collations supported by MatrixOne. By default, the output from SHOW COLLATION includes all available collations. The LIKE clause, if present, indicates which collation names to match. The WHERE clause can be given to select rows using more general conditions.

## **Syntax**

```
> SHOW COLLATION
    [LIKE 'pattern' | WHERE expr]
```

## **Examples**

<!-- validator-ignore-exec -->
```sql
mysql> show collation;
+-------------------+---------+------+---------+----------+---------+---------------+
| Collation         | Charset | Id   | Default | Compiled | Sortlen | Pad_attribute |
+-------------------+---------+------+---------+----------+---------+---------------+
| armscii8_bin      | armscii8|   64 |         | Yes      |       1 | PAD SPACE     |
| armscii8_general_ci| armscii8|   32 |         | Yes      |       1 | PAD SPACE     |
| ascii_bin         | ascii   |   65 |         | Yes      |       1 | PAD SPACE     |
| ascii_general_ci  | ascii   |   11 |         | Yes      |       1 | PAD SPACE     |
| binary            | binary  |   63 |         | Yes      |       1 | PAD SPACE     |
| gbk_bin           | gbk     |   87 |         | Yes      |       1 | PAD SPACE     |
| gbk_chinese_ci    | gbk     |   28 |         | Yes      |       1 | PAD SPACE     |
| latin1_bin        | latin1  |   47 |         | Yes      |       1 | PAD SPACE     |
| latin1_swedish_ci | latin1  |    8 |         | Yes      |       1 | PAD SPACE     |
| utf8mb4_bin       | utf8mb4 |   46 |         | Yes      |       1 | NO PAD       |
| utf8mb4_general_ci| utf8mb4 |   45 |         | Yes      |       1 | NO PAD       |
+-------------------+---------+------+---------+----------+---------+---------------+
11 rows in set (0.00 sec)

mysql> show collation like 'utf8%';
+--------------------+---------+------+---------+----------+---------+---------------+
| Collation          | Charset | Id   | Default | Compiled | Sortlen | Pad_attribute |
+--------------------+---------+------+---------+----------+---------+---------------+
| utf8mb4_bin        | utf8mb4 |   46 |         | Yes      |       1 | NO PAD       |
| utf8mb4_general_ci | utf8mb4 |   45 |         | Yes      |       1 | NO PAD       |
+--------------------+---------+------+---------+----------+---------+---------------+
2 rows in set (0.00 sec)
```
