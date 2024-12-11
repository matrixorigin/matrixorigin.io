# Illegal login restrictions

Today, when data security is increasingly important, reasonable connection control and password management strategies are the key to database protection. MatrixOne provides a series of global parameters designed to enhance connection security and password management to prevent malicious attacks and unauthorized access.

- Connection control parameters
    - `connection_control_failed_connections_threshold`: This parameter sets the maximum number of failed connections allowed in a short period of time. When the threshold is exceeded, MatrixOne will reject further connection attempts from the client, effectively preventing brute force and malicious attacks.
    - `connection_control_max_connection_delay`: This parameter specifies the maximum delay time that the client needs to wait after the connection fails. This delay will be applied after the number of failed connections reaches a threshold to prevent further connection attempts and increase the cost of malicious attacks.

- Password management parameters
    - `default_password_lifetime`: This parameter specifies the validity period of the user password in days. The default value is 0, which means the password will never expire. When the password expires, the user can still log in to the database, but cannot perform SQL operations unless the password is changed through `ALTER USER`.
    - `password_history`: This parameter restricts users from using recent password history when changing passwords. If set to 5, the user will not be able to reuse the last 5 passwords. This configuration can effectively avoid security risks caused by password reuse.
    - `password_reuse_interval`: This parameter controls the user's ability to reuse historical passwords within a specified time range after the password expires. The unit is days, and the default value is 0, which means no reuse check of historical passwords is performed.

## Check

```sql
SELECT @@global.connection_control_failed_connections_threshold; --Default value is 3
SELECT @@global.connection_control_max_connection_delay; --Default value is 0
SELECT @@global.default_password_lifetime; --Default value is 0
SELECT @@global.password_history; --Default value is 0
SELECT @@global.password_reuse_interval; --Default value is 0
```

## set up

After setting, you need to exit and reconnect to take effect.

```sql
set global connection_control_failed_connections_threshold=xx;
set global connection_control_max_connection_delay=xx;--Unit: ms
set global default_password_lifetime=xx;--unit is days
set global password_history=xx;
set global password_reuse_interval=xx;--unit is days
```

## Example

### connection_control_failed_connections_threshold & connection_control_max_connection_delay

```sql
mysql> SELECT @@global.connection_control_failed_connections_threshold;
+---------------------------------------------------+
| @@connection_control_failed_connections_threshold |
+---------------------------------------------------+
| 3                                                 |
+---------------------------------------------------+
1 row in set (0.00 sec)

mysql> SELECT @@global.connection_control_max_connection_delay;
+-------------------------------------------+
| @@connection_control_max_connection_delay |
+-------------------------------------------+
| 0                                         |
+-------------------------------------------+
1 row in set (0.00 sec)

set global connection_control_failed_connections_threshold=2;
set global connection_control_max_connection_delay=10000;

--exit,Log out and reconnect
mysql> SELECT @@global.connection_control_failed_connections_threshold;
+---------------------------------------------------+
| @@connection_control_failed_connections_threshold |
+---------------------------------------------------+
| 2                                                 |
+---------------------------------------------------+
1 row in set (0.00 sec)

mysql> SELECT @@global.connection_control_max_connection_delay;
+-------------------------------------------+
| @@connection_control_max_connection_delay |
+-------------------------------------------+
| 10000                                     |
+-------------------------------------------+
1 row in set (0.00 sec)

--Create a normal user and grant permissions
create user user1 identified by '111';
create role role1;
grant create database on account * to role1;
grant alter user on account * to role1;
grant role1 to user1;
```

Trying to log in user1 with wrong password

```bash
#First time: logging in with wrong password
(base) admin@admindeMacBook-Pro matrixorigin.io.cn % mysql -u user1 -h 127.0.0.1 -P 6001 -p123
mysql: [Warning] Using a password on the command line interface can be insecure.
ERROR 1045 (28000): Access denied for user user1. internal error: check password failed

#Second time: Log in with wrong password
(base) admin@admindeMacBook-Pro matrixorigin.io.cn % mysql -u user1 -h 127.0.0.1 -P 6001 -p123
mysql: [Warning] Using a password on the command line interface can be insecure.
ERROR 1045 (28000): Access denied for user user1. internal error: check password failed

#Third time: Log in with the correct password
(base) admin@admindeMacBook-Pro matrixorigin.io.cn % mysql -u user1 -h 127.0.0.1 -P 6001 -p111
mysql: [Warning] Using a password on the command line interface can be insecure.
ERROR 20101 (HY000): internal error: user is locked, please try again later

#Wait about ten seconds and log in again. The login is successful.
(base) admin@admindeMacBook-Pro matrixorigin.io.cn % mysql -u user1 -h 127.0.0.1 -P 6001 -p111
mysql: [Warning] Using a password on the command line interface can be insecure.
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 2662
Server version: 8.0.30-MatrixOne-v MatrixOne

Copyright (c) 2000, 2018, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> 

```

