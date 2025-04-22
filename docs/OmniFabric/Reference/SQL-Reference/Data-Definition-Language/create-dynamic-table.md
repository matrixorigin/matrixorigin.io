# **CREATE DYNAMIC TABLE**

## **Grammar description**

`CREATE DYNAMIC TABLE` Adds a new dynamic table to the current database.

## **Grammar structure**

```sql
CREATE DYNAMIC TABLE [IF NOT EXISTS] table_name 
AS SELECT ... from stream_name ;
```

## Interpretation of grammar

- table_name: Dynamic table name. The dynamic table name must be different from any existing dynamic table name in the current database.
- stream_name: The name of the SOURCE that has been created.

## **Examples**

```sql
create dynamic table dt_test as select * from stream_test; Query OK, 0 rows affected (0.01 sec) 
```

## Limitations

The use of aggregate functions, mathematical functions, string functions, date functions, and `limit, offset`, `from subquery`, `not in/in subquery`, `group by`, `order by``, having` statements is not yet supported when creating dynamic tables.

Joins to two SOURCE tables, can join SOURCE tables, and normal data tables are not yet supported when creating dynamic tables.
