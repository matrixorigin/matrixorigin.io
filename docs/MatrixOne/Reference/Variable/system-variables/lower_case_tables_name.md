# `lower_case_table_names` support

There are 5 different modes for the MatrixOne case sensitivity, and the case parameter `lower_case_table_names` can be set to 0, 1, 2, 3, or 4.

## Parameter Explanation

### Setting Parameter Value to 0

Setting `lower_case_table_names` to 0 stores identifiers as the original strings, and name comparisons are case sensitive.

**Examples**

```sql
set global lower_case_table_names = 0;
create table Tt (Aa int);
insert into Tt values (1), (2), (3);

mysql> select Aa from Tt;
+------+
| Aa   |
+------+
|    1 |
|    2 |
|    3 |
+------+
3 rows in set (0.03 sec)
```

### Setting Parameter Value to 1

Setting `lower_case_table_names` to 1 stores identifiers as lowercase, and name comparisons are case insensitive.

**Examples**

```sql
set global lower_case_table_names = 1;
create table Tt (Aa int);
insert into Tt values (1), (2), (3);

mysql> select Aa from Tt;
+------+
| aa   |
+------+
|    1 |
|    2 |
|    3 |
+------+
3 rows in set (0.03 sec)
```

```sql
set global lower_case_table_names = 1;
create table t(a int);
insert into t values(1), (2), (3);

-- Column aliases display the original string when the result set is returned, but name comparisons are case insensitive, as shown in the following example:
mysql> select a as Aa from t;
+------+
| Aa   |
+------+
|    1 |
|    2 |
|    3 |
+------+
3 rows in set (0.03 sec)
```

### Setting Parameter Value to 2

Setting `lower_case_table_names` to 2 stores identifiers as the original strings, and name comparisons are case insensitive.

**Examples**

```sql
set global lower_case_table_names = 2;
create table Tt (Aa int);
insert into tt values (1), (2), (3);

mysql> select AA from tt;
+------+
| Aa   |
+------+
|    1 |
|    2 |
|    3 |
+------+
3 rows in set (0.03 sec)
```

### Setting Parameter Value to 3

Setting `lower_case_table_names` to 3 stores identifiers as uppercase, and name comparisons are case insensitive.

**Examples**

```sql
set global lower_case_table_names = 3;
create table Tt (Aa int);
insert into Tt values (1), (2), (3);

mysql> select Aa from Tt;
+------+
| AA   |
+------+
|    1 |
|    2 |
|    3 |
+------+
3 rows in set (0.03 sec)
```

### Setting Parameter Value to 4

Setting `lower_case_table_names` to 4 stores identifiers with `` as the original strings and case sensitive, while others are converted to lowercase.

## Configuration Parameters

- To configure globally, insert the following code in the cn.toml configuration file before starting MatrixOne:

```
[cn.frontend]
lowerCaseTableNames = "0" // default is 1
# 0 stores identifiers as the original strings and name comparisons are case sensitive
# 1 stores identifiers as lowercase and name comparisons are case insensitive
# 2 stores identifiers as the original strings and name comparisons are case insensitive
# 3 stores identifiers as uppercase and name comparisons are case insensitive
# 4 stores identifiers with `` as the original strings and case sensitive, while others are converted to lowercase
```

When configuring globally, each cn needs to be configured if multiple cns are started. For configuration file parameter instructions, see[Boot Parameters for standalone installation](../../System-Parameters/system-parameter.md).

!!! note
    Currently, you can only set the parameter to 0 or 1. However, the parameter 2,3 or 4 is not supported.

- To enable saving query results only for the current session:

```sql
set global lower_case_table_names = 1;
```

When creating a database, MatrixOne automatically obtains the value of `lower_case_table_names` as the default value for initializing the database configuration.

## Features that are different from MySQL

MatrixOne lower_case_table_names is set to 1 by default and only supports setting the value to 0 or 1.

The default value in MySQL:

- On Linux: 0. Table and database names are stored on disk using the letter case specified in the CREATE TABLE or CREATE DATABASE statement. Name comparisons are case-sensitive.
- On Windows: 1. It means that table names are stored in lowercase on disk, and name comparisons are not case-sensitive. MySQL converts all table names to lowercase on storage and lookup. This behavior also applies to database names and table aliases.
- On macOS: 2. Table and database names are stored on disk using the letter case specified in the CREATE TABLE or CREATE DATABASE statement, but MySQL converts them to lowercase on lookup. Name comparisons are not case-sensitive.

## **Constraints**

MatrixOne system variable `lower_case_table_names` does not currently support setting values 2, 3, or 4.
