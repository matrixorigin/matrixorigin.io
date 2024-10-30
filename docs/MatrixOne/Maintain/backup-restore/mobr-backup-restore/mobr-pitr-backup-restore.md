# mo_br tool for PITR backup and recovery

## PITR backup and recovery implementation principle

The implementation of PITR (point-in-time recovery) backup and recovery is based on full backup and incremental logs. By recording the transaction operations of the database and applying these incremental logs, the system can restore the database to a specified point in time. The recovery process starts with a full backup, restoring the database to its base state, and then sequentially applies transactions from the incremental log until the target point in time is reached, allowing for precise data recovery. This mechanism effectively copes with data loss caused by misoperation or failure and ensures the integrity and consistency of the database.

## Application scenarios

PITR is a common function in database management. It is mainly used to restore the database to a specific point in time. It is usually used in the following scenarios:

- **Misoperation recovery:**When some data in the database is accidentally deleted, accidentally modified, or accidentally operated, you can use PITR to restore the database to the state before the accidental operation to avoid data loss.

- **Disaster recovery:**After encountering a catastrophic failure of the database (such as hardware failure, software error, natural disaster, etc.), PITR can help restore the database to a point in time before the failure, ensuring business continuity and data Integrity.
- **Data Audit and Compliance:**For businesses and organizations that need to conduct data audits or need to comply with data retention policies, PITR can provide historical data recovery and viewing capabilities to meet compliance requirements.

- **Testing and development environment management:**During the development and testing process, PITR can help restore the database to the previous test data set to support repeated running of test cases and management of the development environment.

- **Database Backup Management:**Used in conjunction with regular backups, PITR can provide more fine-grained recovery options, making the recovery process more flexible and precise.

## MatrixOne support for PITR

MatrixOne supports the following two methods for PITR:

- sql statement
- mo_br tool

This document mainly introduces how to use `mo_br` to perform PITR.

!!! note
    mo_br enterprise-level service backup and recovery tool, you need to contact your MatrixOne account manager to obtain the tool download path.

## Preparation before starting

- Completed [Standalone Deployment MatrixOne](../../../Get-Started/install-standalone-matrixone.md)

- Completed mo_br tool deployment

## Example

A large SaaS provider manages a multi-tenant environment that provides various services to different business customers. These tenants host their databases through clusters, storing business-critical data. One day, when the system administrator was performing an upgrade operation, he accidentally triggered some erroneous script operations, which affected multiple databases and tables in different tenants. In order to ensure that the system can be restored as quickly as possible and reduce data loss, the team decided to PITR for recovery.

### Create business data

There are two tenants acc1 and acc2 under this system, which represent different customers. Each tenant has product information and order information.
  
```sql
create account acc1 admin_name 'root' identified by '111';
create account acc2 admin_name 'root' identified by '111';

#Connect acc1
create database db1;
use db1;
--Create a product table to store product information
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
product_name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT NOT NULL
);

INSERT INTO products (product_name, category, price, stock_quantity) VALUES
('Gaming Laptop', 'Electronics', 1200.99, 30),
('Wireless Mouse', 'Accessories', 25.50, 100),
('Mechanical Keyboard', 'Accessories', 75.00, 50),
('Smartphone', 'Electronics', 699.99, 50),
('Headphones', 'Accessories', 199.99, 80),
('Tablet', 'Electronics', 299.99, 40),
('Smartwatch', 'Accessories', 149.99, 60),
('Charger', 'Accessories', 19.99, 200),
('Webcam', 'Electronics', 59.99, 75);

create database db2;
use db2;
--Create a table to store customer orders
CREATE TABLE orders (
    id int PRIMARY KEY auto_increment,
    product_name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO orders (product_name, quantity) VALUES
('Laptop', 2),
('Mouse', 5),
('Keyboard', 3);

#Connect acc2
create database db1;
use db1;
--Create a product table to store product information
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT NOT NULL
);

INSERT INTO products (product_name, category, price, stock_quantity) VALUES
('Gaming Laptop', 'Electronics', 1200.99, 30),
('Wireless Mouse', 'Accessories', 25.50, 100),
('Mechanical Keyboard', 'Accessories', 75.00, 50),
('Smartphone', 'Electronics', 699.99, 50),
('Headphones', 'Accessories', 199.99, 80),
('Tablet', 'Electronics', 299.99, 40),
('Smartwatch', 'Accessories', 149.99, 60),
('Charger', 'Accessories', 19.99, 200),
('Webcam', 'Electronics', 59.99, 75);

create database db2;
use db2;
--Create a table to store customer orders
CREATE TABLE orders (
    id int PRIMARY KEY auto_increment,
    product_name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO orders (product_name, quantity) VALUES
('Smartphone', 10),
('Headphones', 15),
('Tablet', 7);
```

