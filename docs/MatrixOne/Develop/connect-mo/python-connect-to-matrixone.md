# Connecting to MatrixOne with Python

MatrixOne supports Python connection, `pymysql` and `sqlalchemy` drivers are supported. This tutorial will walk you through how to connect MatrixOne by these two python drivers.

## Before you start

1. Make sure you have already [installed and launched MatrixOne](../../Get-Started/install-standalone-matrixone.md).
2. Make sure you have already installed [Python 3.8(or plus) version](https://www.python.org/downloads/).  

```
#To check with Python installation and its version
python3 -V
```

3. Make sure you have already installed MySQL.

## Using Python pymysql connect to MatrixOne

The PyMySQL is a pure-Python MySQL client library.

1. Download and install pymysql and cryptography tool:

    ```
    pip3 install pymysql
    pip3 install cryptography

    #If you are in China mainland and have a low downloading speed, you can speed up the download by following commands.
    pip3 install pymysql -i https://pypi.tuna.tsinghua.edu.cn/simple
    pip3 install cryptography -i https://pypi.tuna.tsinghua.edu.cn/simple
    ```

2. Connect to MatrixOne by MySQL client. Create a new database named *test*.

    ```sql
    mysql> create database test;
    ```

3. Create a plain text file `pymysql_connect_matrixone.py` and put the code below.

    ```python
    #!/usr/bin/python3

    import pymysql

    # Open database connection
    db = pymysql.connect(
            host='127.0.0.1',
	        port=6001,
            user='root',
            password = "111",
            db='test',
            )
    # prepare a cursor object using cursor() method
    cursor = db.cursor()

    # execute SQL query using execute() method.
    cursor.execute("SELECT VERSION()")

    # Fetch a single row using fetchone() method.
    data = cursor.fetchone()
    print ("Database version : %s " % data)

    # disconnect from server
    db.close()

    ```

4. Execute this python file in the command line terminal.

    ```
    > python3 pymysql_connect_matrixone.py
    Database version : 8.0.30-MatrixOne-v2.1.0
    ```

## Using sqlalchemy connect to MatrixOne

SQLAlchemy is the Python SQL toolkit and Object Relational Mapper(ORM) that gives application developers the full power and flexibility of SQL.

1. Download and install sqlalchemy tool:

    ```
    pip3 install sqlalchemy

    #If you are in China mainland and have a low downloading speed, you can speed up the download by following commands.
    pip3 install sqlalchemy -i https://pypi.tuna.tsinghua.edu.cn/simple
    ```

2. Connect to MatrixOne by MySQL client. Create a new database named *test*, a new table named *student* and insert two records.

    ```sql
    mysql> create database test;
    mysql> use test;
    mysql> create table student (name varchar(20), age int);
    mysql> insert into student values ("tom", 11), ("alice", "10");

    ```

3. Create a plain text file `sqlalchemy_connect_matrixone.py` and put the code below,

    ```python
    #!/usr/bin/python3
    from sqlalchemy import create_engine, text

    # Open database connection
    my_conn = create_engine("mysql+mysqldb://root:111@127.0.0.1:6001/test")

    # execute SQL query using execute() method.
    query=text("SELECT * FROM student LIMIT 0,10")
    my_data=my_conn.execute(query)

    # print SQL result
    for row in my_data:
            print("name:", row["name"])
            print("age:", row["age"])

    ```

4. Execute this python file in the command line terminal.

    ```
    python3 sqlalchemy_connect_matrixone.py
    name: tom
    age: 11
    name: alice
    age: 10
    ```

## Reference

For the example about using Python to build a simple CRUD with MatrixOne, see [Build a simple Python+SQLAlchemy CRUD demo with MatrixOne](../../Tutorial/sqlalchemy-python-crud-demo.md) and [Build a simple Python CRUD demo with MatrixOne](../../Tutorial/develop-python-crud-demo.md)
