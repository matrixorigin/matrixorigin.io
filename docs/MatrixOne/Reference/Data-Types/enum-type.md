# The ENUM Type

"ENUM" is a list of strings used to store a set of predefined discrete values. It can define a type with discrete values, with each enumeration constant representing a specific value.

The "ENUM" data type is suitable for storing data with limited fixed values, such as status and identification.

The advantages of the "ENUM" data type are:

Improved readability of column values.
Compact data storage. When storing "ENUM" in MatrixOne, only the numerical index (1, 2, 3, ...) corresponding to the enumeration value is stored.

## Syntax

```
ENUM ('value1', 'value2', ..., 'valuen')
```

For example, to define an ENUM column, you can use the following syntax:

```sql
CREATE TABLE table_name (
    ...
    col ENUM ('value1','value2','value3'),
    ...
);
```

### Explanations

- `ENUM` is a keyword used to declare an enumeration type.
- value1 to valuen is the optional list of choices for this `ENUM` type. The value of a column using the `ENUM` type can only be one of the values listed above.
- Enumeration values can be of type string, int, or time.

__Note:__ You can have multiple enumeration values in the `ENUM` data type. However, it is recommended to keep the number of enumeration values below 20.

## Example Explanation

The value of an `ENUM` type must be selected from a predefined list of values. The following example will help you understand:

```sql
CREATE TABLE enumtable (
    id INT NOT NULL AUTO_INCREMENT,
    color ENUM('red', 'green', 'blue'),
    PRIMARY KEY (id)
);
```

The above statement will create a table named `enumtable`, which contains an enum type field named `color`. The value of the `color` field must be one of `red`, `green`, or `blue`. At the same time, according to the order of column definition, the indexes of `red`, `green`, and `blue` are 1, 2, and 3, respectively.

### Insert ENUM values

When inserting data into a field of an enumeration type, only predefined enumeration values ​​or `NULL` can be inserted. An error is raised if the inserted value is not in the predefined list. For example:

```sql
INSERT INTO enumtable (id, color) VALUES ('01', 'red');
-- 'red' is in the predefined list; the insertion was successful
INSERT INTO enumtable (id, color) VALUES ('02', 'yellow');
-- 'yellow' is not in the predefined list, an error will be generated
INSERT INTO enumtable (id, color) VALUES ('03', NULL);
-- The enumeration member does not define not null; the insertion is successful
```

In addition to enumeration values, data can be inserted into ENUM columns using numeric indexes on enumeration members. For example:

```sql
INSERT INTO enumtable (id, color) VALUES ('04', 2);
-- Since the index of `green` is 2, this data is successfully inserted
```

- **NON-NULL CONSTRAINT FOR ENUM RESTRICTIONS**

If we defined the `color` column `NOT NULL` when creating the table:

```sql
CREATE TABLE enumtable (
    id INT NOT NULL AUTO_INCREMENT,
    color ENUM('red', 'green', 'blue') NOT NULL,
    PRIMARY KEY (id)
);
```

When inserting a new row without specifying a value for the color column, MatrixOne will use the first enumeration member as the default value:

```sql
INSERT INTO enumtable (id) VALUES ('05');
-- Here, the first enumeration member `red` will be assigned as the default value for the column with id 05
```

## Features that are different from MySQL

Unlike MySQL, MatrixOne's ENUM type can only be compared with the string type in the WHERE condition.

You can see this example:

```sql
update orders set status= 2 where status='Processing';`
```

In this example, you must update the `status` to 2 for the row whose `status` is `Processing`. Due to the nature of the ENUM type, MatrixOne implicitly converts 2 to the string `2` in the WHERE condition, which is then compared with `Processing`.

## Constraints

1. Modifying ENUM enumeration members requires rebuilding the table using the `ALTER TABLE` statement.
2. MatrixOne does not support **Filtering ENUM values** and **Sorting ENUM values**.
