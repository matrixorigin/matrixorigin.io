# Create accounts, Verify Resource Isolation

When initializing access to the MatrixOne cluster, the system will automatically generate a default cluster administrator. The cluster administrator is automatically granted the authority to manage accounts by default, but cannot manage resources under the account.

This document will guide you to use the cluster administrator to create two new accounts, grant the permissions of the accountadmin, and check whether the resource isolation between accounts is implemented.

## Before you start

- MatrixOne cluster has been depolyed and connected.
- You have obtained the cluster administrator user name and password (The default user name and password are root and 111 respectively).

## Steps

1. Log into MatrixOne with the cluster administrator's username (root by default) and password:

    ```
    mysql -h 127.0.0.1 -P 6001 -u root -p
    ```

2. Create a new account:

    - The login username and password of account *a1* are: admin1, test123
    - The login username and password of account *a2* are: admin2, test456

    ```
    create account a1 ADMIN_NAME 'admin1' IDENTIFIED BY 'test123';
    create account a2 ADMIN_NAME 'admin2' IDENTIFIED BY 'test456';
    ```

3. Use admin1 to log in to account *a1*, and create data table *db1.t1*:

    ```
    mysql -h 127.0.0.1 -P 6001 -u a1:admin1 -p
    create database db1;
    create table db1.t1(c1 int,c2 varchar);
    insert into db1.t1 values (1,'shanghai'),(2,'beijing');
    ```

    Use the following command to verify whether the table was created successfully for account *a1*:

    ```
    mysql> select * from db1.t1;
    +------+----------+
    | c1   | c2       |
    +------+----------+
    |    1 | shanghai |
    |    2 | beijing  |
    +------+----------+
    2 rows in set (0.01 sec)
    ```

4. Login to account *a2* using admin2:

    ```
    mysql -h 127.0.0.1 -P 6001 -u a2:admin2 -p
    ```

    Check *db1.t1* data in account *a1*:

    ```
    mysql> select * from db1.t1;
    ERROR 1064 (HY000): SQL parser error: table "t1" does not exist
    ```

    The above command runs an error, which proves that the database *db1* in the account *a1* cannot be seen in the account *a2*:

5. The database *db1* and table *db1.t1* can also be created in the account *a2*:

    ```
    mysql> create database db1;
    Query OK, 0 rows affected (0.03 sec)

    mysql> create table db1.t1(c1 int,c2 varchar);
    Query OK, 0 rows affected (0.05 sec)

    mysql> insert into db1.t1 values (3,'guangzhou');
    Query OK, 1 row affected (0.05 sec)
    ```

    Insert different data into table *db1.t1* of account *a2* from table *db1.t1* in account *a1* and check:

    ```
    mysql> insert into db1.t1 values (3,'guangzhou');
    Query OK, 1 row affected (0.05 sec)

    mysql> select * from db1.t1;
    +------+-----------+
    | c1   | c2        |
    +------+-----------+
    |    3 | guangzhou |
    +------+-----------+
    1 row in set (0.01 sec)
    ```

    It can be seen that even though the database and table in account *a1* have the same name, the two databases and tables do not interfere with each other and are completely isolated.
