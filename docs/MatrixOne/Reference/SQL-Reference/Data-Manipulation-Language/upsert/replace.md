# **REPLACE**

## **Grammar description**

`REPLACE` is not only a string function, but also a data manipulation statement for a replacement operation. The effect of the `REPLACE` statement is to insert data into the table. If an eligible record already exists in the table, the record is deleted before the new data is inserted. If no eligible records exist in the table, the new data is inserted directly.

`REPLACE` is typically used in tables with unique constraints.

- The `REPLACE` statement requires that a primary key or unique index must be present in the table to determine if the same record already exists.
- When inserting a new record using the `REPLACE` statement, if a record with the same primary key or unique index already exists, the old record is deleted and the new record is inserted, which may cause the value to change since it was added.

## **Grammar structure**

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

### Parameter interpretation

`REPLACE` statements are used to insert data into a table or to update existing data. Its syntax takes two forms: an insert based on the column name, and an update based on the SET clause.

The following is an explanation of each parameter:

1. `INTO`: Optional keyword indicating which table to insert or update data into.

2. `tbl_name`: Indicates the name of the table into which data is to be inserted or updated.

3. `col_name`: Optional parameter indicating the column name to insert or update. In insert form, you can specify which columns to insert by column name; in update form, specify which columns to update.

4. `value`: Indicates the value to insert or update. This can be a specific expression (expr) or default (DEFAULT).

5. `value_list`: Represents a set of values to insert. Multiple values are separated by commas.

6. (Not yet supported) `row_constructor_list`: Represents a row consisting of a set of values used for insertion. The values for each line are enclosed in parentheses and separated by commas.

7. `assignment`: Represents the association of a column name with its corresponding value for updating the form.

8. `assignment_list`: Represents an association of multiple column names and corresponding values for updating forms. Multiple column names and values are separated by commas.

!!! note
    When using insert form, you can insert data using the `VALUES` keyword followed by `value_list` or `row_constructor_list`. `VALUES is` followed by `value_list` for inserting a row of data, and `VALUES` is followed by `row_constructor_list` for inserting multiple rows of data. - When using the update form, use the `SET` keyword followed by `assignment_list` to specify the columns and corresponding values to update.

## **Examples**

```sql
create table names(id int PRIMARY KEY,name VARCHAR(255),age int);

-- Insert a row of data with id=1, name="Abby", age=24
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

-- Use the replace statement to update the name and age columns of the record with id=1 to the values "Bob" and 25.
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

-- Use the replace statement to insert a row with id=2, name="Ciro", and age NULL.
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

-- Use the replace statement to update the name column of the record with id=2 to the value "Ciro" and the age column to the value 17
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

## **Restrictions**

MatrixOne does not currently support rows consisting of a set of values inserted using the `VALUES row_constructor_list` parameter.
