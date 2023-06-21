# **SPLIT_PART()**

## **Description**

The `SPLIT_PART()` function is used to split a string into multiple parts based on a given delimiter and returns the specified part.

If the specified part (designated by the unsigned_integer parameter) exceeds the actual number of existing parts, `SPLIT_PART()` will return `NULL`.

`SPLIT_PART()` counts parts from left to right only. If unsigned_integer is a negative number, an error will occur.

## **Syntax**

```
> SPLIT_PART(expr, delimiter, unsigned_integer)
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
|expr|Required. The string to be split.|
|delimiter|Required. The delimiter used to split the string.|
|unsigned_integer|Required. This is an integer specifying which part of the string to return. The first part is 1, the second part is 2, and so on.|

## **Examples**

- Example 1

```sql
-- Split the string 'axbxc' and use 'x' as the delimiter. This function will return the first part of the string 'axbxc'. Therefore, the result of executing this SQL statement is 'a' because 'a' is the first part of the string 'axbxc' split on the basis of the 'x' delimiter.
mysql> select split_part('axbxc','x',1);
+-------------------------+
| split_part(axbxc, x, 1) |
+-------------------------+
| a                       |
+-------------------------+
1 row in set (0.00 sec)
```

- Example 2

```sql
-- Create a new table 't1' with three columns: 'a' (varchar type), 'b' (varchar type), and 'c' (int type).
create table t1(a varchar,b varchar,c int);
-- Insert multiple rows of data into the 't1' table
insert into t1 values('axbxc','x',1),('axbxcxd','x',2),('axbxcxd','x',3),('axbxcxd','xc',1),('axbxcxd','xc',2),('axbxcxd','xc',3),('axbxcxd','asas',1),('axbxcxd','asas',2),(null,'asas',3),('axbxcxd',null,3),('axbxcxd','asas',null),('axxx','x',1),('axxx','x',2);
-- Query uses the split_part function to process each row in the 't1' table. For each row, it splits the value of the 'a' column into multiple parts (using the value of the 'b' column as the delimiter) and then returns the specified part (designated by the value of the 'c' column). For example, for the first row of data ('axbxc', 'x', 1), it returns 'a' because 'a' is the first part of the string 'axbxc' split on the basis of the 'x' delimiter.
mysql> select split_part(a,b,c) from t1;
+---------------------+
| split_part(a, b, c) |
+---------------------+
| a                   |
| b                   |
| c                   |
| axb                 |
| xd                  |
| NULL                |
| axbxcxd             |
| NULL                |
| NULL                |
| NULL                |
| NULL                |
| a                   |
| NULL                |
+---------------------+
13 rows in set (0.01 sec)
```
