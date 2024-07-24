# **CREATE FUNCTION...LANGUAGE PYTHON AS**

## **Grammar description**

`CREATE FUNCTION...LANGUAGE PYTHON AS` is used to create user-defined Python functions. Users use self-defined functions to meet customization needs and simplify query writing. UDFs can also be created by importing external Python files or external whl packages.

In some scenarios, we'd expect a python function to receive multiple tuples at once to run more efficiently, and MatrixOne provides vector options for functions to handle this.

MatrixOne Python UDF does not currently support overloading, and function names are required to be unique within a matrixone cluster.

## **Grammar structure**

```sql
> CREATE [ OR REPLACE ] FUNCTION <name> (
[ <arg_name> <arg_data_type> ] [ , ... ] )
RETURNS <result_data_type>  LANGUAGE PYTHON AS
$$
  <function_body>
[ add.vector = True ]
$$
HANDLER = '<function_name>'
```

## **Structural description**

- `<name>`: Specifies the name of the custom function.

- `<arg_name> <arg_data_type>`: Used to specify parameters for custom functions, where only the name and type are used.

- `RETURNS <result_data_type>`: The data type used to declare the return value of a custom function.

- `<function_body>`: The body portion of the custom function, which must contain a RETURN <value>statement that<value> specifies the return value of the custom function.

- `[add.vector = True` ]: Flags that the python function receives multiple tuples at once.

- `HANDLIER <function_name>:` Specifies the name of the python function called.

## Type Mapping

To ensure that the data types used in writing Python UDF are consistent with those supported by MatrixOne, you need to focus on the data type mapping relationship between the two, as follows:

| MatrixOne  Type                                           | Python Type          |
| -------------------------------------------------------- | --------------------------- |
| bool                                                     | bool                        |
| int8, int16, int32, int64, uint8, uint16, uint32, uint64 | int                         |
| float32, float64                                         | float                       |
| char, varchar, text, uuid                                | str                         |
| json                                                     | str, int, float, list, dict |
| time                                                     | datetime.timedelta          |
| date                                                     | datetime.date               |
| datetime, timestamp                                      | datetime.datetime           |
| decimal64, decimal128                                    | decimal.Decimal             |
| binary, varbinary, blob                                  | bytes                       |

## **Examples**

**Example 1**

```sql
--Sum of Two Numbers with python UDF
create or replace function py_add(a int, b int) returns int language python as 
$$
def add(a, b):
  return a + b
$$
handler 'add';

--call function
mysql> select py_add(1,2);
+--------------+
| py_add(1, 2) |
+--------------+
|            3 |
+--------------+
1 row in set (0.01 sec)
```

**Example 2**

```sql
create or replace function py_helloworld() returns varchar(255) language python as 
$$
def helloworld():
  return "helloworld!"
$$
handler 'helloworld';

mysql> select py_helloworld();
+-----------------+
| py_helloworld() |
+-----------------+
| helloworld!     |
+-----------------+
1 row in set (0.01 sec)
```