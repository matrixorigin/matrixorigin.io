# keep_user_target_list_in_result Keep query result set column names consistent with user specified case

In a MatrixOne query, keep the result set column names the same size as the name specified by the user, except by using aliases, or by setting parameters.

`keep_user_target_list_in_result` is a global parameter that MatrixOne sets whether the query result set column names match the user-specified name case.

## View keep_user_target_list_in_result

View `keep_user_target_list_in_result` in MatrixOne using the following command:

```sql
--default 1
show variables like "keep_user_target_list_in_result";
select @@keep_user_target_list_in_result;
```

## Set keep_user_target_list_in_result

Set `keep_user_target_list_in_result` in MatrixOne with the following command:

```sql
--default is 1, reconnecting to database takes effect 
set global keep_user_target_list_in_result = 0; 
```

## Examples

```sql
create table t1(aa int, bb int, cc int, AbC varchar(25), A_BC_d double);
insert into t1 values (1,2,3,'A',10.9);

mysql> select * from t1; 
+------+------+------+------+--------+
| aa   | bb   | cc   | abc  | a_bc_d |
+------+------+------+------+--------+
|    1 |    2 |    3 | A    |   10.9 |
+------+------+------+------+--------+
1 row in set (0.00 sec)

mysql> select @@keep_user_target_list_in_result; --Query parameter values, on by default
+-----------------------------------+
| @@keep_user_target_list_in_result |
+-----------------------------------+
| 1                                 |
+-----------------------------------+
1 row in set (0.01 sec)

mysql> select aA, bB, CC, abc, a_Bc_D from t1;--On, the query result set column names are case sensitive as specified by the user.
+------+------+------+------+--------+
| aA   | bB   | CC   | abc  | a_Bc_D |
+------+------+------+------+--------+
|    1 |    2 |    3 | A    |   10.9 |
+------+------+------+------+--------+
1 row in set (0.00 sec)

mysql> set global keep_user_target_list_in_result =0;--Turn off the query result set column name and user-specified name size consistency setting
Query OK, 0 rows affected (0.01 sec)

mysql> exit;--Parameters take effect after exiting the database and reconnecting

mysql> show variables like "keep_user_target_list_in_result";
+---------------------------------+-------+
| Variable_name                   | Value |
+---------------------------------+-------+
| keep_user_target_list_in_result | 0     |
+---------------------------------+-------+
1 row in set (0.00 sec)

mysql> select aA, bB, CC, abc, a_Bc_D from t1;--The column names of the query result set do not match the case of the user-specified name when the setting is turned off
+------+------+------+------+--------+
| aa   | bb   | cc   | abc  | a_bc_d |
+------+------+------+------+--------+
|    1 |    2 |    3 | A    |   10.9 |
+------+------+------+------+--------+
1 row in set (0.00 sec)
```
