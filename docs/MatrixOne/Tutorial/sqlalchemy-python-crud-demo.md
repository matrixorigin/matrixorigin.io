# SQLAlchemy CRUD demo

This tutorial shows you how to build a simple Python+SQLAlchemy CRUD(Create, Read, Update, Delete) application with MatrixOne. SQLAlchemy is one of the most popular ORM tools in python language.

## Before you start

A brief introduction about these softwares concerned:

* SQLAlchemy: SQLAlchemy is a python library that facilitates the communication between Python programs and databases. Most of the times, this library is used as an Object Relational Mapper (ORM) tool that translates Python classes to tables on relational databases and automatically converts function calls to SQL statements.
* Faker: Faker is a Python library that generates fake data. Fake data is often used for testing or filling databases with some dummy data.

### Setup your environment

Before you start, make sure you have downloaded and installed the following software.

1. Make sure you have already [installed and launched MatrixOne](../Get-Started/install-standalone-matrixone.md). Connect to MatrixOne and create a database by MySQL client.

    ```
    mysql> create database test;
    ```

2. Make sure you have already installed [Python 3.8(or plus) version](https://www.python.org/downloads/).  

    ```
    #To check with Python installation and its version
    python3 -V
    ```

3. Make sure you have already installed MySQL.
4. Download and install sqlalchemy, pymysql, cryptography and faker tool.

    ```
    pip3 install sqlalchemy
    pip3 install pymysql
    pip3 install cryptography
    pip3 install faker

    #If you are in China mainland and have a low downloading speed, you can speed up the download by following commands.
    pip3 install sqlalchemy -i https://pypi.tuna.tsinghua.edu.cn/simple
    pip3 install pymysql -i https://pypi.tuna.tsinghua.edu.cn/simple
    pip3 install cryptography -i https://pypi.tuna.tsinghua.edu.cn/simple
    pip3 install faker -i https://pypi.tuna.tsinghua.edu.cn/simple
    ```

As we have explained how to connect to MatrixOne by SQLAlchemy in the other [tutorial](../Develop/connect-mo/python-connect-to-matrixone.md), we will focus on the CRUD(Create, Read, Update, Delete) implementations in this tutorial.

## Create

As an Object Relational Mapper(ORM) tool, SQLAlchemy allows developers to create python class to map the table in relational database. In the example below, we will create a `User` class which is a representation of `User` table in MatrixOne, the code which defines `User` is equal to a SQL statement as:

```
CREATE TABLE `User` (
`id` INT NOT NULL AUTO_INCREMENT,
`cname` VARCHAR(64) DEFAULT NULL,
`caddress` VARCHAR(512) DEFAULT NULL,
PRIMARY KEY (`id`)
)
```

Let's now create this example in a text file named `sqlalchemy_create.py`, and put the following code:

```
from faker import Factory
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

faker = Factory.create()

engine = create_engine('mysql+pymysql://root:111@127.0.0.1:6001/test')

Session = sessionmaker(bind=engine)
session = Session()

Base = declarative_base()


class Customer(Base):
    __tablename__ = "Customer"
    id = Column(Integer, primary_key=True,autoincrement=True)
    cname = Column(String(64))
    caddress = Column(String(512))

    def __init__(self,name,address):
        self.cname = name
        self.caddress = address

    def __str__(self):
        return "cname:"+self.cname +" caddress:"+self.caddress

    def __repr__(self):
        return "cname:"+self.cname +" caddress:"+self.caddress


# Generate 10 Customer records
Customers = [Customer(name= faker.name(),address = faker.address()) for i in range(10)]

# Create the table
Base.metadata.create_all(engine)

# Insert all customer records to Customer table
session.add_all(Customers)

session.commit()

```

Execute this file in a terminal with such command:

```
> python3 sqlalchemy_create.py
```

Then we verify the table creation in MySQL client:

```
mysql> show tables;
+----------------+
| tables_in_test |
+----------------+
| Customer       |
+----------------+
1 row in set (0.04 sec)
mysql> select * from `Customer`;
+------+------------------+-----------------------------------------------------+
| id   | cname            | caddress                                            |
+------+------------------+-----------------------------------------------------+
|    1 | Wendy Luna       | 002 Brian Plaza
Andrewhaven, SC 88456               |
|    2 | Meagan Rodriguez | USCGC Olson
FPO AP 21249                            |
|    3 | Angela Ramos     | 029 Todd Curve Apt. 352
Mooreville, FM 15950        |
|    4 | Lisa Bruce       | 68103 Mackenzie Mountain
North Andrew, UT 29853     |
|    5 | Julie Moore      | Unit 1117 Box 1029
DPO AP 87468                     |
|    6 | David Massey     | 207 Wayne Groves Apt. 733
Vanessashire, NE 34549    |
|    7 | David Mccann     | 97274 Sanders Tunnel Apt. 480
Anthonyberg, DC 06558 |
|    8 | Morgan Price     | 57463 Lisa Drive
Thompsonshire, NM 88077            |
|    9 | Samuel Griffin   | 186 Patel Crossing
North Stefaniechester, WV 08221  |
|   10 | Tristan Pierce   | 593 Blankenship Rapids
New Jameshaven, SD 89585     |
+------+------------------+-----------------------------------------------------+
10 rows in set (0.03 sec)
```

## Read

In the following example, we read data from the `Customer` table by two ways.

The first one is a full scan, which equals to a query as:

```
select * from `Customer`
```

The second one is a point query, which equals to a query as:

```
select * from `Customer` where `cname` = 'David Mccann';
```

We create this example in a text file named `sqlalchemy_read.py`, and put the following code:

```
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

engine = create_engine('mysql+pymysql://root:111@127.0.0.1:6001/test')

Session = sessionmaker(bind=engine)
session = Session()

Base = declarative_base()

class Customer(Base):
    __tablename__ = "Customer"
    id = Column(Integer, primary_key=True,autoincrement=True)
    cname = Column(String(64))
    caddress = Column(String(512))

    def __init__(self,name,address):
        self.cname = name
        self.caddress = address

    def __str__(self):
        return "cname:"+self.cname +" caddress:"+self.caddress

    def __repr__(self):
        return "cname:"+self.cname +" caddress:"+self.caddress


# query all data
customers = session.query(Customer).all()

for customer in customers:
     print(customer.__str__() +"\n--------------------------\n")

# query with a filter condition
Mccann = session.query(Customer).filter_by(cname='David Mccann').first()
print(Mccann)
print("\n------------------------\n")

```

Execute this file in a terminal with such command and we will see the query result:

```
> python3 sqlalchemy_read.py
cname:Wendy Luna caddress:002 Brian Plaza
Andrewhaven, SC 88456
--------------------------

cname:Meagan Rodriguez caddress:USCGC Olson
FPO AP 21249
--------------------------

cname:Angela Ramos caddress:029 Todd Curve Apt. 352
Mooreville, FM 15950
--------------------------

cname:Lisa Bruce caddress:68103 Mackenzie Mountain
North Andrew, UT 29853
--------------------------

cname:Julie Moore caddress:Unit 1117 Box 1029
DPO AP 87468
--------------------------

cname:David Massey caddress:207 Wayne Groves Apt. 733
Vanessashire, NE 34549
--------------------------

cname:David Mccann caddress:97274 Sanders Tunnel Apt. 480
Anthonyberg, DC 06558
--------------------------

cname:Morgan Price caddress:57463 Lisa Drive
Thompsonshire, NM 88077
--------------------------

cname:Samuel Griffin caddress:186 Patel Crossing
North Stefaniechester, WV 08221
--------------------------

cname:Tristan Pierce caddress:593 Blankenship Rapids
New Jameshaven, SD 89585
--------------------------

cname:David Mccann caddress:97274 Sanders Tunnel Apt. 480
Anthonyberg, DC 06558

------------------------
```

## Update

In the following example, we update the first `cname` column of `Customer` table by another value.
We create this example in a text file named `sqlalchemy_update.py`, and put the following code:

```
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

engine = create_engine('mysql+pymysql://root:111@127.0.0.1:6001/test')

Session = sessionmaker(bind=engine)
session = Session()

Base = declarative_base()

class Customer(Base):
    __tablename__ = "Customer"
    id = Column(Integer, primary_key=True,autoincrement=True)
    cname = Column(String(64))
    caddress = Column(String(512))

    def __init__(self,name,address):
        self.cname = name
        self.caddress = address

    def __str__(self):
        return "cname:"+self.cname +" caddress:"+self.caddress

    def __repr__(self):
        return "cname:"+self.cname +" caddress:"+self.caddress


customer = session.query(Customer).first()
print(customer)
print("\n---------------------\n")

# Rename customer
customer.cname = "Coby White"


session.commit()

# See the updated result
customer = session.query(Customer).first()
print(customer)
```

Execute this file in a terminal with such command and we will see the query result:

```
> python3 sqlalchemy_update.py     
cname:Wendy Luna caddress:002 Brian Plaza
Andrewhaven, SC 88456

---------------------

cname:Coby White caddress:002 Brian Plaza
Andrewhaven, SC 88456
```

Then we verify the record being updated in MySQL client:

```
mysql> select * from `Customer`;
+------+------------------+-----------------------------------------------------+
| id   | cname            | caddress                                            |
+------+------------------+-----------------------------------------------------+
|    1 | Coby White       | 002 Brian Plaza
Andrewhaven, SC 88456               |
|    2 | Meagan Rodriguez | USCGC Olson
FPO AP 21249                            |
|    3 | Angela Ramos     | 029 Todd Curve Apt. 352
Mooreville, FM 15950        |
|    4 | Lisa Bruce       | 68103 Mackenzie Mountain
North Andrew, UT 29853     |
|    5 | Julie Moore      | Unit 1117 Box 1029
DPO AP 87468                     |
|    6 | David Massey     | 207 Wayne Groves Apt. 733
Vanessashire, NE 34549    |
|    7 | David Mccann     | 97274 Sanders Tunnel Apt. 480
Anthonyberg, DC 06558 |
|    8 | Morgan Price     | 57463 Lisa Drive
Thompsonshire, NM 88077            |
|    9 | Samuel Griffin   | 186 Patel Crossing
North Stefaniechester, WV 08221  |
|   10 | Tristan Pierce   | 593 Blankenship Rapids
New Jameshaven, SD 89585     |
+------+------------------+-----------------------------------------------------+
10 rows in set (0.02 sec)
```

## Delete

In the following example, we delete the first record of the `Customer` table.
We create this example in a text file named `sqlalchemy_detele.py`, and put the following code:

```
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

engine = create_engine('mysql+pymysql://root:111@127.0.0.1:6001/test')

Session = sessionmaker(bind=engine)
session = Session()

Base = declarative_base()

class Customer(Base):
    __tablename__ = "Customer"
    id = Column(Integer, primary_key=True,autoincrement=True)
    cname = Column(String(64))
    caddress = Column(String(512))

    def __init__(self,name,address):
        self.cname = name
        self.caddress = address

    def __str__(self):
        return "cname:"+self.cname +" caddress:"+self.caddress

    def __repr__(self):
        return "cname:"+self.cname +" caddress:"+self.caddress


# delete the first record
customer = session.query(Customer).first()

session.delete(customer)
session.commit()

# query all data
customers = session.query(Customer).all()

for customer in customers:
     print(customer.__str__() +"\n--------------------------\n")
```

Execute this file in a terminal with such command and we will see the query result:

```
> python3 sqlalchemy_delete.py         
cname:Meagan Rodriguez caddress:USCGC Olson
FPO AP 21249
--------------------------

cname:Angela Ramos caddress:029 Todd Curve Apt. 352
Mooreville, FM 15950
--------------------------

cname:Lisa Bruce caddress:68103 Mackenzie Mountain
North Andrew, UT 29853
--------------------------

cname:Julie Moore caddress:Unit 1117 Box 1029
DPO AP 87468
--------------------------

cname:David Massey caddress:207 Wayne Groves Apt. 733
Vanessashire, NE 34549
--------------------------

cname:David Mccann caddress:97274 Sanders Tunnel Apt. 480
Anthonyberg, DC 06558
--------------------------

cname:Morgan Price caddress:57463 Lisa Drive
Thompsonshire, NM 88077
--------------------------

cname:Samuel Griffin caddress:186 Patel Crossing
North Stefaniechester, WV 08221
--------------------------

cname:Tristan Pierce caddress:593 Blankenship Rapids
New Jameshaven, SD 89585
--------------------------
```

Then we verify the record being deleted in MySQL client:

```
mysql> select * from `Customer`;
+------+------------------+-----------------------------------------------------+
| id   | cname            | caddress                                            |
+------+------------------+-----------------------------------------------------+
|    2 | Meagan Rodriguez | USCGC Olson
FPO AP 21249                            |
|    3 | Angela Ramos     | 029 Todd Curve Apt. 352
Mooreville, FM 15950        |
|    4 | Lisa Bruce       | 68103 Mackenzie Mountain
North Andrew, UT 29853     |
|    5 | Julie Moore      | Unit 1117 Box 1029
DPO AP 87468                     |
|    6 | David Massey     | 207 Wayne Groves Apt. 733
Vanessashire, NE 34549    |
|    7 | David Mccann     | 97274 Sanders Tunnel Apt. 480
Anthonyberg, DC 06558 |
|    8 | Morgan Price     | 57463 Lisa Drive
Thompsonshire, NM 88077            |
|    9 | Samuel Griffin   | 186 Patel Crossing
North Stefaniechester, WV 08221  |
|   10 | Tristan Pierce   | 593 Blankenship Rapids
New Jameshaven, SD 89585     |
+------+------------------+-----------------------------------------------------+
9 rows in set (0.04 sec)
```
