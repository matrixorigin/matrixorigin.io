# lower_case_table_names Case sensitive support

`lower_case_table_names` is a global variable that MatrixOne sets whether case is sensitive.

!!! note
    Unlike mysql, MatrixOne supports only **0** and **1** modes for now, and defaults to 1 on both linux and mac systems.

## View lower_case_table_names

View `lower_case_table_names` in MatrixOne using the following command:

```sql
show variables like "lower_case_table_names"; -- defaults to 1
```

## Set lower_case_table_names

Set `lower_case_table_names` in MatrixOne with the following command:

```sql
set global lower_case_table_names = 0; --default is 1, reconnecting to database takes effect
```

## Explanation of parameters

### parameter is set to 0

Set `lower_case_table_names` to 0. Identifiers are stored as raw strings with names that are case sensitive.

**Examples**

```sql
mysql> show variables like "lower_case_table_names";--Check the default parameter, the default value is 1
+------------------------+-------+
| Variable_name          | Value |
+------------------------+-------+
| lower_case_table_names | 1     |
+------------------------+-------+
1 row in set (0.00 sec)

set global lower_case_table_names = 0;--Reconnecting to the database takes effect

mysql> show variables like "lower_case_table_names";--Reconnect to the database to view the parameters, the change was successful
+------------------------+-------+
| Variable_name          | Value |
+------------------------+-------+
| lower_case_table_names | 0     |
+------------------------+-------+
1 row in set (0.00 sec)

create table Tt (Aa int);
insert into Tt values (1), (2), (3);

mysql> select Aa from Tt;--Name comparison is case sensitive
+------+
| Aa   |
+------+
|    1 |
|    2 |
|    3 |
+------+
3 rows in set (0.03 sec)
```

### Parameter set to 1

 Set `lower_case_table_names` to 1. identifiers are stored in lowercase and name comparisons are case insensitive.

**Example**

```sql
set global lower_case_table_names = 1;--Reconnecting to the database takes effect

mysql> show variables like "lower_case_table_names";--Reconnect to the database to view the parameters, the change was successful
+------------------------+-------+
| Variable_name          | Value |
+------------------------+-------+
| lower_case_table_names | 1     |
+------------------------+-------+
1 row in set (0.00 sec)

create table Tt (Aa int,Bb int);
insert into Tt values (1,2), (2,3), (3,4);

mysql> select Aa from Tt;--Name comparison is case insensitive
+------+
| aa   |
+------+
|    1 |
|    2 |
|    3 |
+------+
3 rows in set (0.03 sec)

-- The alias of a column displays the original string when the result set is returned, but the name comparison is case insensitive, as shown in the following example:
mysql> select Aa as AA,Bb from Tt;
+------+------+
| AA   | bb   |
+------+------+
|    1 |    2 |
|    2 |    3 |
|    3 |    4 |
+------+------+
3 rows in set (0.00 sec)
```