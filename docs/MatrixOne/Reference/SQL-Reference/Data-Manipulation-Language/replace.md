# **REPLACE**

## **Description**

`REPLACE` is a string function and a data manipulation statement for a replacement operation. The `REPLACE` statement functions to insert data into the table. If there is already a qualified record in the table, the record will be deleted first, and then new data will be inserted. New data will be inserted directly if there is no matching record in the table.

`REPLACE` is typically used on tables with unique constraints.

- The `REPLACE` statement requires that a primary key or unique index exist in the table to determine whether the same record exists.
- When using the `REPLACE` statement to insert a new record, the old record will be deleted if a record with the same primary key or unique index already exists. Then a new record will be inserted, which may cause the value of the auto-increment column to change.

## **Syntax**

```
REPLACE
    [INTO] tbl_name
    [(col_name [, col_name] ...)]
    { VALUES(value_list)
      |
      VALUES row_constructor_list
    }

REPLACE
    [INTO] tbl_name
    SET assignment_list

value:
    {expr | DEFAULT}

value_list:
    value [, value] ...

row_constructor_list:
    ROW(value_list)

assignment:
    col_name = value

assignment_list:
    assignment [, assignment] ...
```

### Explanations

The `REPLACE` statement inserts data into a table or updates existing data. Its syntax has two forms: an insert form based on column names and an update form based on the SET clause.

The following is an explanation of each parameter:

1. `INTO`: optional keyword indicating which table to insert or update data.

2. `tbl_name`: Indicates the table's name to insert or update data.

3. `col_name`: Optional parameter indicating the column's name to be inserted or updated. In the insert form, the column to be inserted can be specified by column name; in the update form, the column to be updated can be specified.

4. `value`: Indicates the value to be inserted or updated. It can be a concrete expression (expr) or a default value (DEFAULT).

5. `value_list`: Indicates a set of values ​​to be inserted. Separate multiple values ​​with commas.

6. (Not supported yet) `row_constructor_list`: Indicates a row consisting of a set of values ​​for insertion. Values ​​on each row are enclosed in parentheses and separated by commas.

7. `assignment`: Indicates the association between a column name and its corresponding value, which is used to update the form.

8. `assignment_list`: Indicates the association of multiple column names and corresponding values, which is used to update the form—separate multiple column names and values ​​with commas.

!!! note
    - When using the insert form, you can use the `VALUES` keyword followed by `value_list` means inserting one row of data.
    - When using the update form, use the `SET` keyword followed by `assignment_list` to specify the columns to update and the corresponding values.

## **Examples**

```sql
create table names(id int PRIMARY KEY,name VARCHAR(255),age int);

-- Insert a row of data, id=1, name="Abby", age=24
replace into names(id, name, age) values(1,"Abby", 24);
mysql> select name, age from names where id = 1;
+------+------+
| name | age  |
+------+------+
| Abby |   24 |
+------+------+
1 row in set (0.00 sec)

mysql> select * from names;
+------+------+------+
| id   | name | age  |
+------+------+------+
|    1 | Abby |   24 |
+------+------+------+
1 row in set (0.00 sec)

-- Use the replace statement to update the record with id=1 to have the values ​​"Bob" and 25 in the name and age columns
replace into names(id, name, age) values(1,"Bobby", 25);

mysql> select name, age from names where id = 1;
+-------+------+
| name  | age  |
+-------+------+
| Bobby |   25 |
+-------+------+
1 row in set (0.00 sec)

mysql> select * from names;
+------+-------+------+
| id   | name  | age  |
+------+-------+------+
|    1 | Bobby |   25 |
+------+-------+------+
1 row in set (0.01 sec)

-- Use the replace statement to insert a row of data, id=2, name="Ciro", age is NULL
replace into names set id = 2, name = "Ciro";

mysql> select name, age from names where id = 2;
+------+------+
| name | age  |
+------+------+
| Ciro | NULL |
+------+------+
1 row in set (0.01 sec)

mysql> select * from names;
+------+-------+------+
| id   | name  | age  |
+------+-------+------+
|    1 | Bobby |   25 |
|    2 | Ciro  | NULL |
+------+-------+------+
2 rows in set (0.00 sec)

-- Use the replace statement to update the record with id=2 to have the value of the name column "Ciro" and the value of the age column 17
replace into names set id = 2, name = "Ciro", age = 17;

mysql> select name, age from names where id = 2;
+------+------+
| name | age  |
+------+------+
| Ciro |   17 |
+------+------+
1 row in set (0.01 sec)

mysql> select * from names;
+------+-------+------+
| id   | name  | age  |
+------+-------+------+
|    1 | Bobby |   25 |
|    2 | Ciro  |   17 |
+------+-------+------+
2 rows in set (0.01 sec)
```

## **Constraints**

MatrixOne does not currently support rows of values ​​inserted using the `VALUES row_constructor_list` parameter.
