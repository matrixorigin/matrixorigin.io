# **TRUNCATE TABLE**

## **Description**

The `TRUNCATE TABLE` statement deletes all rows in a table without logging individual row deletions. `TRUNCATE TABLE` is similar to a `DELETE` statement without a `WHERE` clause; however, `TRUNCATE TABLE` is faster and uses fewer system and transaction log resources.

`TRUNCATE TABLE` has the following characteristics:

- It cannot be restored after the `TRUNCATE TABLE` is deleted.

- If the table has an `AUTO_INCREMENT` column, the `TRUNCATE TABLE` statement resets the auto-increment value to zero.

- The `TRUNCATE TABLE` statement deletes rows individually if the table has `FOREIGN KEY` constraints.

- If the table does not have any `FOREIGN KEY` constraints, the `TRUNCATE TABLE` statement will drop the table and recreate a new one with the same structure

The difference between `DROP TABLE`, `TRUNCATE TABLE`, and `DELETE TABLE`:

- `DROP TABLE`: Use `DROP TABLE` when you no longer need the table.
- `TRUNCATE TABLE`: Use `TRUNCATE TABLE` to keep the table, but delete all records.
- `DELETE TABLE`: When you want to delete some records, use `DELETE TABLE`.

## **Syntax**

```
> TRUNCATE [TABLE] table_name;
```

### Explanations

#### TABLE

The TABLE keyword is optional. Use this to distinguish the `TRUNCATE TABLE` statement from the `TRUNCATE` function.

## **Examples**

```sql
create table index_table_05 (col1 bigint not null auto_increment,col2 varchar(25),col3 int,col4 varchar(50),primary key (col1),unique key col2(col2),key num_id(col4));
insert into index_table_05(col2,col3,col4) values ('apple',1,'10'),('store',2,'11'),('bread',3,'12');
mysql> select * from index_table_05;
+------+-------+------+------+
| col1 | col2  | col3 | col4 |
+------+-------+------+------+
|    1 | apple |    1 | 10   |
|    2 | store |    2 | 11   |
|    3 | bread |    3 | 12   |
+------+-------+------+------+
3 rows in set (0.00 sec)

mysql> truncate table index_table_05;
Query OK, 0 rows affected (0.12 sec)

mysql> select * from index_table_05;
Empty set (0.03 sec)
```
