# Python CRUD demo

## Before you start

### Setup your environment

Before you start, make sure you have downloaded and installed the following software.

1. Make sure you have already [installed and launched MatrixOne](../Get-Started/install-standalone-matrixone.md).
2. Make sure you have already installed [Python 3.8(or plus) version](https://www.python.org/downloads/).  

    ```
    #To check with Python installation and its version
    python3 -V
    ```

3. Make sure you have already installed MySQL.
4. Download and install pymysql and cryptography tool.

    ```
    pip3 install pymysql
    pip3 install cryptography

    #If you are in China mainland and have a low downloading speed, you can speed up the download by following commands.
    pip3 install pymysql -i https://pypi.tuna.tsinghua.edu.cn/simple
    pip3 install cryptography -i https://pypi.tuna.tsinghua.edu.cn/simple
    ```

As we have explained how to connect to MatrixOne by pymysql in the other [tutorial](../Develop/connect-mo/python-connect-to-matrixone.md), we will focus on the CRUD(Create, Read, Update, Delete) implementations in this tutorial.

## Create Table

Firstly we create a text file named `create.py`, and put the following code:

```
#!/usr/bin/python3

import pymysql.cursors

SQL_CONNECTION = pymysql.connect(
        host='127.0.0.1',
	port=6001,
        user='root',
        password = "111",
        db='test',
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True
        )

SQL = "CREATE TABLE cars (id INT NOT NULL AUTO_INCREMENT, car_model VARCHAR(45) NULL,car_brand VARCHAR(45) NULL,PRIMARY KEY (`id`))"

with SQL_CONNECTION.cursor() as cursor:
    try:
        sql_exec = cursor.execute(SQL)
        print("Table created")
    except (pymysql.Error, pymysql.Warning) as e:
        print(f'error! {e}')

    finally:
        SQL_CONNECTION.close()

```

Execute this python file by a terminal with the command line below. This will create a table `cars` in MatrixOne inside database `test`.

```
> python3 create.py
Table created
```

We can verify the table creation with MySQL client.

```
mysql> show tables;
+----------------+
| tables_in_test |
+----------------+
| cars           |
+----------------+
1 row in set (0.03 sec)
mysql> show create table cars;
+-------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                                             |
+-------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
| cars  | CREATE TABLE `cars` (
`id` INT NOT NULL AUTO_INCREMENT,
`car_model` VARCHAR(45) DEFAULT NULL,
`car_brand` VARCHAR(45) DEFAULT NULL,
PRIMARY KEY (`id`)
) |
+-------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.03 sec)
```

## Insert

Secondly we create a text file named `insert.py`, and put the following code:

```
#!/usr/bin/python3

import pymysql.cursors

SQL_CONNECTION = pymysql.connect(
        host='127.0.0.1',
	    port=6001,
        user='root',
        password = "111",
        db='test',
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True
        )

SQL = "INSERT INTO cars(car_model, car_brand) VALUES ('accord', 'honda')"

with SQL_CONNECTION.cursor() as cursor:
    try:
        sql_exec = cursor.execute(SQL)
        if sql_exec:
            print(sql_exec)
            print("Record Added")
        else:
            print(sql_exec)
            print("Not Added")
    except (pymysql.Error, pymysql.Warning) as e:
        print(f'error! {e}')

    finally:
        SQL_CONNECTION.close()
```

Executing the following code will insert a record in the `cars` table, then we verify in mysql client to check if the record is inserted.

```
> python3 insert.py
1
Record Added
```

```
mysql> select * from cars;
+------+-----------+-----------+
| id   | car_model | car_brand |
+------+-----------+-----------+
|    1 | accord    | honda     |
+------+-----------+-----------+
1 row in set (0.03 sec)
```

## Select

Thirdly we create a text file named `read.py`, and put the following code:

```
#!/usr/bin/python3

import pymysql.cursors

SQL_CONNECTION = pymysql.connect(
        host='127.0.0.1',
	    port=6001,
        user='root',
        password = "111",
        db='test',
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True
        )

SQL = "SELECT * FROM cars"

with SQL_CONNECTION.cursor() as cursor:
    try:
        sql_exec = cursor.execute(SQL)
        if sql_exec:
            print(sql_exec)
            print(cursor.fetchall())
        else:
            print(sql_exec)
            print("No Record")
    except (pymysql.Error, pymysql.Warning) as e:
        print(f'error! {e}')

    finally:
        SQL_CONNECTION.close()
```

Executing this code will select and return all records in the `cars` table.

```
> python3 read.py
1
[{'id': 1, 'car_model': 'accord', 'car_brand': 'honda'}]
```

## Update

Fourthly we create a text file named `update.py`, and put the following code:

```
#!/usr/bin/python3

import pymysql.cursors

SQL_CONNECTION = pymysql.connect(
        host='127.0.0.1',
	    port=6001,
        user='root',
        password = "111",
        db='test',
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True
        )

SQL = "UPDATE cars SET car_model = 'explorer', car_brand = 'ford' WHERE id = '1'"

with SQL_CONNECTION.cursor() as cursor:
    try:
        sql_exec = cursor.execute(SQL)
        if sql_exec:
            print(sql_exec)
            print("Record Updated")
        else:
            print(sql_exec)
            print("Not Updated")
    except (pymysql.Error, pymysql.Warning) as e:
        print(f'error! {e}')

    finally:
        SQL_CONNECTION.close()

```

Executing this code will update the record with id `1`, then we verify in mysql client to check if the record is updated.

```
> python3 update.py
1
Record Updated
```

```
mysql> select * from cars;
+------+-----------+-----------+
| id   | car_model | car_brand |
+------+-----------+-----------+
|    1 | explorer  | ford      |
+------+-----------+-----------+
1 row in set (0.02 sec)
```

## Delete

Finally we create a text file named `delete.py`, and put the following code:

```
#!/usr/bin/python3

import pymysql.cursors

SQL_CONNECTION = pymysql.connect(
        host='127.0.0.1',
	    port=6001,
        user='root',
        password = "111",
        db='test',
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True
        )

SQL = "DELETE FROM cars WHERE id = '1'"

with SQL_CONNECTION.cursor() as cursor:
    try:
        sql_exec = cursor.execute(SQL)
        if sql_exec:
            print(sql_exec)
            print("Record Deleted")
        else:
            print(sql_exec)
            print("Not Deleted")
    except (pymysql.Error, pymysql.Warning) as e:
        print(f'error! {e}')

    finally:
        SQL_CONNECTION.close()
```

Executing this code will delete the record with id `1`, then we verify in mysql client to check if the record is updated.

```
> python3 delete.py
1
Record Deleted
```

```
mysql> select * from cars;
Empty set (0.03 sec)
```
