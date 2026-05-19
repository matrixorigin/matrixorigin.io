---
title: "SHOW CREATE VIEW"
doc_type: reference
mysql_compat: partial
differs_from_mysql:
  - "DEFINER = user clause absent from output; SQL SECURITY {DEFINER|INVOKER} is emitted"
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "This statement shows the CREATE VIEW statement that creates the named view."
---
# **SHOW CREATE VIEW**

> This statement shows the CREATE VIEW statement that creates the named view.

## **Description**

This statement shows the `CREATE VIEW` statement that creates the named view.

Starting with v3.0.11, the rendered `Create View` column always includes the
stored `SQL SECURITY DEFINER` or `SQL SECURITY INVOKER` clause between the
leading `CREATE` keyword and `VIEW`, regardless of whether the original DDL
specified one. The security type is derived from the view's persisted
metadata; any text that happens to match `SQL SECURITY` inside the view body
is not interpreted as a security clause.

## **Syntax**

```
> SHOW CREATE VIEW view_name
```

## **Examples**

<!-- validator-ignore-exec -->
```sql
create table test_table(col1 int, col2 float, col3 bool, col4 Date, col5 varchar(255), col6 text);
create view test_view as select * from test_table;
mysql> show create view test_view;
+-----------+----------------------------------------------------------------------+
| View      | Create View                                                          |
+-----------+----------------------------------------------------------------------+
| test_view | create sql security definer view test_view as select * from test_table |
+-----------+----------------------------------------------------------------------+
1 row in set (0.01 sec)
```
