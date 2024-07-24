# SQL Mode

sql_mode is a system parameter in MatrixOne that specifies the mode in which MatrixOne performs queries and operations. sql\_mode can affect the syntax and semantic rules of MatrixOne, changing the behavior of MatrixOne queries for SQL. In this article, you will be introduced to the mode of sql\_mode, what it does, and how to set SQL mode.

!!! note
    MatrixOne currently supports only the `ONLY_FULL_GROUP_BY` mode. Other modes are syntax-only. `ONLY_FULL_GROUP_BY` is used to control the behavior of the GROUP BY statement. When `ONLY_FULL_GROUP_BY` mode is enabled, MatrixOne requires that the columns in the GROUP BY clause in the SELECT statement must be aggregate functions (such as SUM, COUNT, etc.) or columns that appear in the GROUP BY clause. If there are columns in the SELECT statement that do not meet this requirement, an error will be thrown. If your table structure is complex, you can choose to turn `ONLY_FULL_GROUP_BY` mode off for easy querying.

## View sql_mode

View sql_mode in MatrixOne using the following command:

```sql
SELECT @@global.sql_mode; --global mode 
SELECT @@session.sql_mode; --session mode 
```

## Set sql_mode

Set sql_mode in MatrixOne using the following command:

```sql
set global sql_mode = 'xxx' -- global mode, reconnecting to database takes effect 
set session sql_mode = 'xxx' -- session mode 
```

## Examples

```sql
CREATE TABLE student(
id int,
name char(20),
age int,
nation char(20)
);

INSERT INTO student values(1,'tom',18,'上海'),(2,'jan',19,'上海'),(3,'jen',20,'北京'),(4,'bob',20,'北京'),(5,'tim',20,'广州');

mysql> select * from student group by nation;--This operation is not supported in `ONLY_FULL_GROUP_BY` mode
ERROR 1149 (HY000): SQL syntax error: column "student.id" must appear in the GROUP BY clause or be used in an aggregate function

mysql> SET session sql_mode='ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION,NO_ZERO_DATE,NO_ZERO_IN_DATE,STRICT_TRANS_TAB
LES';--Turns off ONLY_FULL_GROUP_BY mode for the current session
Query OK, 0 rows affected (0.02 sec)

mysql> select * from student group by nation;--Turns off `ONLY_FULL_GROUP_BY` mode immediately in the current session
+------+------+------+--------+
| id   | name | age  | nation |
+------+------+------+--------+
|    1 | tom  |   18 | 上海   |
|    3 | jen  |   20 | 北京   |
|    5 | tim  |   20 | 广州   |
+------+------+------+--------+
3 rows in set (0.00 sec)

mysql> SET global sql_mode='ONLY_FULL_GROUP_BY';--Set the global ONLY_FULL_GROUP_BY mode on.
Query OK, 0 rows affected (0.02 sec)

mysql> select * from student group by nation;--ONLY_FULL_GROUP_BY mode does not take effect, because you need to reconnect to the database for global mode to take effect.
+------+------+------+--------+
| id   | name | age  | nation |
+------+------+------+--------+
|    1 | tom  |   18 | 上海   |
|    3 | jen  |   20 | 北京   |
|    5 | tim  |   20 | 广州   |
+------+------+------+--------+
3 rows in set (0.00 sec)

mysql> exit --Exit the current session

mysql> select * from student group by nation;--After reconnecting the database and executing the query, ONLY_FULL_GROUP_BY mode is successfully enabled.
ERROR 1149 (HY000): SQL syntax error: column "student.id" must appear in the GROUP BY clause or be used in an aggregate function
```