### default_password_lifetime

```sql
mysql> SELECT @@global.default_password_lifetime;
+-----------------------------+
| @@default_password_lifetime |
+-----------------------------+
| 0                           |
+-----------------------------+
1 row in set (0.00 sec)

set global default_password_lifetime=1;

mysql> SELECT @@global.default_password_lifetime; --Effective after reconnection
+-----------------------------+
| @@default_password_lifetime |
+-----------------------------+
| 1                           |
+-----------------------------+
1 row in set (0.00 sec)
```

Stop mo and modify the system time to 1 month later

```bash
# stop mo
>mo_ctl stop

# Modify the system time to 1 month later
> sudo date "122518302024"
Wed Dec 25 18:30:00 CST 2024

#View modified time
> date
Wed Dec 25 18:30:02 CST 2024

#Start mo
>mo_ctl start

#Root user connects to mo and confirms the current time
>mo_ctl connect

mysql> select current_timestamp;
+----------------------------+
| current_timestamp()        |
+----------------------------+
| 2024-12-25 18:32:30.664877 |
+----------------------------+
1 row in set (0.00 sec)

#Try to log in as a normal user. You are expected to be able to log in, but you cannot execute SQL statements other than alter user xxx identified by 'xxxx';; the dump user is not subject to this restriction.
>mysql -u sys:user1:role1 -h 127.0.0.1 -P 6001 -p123

mysql> create database db1;
ERROR 20101 (HY000): internal error: password has expired, please change the password
mysql> alter user user1 identified by '123';
Query OK, 0 rows affected (0.01 sec)

#Log in with changed password
>mysql -u sys:user1:role1 -h 127.0.0.1 -P 6001 -p123

mysql> create database db1;
Query OK, 1 row affected (0.03 sec)
```

### password_history

```sql
mysql> SELECT @@global.password_history;
+--------------------+
| @@password_history |
+--------------------+
| 0                  |
+--------------------+
1 row in set (0.00 sec)

set global password_history=2;

mysql> SELECT @@global.password_history;
+--------------------+
| @@password_history |
+--------------------+
| 2                  |
+--------------------+
1 row in set (0.01 sec)

mysql> create user user2 identified by '111';
Query OK, 0 rows affected (0.03 sec)
--Change password to '123', successful
mysql> alter user user2 identified by '123';
Query OK, 0 rows affected (0.02 sec)

--Changing the password to 111 failed because password_history=2 and MatrixOne will retain the history of the last 2 passwords.
mysql> alter user user2 identified by '111';
ERROR 20301 (HY000): invalid input: The password has been used before, please change another one.

--Change password to '123', successful
mysql> alter user user2 identified by '234';
Query OK, 0 rows affected (0.02 sec)

--Change the password again to '111', successful
mysql> alter user user2 identified by '111';
Query OK, 0 rows affected (0.01 sec)
```

### password_reuse_interval

```sql
mysql> select @@global.password_reuse_interval;
+---------------------------+
| @@password_reuse_interval |
+---------------------------+
| 0                         |
+---------------------------+
1 row in set (0.00 sec)

mysql> set global password_reuse_interval=30;
Query OK, 0 rows affected (0.00 sec)

mysql> select @@global.password_reuse_interval; --Effective after reconnection
+---------------------------+
| @@password_reuse_interval |
+---------------------------+
| 30                        |
+---------------------------+
1 row in set (0.02 sec)

--Create user user3
create user user3 identified by '111';

--Modify user password, successful
mysql> alter user user3 identified by '123';
Query OK, 0 rows affected (0.02 sec)

--After changing the system time to ten days and then restarting mo, I changed the user3 password to '111', which failed.
mysql> alter user user3 identified by '111';
ERROR 20301 (HY000): invalid input: The password has been used before, please change another one

--After changing the system time to two months, restart mo and change user3 password to '111', successful
mysql>  alter user user3 identified by '111';
Query OK, 0 rows affected (0.01 sec)
```