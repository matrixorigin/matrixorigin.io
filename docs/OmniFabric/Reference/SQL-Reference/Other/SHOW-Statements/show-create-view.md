# **SHOW CREATE VIEW**

## **Description**

This statement shows the `CREATE VIEW` statement that creates the named view.

## **Syntax**

```
> SHOW CREATE VIEW view_name
```

## **Examples**

```sql
create table test_table(col1 int, col2 float, col3 bool, col4 Date, col5 varchar(255), col6 text);
create view test_view as select * from test_table;
mysql> show create view test_view;
+-----------+---------------------------------------------------+
| View      | Create View                                       |
+-----------+---------------------------------------------------+
| test_view | create view test_view as select * from test_table |
+-----------+---------------------------------------------------+
1 row in set (0.01 sec)
```
