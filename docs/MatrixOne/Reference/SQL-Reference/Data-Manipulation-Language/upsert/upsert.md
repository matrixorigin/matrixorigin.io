# UPSERT

## What is Upsert in SQL?

`UPSERT` is one of the basic functions of a database management system to manage a database. It is a combination of `UPDATE` and `INSERT` that allows the database operation language to insert a new piece of data into a table or update existing data. An `INSERT` operation is triggered when a `UPSERT` operation is a new piece of data, and `UPSERT is` similar to the `UPDATE` statement if the record already exists in the table.

For example, we have a `student` table with the `id` column as the primary key:

```sql
> desc student;
+-------+-------------+------+------+---------+-------+---------+
| Field | Type        | Null | Key  | Default | Extra | Comment |
+-------+-------------+------+------+---------+-------+---------+
| id    | INT(32)     | NO   | PRI  | NULL    |       |         |
| name  | VARCHAR(50) | YES  |      | NULL    |       |         |
+-------+-------------+------+------+---------+-------+---------+
```

We can use `upsert` when changing student information in this table. The logic goes like this:

- If a student id exists in the table, update the row with new information.

- If no students exist in the table, add them as new rows.

However, the `UPSERT` command does not exist in Matrixone, but `UPSERT` can still be implemented. By default, Matrixone provides three ways to implement Matrixone UPSERT operations:

- [INSERT IGNORE](insert-ignore.md)

- [INSERT ON DUPLICATE KEY UPDATE](insert-on-duplicate.md)

- [REPLACE](replace.md)

## INSERT IGNORE

When we insert illegal rows into a table, the `INSERT IGNORE` statement ignores the execution error. For example, the primary key column does not allow us to store duplicate values. When we insert a piece of data into a table using INSERT and the primary key of that data already exists in the table, the Matrixone server generates an error and the statement execution fails. However, when we execute this statement using `INSERT IGNORE`, the Matrixone server will not generate an error.

## REPLACE

In some cases, we want to update data that already exists. You can use `REPLACE` at this point. When we use the REPLACE command, two things can happen:

- If there is no corresponding record in the database, the standard `INSERT` statement is executed.

- If there are corresponding records in the database, the `REPLACE` statement deletes the corresponding records in the database before executing the standard INSERT statement (this update is performed when the primary key or unique index is duplicated)

In a `REPLACE` statement, updating data is done in two steps: deleting the original record and then inserting the record you want to update.

## INSERT ON DUPLICATE KEY UPDATE

We've looked at two `UPSERT` commands so far, but both have some limitations. `INSERT ON DUPLICATE KEY IGNORE` simply ignores the `duplicate error`. `REPLACE` detects `INSERT errors`, but it deletes the old data before adding it. So we still need a better solution.

`INSERT ON DUPLICATE KEY UPDATE` is a better solution. It doesn't remove duplicate rows. When we use the `ON DUPLICATE KEY UPDATE` clause in a SQL statement and one row of data produces a `duplicate error` on the primary key or unique index, we update the existing data.