### Create pitr

```bash
#Create a cluster-level pitr
./mo_br pitr create --host "127.0.0.1" --port 6001 --user "root" --password "111" --pname "pitr1" --level "cluster" --rangevalue 1 --rangeunit "d "

>./mo_br pitr show --host "127.0.0.1" --port 6001 --user "dump" --password "111"
PITR NAME CREATED TIME MODIFIED TIME PITR LEVEL ACCOUNT NAME DATABASE NAME TABLE NAME PITR LENGTH PITR UNIT
pitr1 2024-10-28 17:22:26 2024-10-28 17:22:26 cluster ***1 d

#Create acc1 tenant level pitr
./mo_br pitr create --host "127.0.0.1" --port 6001 --user "acc1#root" --password "111" --pname "pitr2" --level "account" --account "acc1" --rangevalue 10 --rangeunit "h"

>./mo_br pitr show --host "127.0.0.1" --port 6001 --user "acc1#root" --password "111" --account "acc1"
PITR NAME CREATED TIME MODIFIED TIME PITR LEVEL ACCOUNT NAME DATABASE NAME TABLE NAME PITR LENGTH PITR UNIT
pitr2 2024-10-28 17:24:18 2024-10-28 17:24:18 account acc1 **10 h

#Create acc2 tenant level pitr
./mo_br pitr create --host "127.0.0.1" --port 6001 --user "acc2#root" --password "111" --pname "pitr3" --level "account" --account "acc2" --rangevalue 10 --rangeunit "h"


>./mo_br pitr show --host "127.0.0.1" --port 6001 --user "acc2#root" --password "111" --account "acc2"
PITR NAME CREATED TIME MODIFIED TIME PITR LEVEL ACCOUNT NAME DATABASE NAME TABLE NAME PITR LENGTH PITR UNIT
pitr3 2024-10-28 17:25:32 2024-10-28 17:25:32 account acc2 **10 h
```

### Simulate upgrade error

Due to an upgrade script error, both db1 and db2 under acc1 were deleted, db1 under acc2 was deleted, and the orders table data under db2 was cleared.

```sql
--Execute under acc1
drop database db1;
drop database db2;

--Execute under acc2
drop database db1;
use db2;
truncate table orders;
```

### Restore pitr

- Full tenant recovery for acc1

    ```bash
    ./mo_br pitr restore --host "127.0.0.1" --port 6001 --user "acc1#root" --password "111" --pname "pitr2" --timestamp "2024-10-28 17:30: 00" --account "acc1"
    ```

    Connect acc1 query, you can see that the data is successfully restored

    ```sql
    mysql> show databases;
    +--------------------+
    | Database           |
    +--------------------+
    | db1                |
    | db2                |
    | information_schema |
    | mo_catalog         |
    | mysql              |
    | system             |
    | system_metrics     |
    +--------------------+
    7 rows in set (0.01 sec)
    ```

- Database table level recovery for acc2

    ```bash
    #restoredb1
    ./mo_br pitr restore --host "127.0.0.1" --port 6001 --user "acc2#root" --password "111" --pname "pitr3" --timestamp "2024-10-28 17:30: 00" --account "acc2" --database "db1"

    #Restore orders table
    ./mo_br pitr restore --host "127.0.0.1" --port 6001 --user "acc2#root" --password "111" --pname "pitr3" --timestamp "2024-10-28 17:30: 00" --account "acc2" --database "db2" --table "orders"
    ```

    Connect acc2 query and you can see that the data is successfully restored

    ```sql
    mysql> show databases;
    +--------------------+
    | Database           |
    +--------------------+
    | db1                |
    | db2                |
    | information_schema |
    | mo_catalog         |
    | mysql              |
    | system             |
    | system_metrics     |
    +--------------------+
    7 rows in set (0.01 sec)

    mysql> select * from db2.orders;
    +------+--------------+----------+---------------------+
    | id   | product_name | quantity | order_date          |
    +------+--------------+----------+---------------------+
    |    1 | Smartphone   |       10 | 2024-10-28 17:11:27 |
    |    2 | Headphones   |       15 | 2024-10-28 17:11:27 |
    |    3 | Tablet       |        7 | 2024-10-28 17:11:27 |
    +------+--------------+----------+---------------------+
    3 rows in set (0.00 sec)
    ```