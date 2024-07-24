# **CREATE FUNCTION...LANGUAGE SQL AS**

## **Grammar description**

`CREATE FUNCTION...LANGUAGE SQL AS` is used to create SQL UDFs.

A SQL custom function is a user-written SQL function that performs custom actions based on specific needs. These functions can be used for tasks such as queries, data conversions, etc., making sQL code more modular and maintainable.

MatrixOne SQL UDF does not currently support overloading and function names are required to be unique within a matrixone cluster.

## **Grammar structure**

```sql
> CREATE [ OR REPLACE ] FUNCTION <name> (
[ <arg_name> <arg_data_type> ] [ , ... ] )
RETURNS <result_data_type>  LANGUAGE SQL AS 'function_body'
```

## **Structural description**

- `<name>`: Specifies the name of the custom function.

- `<arg_name> <arg_data_type>`: Used to specify parameters for custom functions, where only the name and type are used.

- `RETURNS <result_data_type>`: The data type used to declare the return value of a custom function, see [Data Type Overview](../../../Reference/Data-Types/data-types.md) for the complete data type

- `function_body`: The body part of the custom function. Users must use $1, $2, ... to reference parameters instead of the actual parameter name. The function body supports select statements and has unique return values. If the sql function body is not an expression and is a select statement on a table, the query should limit its results to 1 using limit 1 or an aggregate function without a group by clause.

## **Examples**

**Example 1**

```sql
--Creating an unparameterized sql custom function

mysql> create table t1(n1 int);
Query OK, 0 rows affected (0.02 sec)

mysql> insert into t1 values(1),(2),(3);
Query OK, 3 rows affected (0.01 sec)

mysql> CREATE FUNCTION t1_fun () RETURNS VARCHAR LANGUAGE SQL AS 'select n1 from t1 limit 1' ;
Query OK, 0 rows affected (0.01 sec)

mysql> select t1_fun();
+----------+
| t1_fun() |
+----------+
|        1 |
+----------+
1 row in set (0.01 sec)
```

**Example 2**

```sql
--Creating sql custom functions that return the sum of two arguments
mysql> CREATE FUNCTION twoadd (x int, y int) RETURNS int LANGUAGE SQL AS 'select $1 + $2' ;
Query OK, 0 rows affected (0.02 sec)

mysql> select twoadd(1,2);
+--------------+
| twoadd(1, 2) |
+--------------+
|            3 |
+--------------+
1 row in set (0.00 sec)
```