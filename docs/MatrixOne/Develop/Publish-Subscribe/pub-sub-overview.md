# Publish and subscribe

Database publish-subscribe (Publish-Subscribe, referred to as Pub/Sub) is a messaging model in which the publisher sends messages to one or more subscribers, and the subscribers The message is received and processed. In this mode, publishers and subscribers are loosely coupled and do not require direct communication between them, thus improving the scalability and flexibility of the application.

In databases, publish and subscribe functions are usually used in real-time data updates, cache synchronization, business event notifications and other scenarios. For example, when data in a certain table in the database changes, subscribers can be notified in real time through the publish and subscribe function, thereby achieving real-time data synchronization and processing. In addition, the publish and subscribe function can also be used to implement notification of business events, such as an order being canceled, a certain inventory quantity being insufficient, etc.

Usually, the publish and subscribe function of the database consists of two parts: **Publisher**and **Subscriber**. **Publisher**is responsible for publishing messages, while **Subscribers**subscribe to corresponding messages to achieve data synchronization. There can be a many-to-many relationship between publishers and subscribers, that is, a publisher can publish messages to multiple subscribers, and a subscriber can also subscribe to multiple messages/data.

## Application scenarios

The publish and subscribe function has a variety of typical application scenarios:

- **Data Synchronization**: When one database needs to be synchronized with another database, the publish-subscribe function can be used to send data changes to the subscriber database. For example, when a website needs to transfer data from one geographical location to another, the publish-subscribe feature can be used to ensure data synchronization between the two databases.

- **Business Data Distribution**: The publish and subscribe function can be used to distribute business data to different systems or business processes. For example, when a bank needs to distribute customer account information to multiple business systems, the publish and subscribe function can be used to distribute data to the corresponding systems to ensure data consistency between various business processes.

- **Data Backup**: The publish and subscribe function can be used to back up data. For example, when one database needs to be backed up to another database, the publish-subscribe feature can be used to back up the data to the subscriber database so that the data can be restored in the event of a failure of the primary database.

- **Real-time data processing**: The publish and subscribe function can be used to implement real-time data processing. For example, when a website needs to process data from different users, the publish and subscribe function can be used to transfer the data to the handler for processing in order to achieve real-time data analysis and decision-making.

## Glossary

- **Publish**: In databases, publishing usually refers to setting a database object to a state that can be accessed by other tenants. This is an important step in data sharing and replication. The published objects can be subscribed by other tenants and obtain the data.

- **Subscription**: A subscription is when a database chooses to receive and replicate data from published database objects.

- **Publisher (Pub)**: The publisher is the database that performs publishing operations. The publisher is responsible for creating and managing published objects, as well as managing access rights to databases that subscribe to the published objects.

- **Subscriber (Sub)**: The subscriber is the tenant that subscribes to the published object.

- **Publish object**: The publication object is a database object created and set as publishable on the publishing side, that is, the database. The data of these objects can be accessed and copied by subscribers.

- **Subscription Object**: The subscription object is the publication object copied and stored on the subscription side. The data of the subscription object will be updated according to the data of the publishing side.

## Publish subscription scope description

### Publish/subscribe application scope

**Publisher (Pub)**and **Subscriber (Sub)**are both tenants of MatrixOne.

### Publishable/subscribeable permission scope

- **Publisher (Pub)**Only ACCOUNTADMIN or MOADMIN roles can create publications and subscriptions.
- **Subscriber (Sub)**has access to subscription data permissions operated by ACCOUNTADMIN or MOADMIN roles.

### Publish/subscribe data range

- A **Publication**can only be associated with a single database.
- Supports database-level and table-level publishing and subscription.
- **Subscriber**only has read permissions on **Subscription Library**.
- If **Publisher (Pub)**adjusts the publishing sharing scope, those **Subscribers (Sub)**that are not within the new scope will have a subscription library created, then the **Subscription library**Access will be invalid.
- If **Publisher (Pub)**modifies the published content, then **Subscriber (Sub)**can see the update without additional operations.
- If **publisher (Pub)**tries to delete an already published database, the deletion will not be successful.
- If **Publisher (Pub)**deletes **Publish**, but the corresponding object in the subscription library still exists, then **Subscriber (Sub)**will trigger an error when accessing this object, which needs to be **Subscriber (Sub)**deletes the corresponding **Subscription**.
- If **publisher (Pub)**deletes **publish object**, but the corresponding object in the subscription library still exists, then **subscriber (Sub)**will trigger an error when accessing this object, which requires The corresponding **subscription object**is deleted by **Subscriber**.

## Publish and subscribe example

Suppose there is a cross-regional retail company. The central warehouse database needs to publish inventory and product price changes, and each branch database subscribes to these changes to ensure that inventory and price information are synchronized in each branch system.

```sql
drop account if exists acc1;
create account acc1 admin_name = 'test_account' identified by '111';
drop account if exists acc2;
create account acc2 admin_name = 'test_account' identified by '111';
```

1. Create a central warehouse database and initialize data
  
    Create a central warehouse database under the `sys` tenant, containing inventory tables and product price lists, and insert some test data to verify the functionality.

    ```sql
    -- Create a central warehouse database
    create database central_warehouse_db;
    use central_warehouse_db;

    -- Create inventory table
    CREATE TABLE inventory (
        product_id INT PRIMARY KEY,
        product_name VARCHAR(100),
        stock_quantity INT
    );

    -- Create a product price list
    CREATE TABLE products (
        product_id INT PRIMARY KEY,
        product_name VARCHAR(100),
        price DECIMAL(10, 2)
    );

    -- Insert initial data into inventory table
    INSERT INTO inventory (product_id, product_name, stock_quantity) VALUES 
    (1, 'Laptop', 100),
    (2, 'Smartphone', 200),
    (3, 'Tablet', 150);

    -- Insert initial data into product price list
    INSERT INTO products (product_id, product_name, price) VALUES 
    (1, 'Laptop', 999.99),
    (2, 'Smartphone', 599.99),
    (3, 'Tablet', 399.99);
    ```

2. Configure release

    Create a database-level publication in the central warehouse database to publish data updates of all tables to tenant `acc1`. If a branch only cares about changes in product prices, it can create a table-level publication to publish only updates to the product price list to tenant `acc2`.

    ```sql
    create publication db_warehouse_pub database central_warehouse_db account acc1;
    create publication tab_products_pub database central_warehouse_db table products account acc2;
    ```

3. Subscribe to publications individually in branch tenants

    ```sql
    -- Subscribe to db_warehouse_pub in acc1
    create database db_warehouse_sub from sys publication db_warehouse_pub;

    mysql> show subscriptions;
    +------------------+-------------+----------------------+------------+-------------+---------------------+------------------+---------------------+--------+
    | pub_name         | pub_account | pub_database         | pub_tables | pub_comment | pub_time            | sub_name         | sub_time            | status |
    +------------------+-------------+----------------------+------------+-------------+---------------------+------------------+---------------------+--------+
    | db_warehouse_pub | sys         | central_warehouse_db | *          |             | 2024-10-15 11:58:04 | db_warehouse_sub | 2024-10-15 11:59:47 |      0 |
    +------------------+-------------+----------------------+------------+-------------+---------------------+------------------+---------------------+--------+
    1 row in set (0.01 sec)

    use db_warehouse_sub;

    mysql> show tables;
    +----------------------------+
    | Tables_in_db_warehouse_sub |
    +----------------------------+
    | inventory                  |
    | products                   |
    +----------------------------+
    2 rows in set (0.01 sec)

    mysql> select * from inventory;
    +------------+--------------+----------------+
    | product_id | product_name | stock_quantity |
    +------------+--------------+----------------+
    |          1 | Laptop       |            100 |
    |          2 | Smartphone   |            200 |
    |          3 | Tablet       |            150 |
    +------------+--------------+----------------+
    3 rows in set (0.01 sec)

    mysql> select * from products;
    +------------+--------------+--------+
    | product_id | product_name | price  |
    +------------+--------------+--------+
    |          1 | Laptop       | 999.99 |
    |          2 | Smartphone   | 599.99 |
    |          3 | Tablet       | 399.99 |
    +------------+--------------+--------+
    3 rows in set (0.01 sec)

    -- Subscribe to tab_products_pub in acc2
    create database tab_products_sub from sys publication tab_products_pub;

    mysql> show subscriptions;
    +------------------+-------------+----------------------+------------+-------------+---------------------+------------------+---------------------+--------+
    | pub_name         | pub_account | pub_database         | pub_tables | pub_comment | pub_time            | sub_name         | sub_time            | status |
    +------------------+-------------+----------------------+------------+-------------+---------------------+------------------+---------------------+--------+
    | tab_products_pub | sys         | central_warehouse_db | products   |             | 2024-10-15 11:58:04 | tab_products_sub | 2024-10-15 13:59:22 |      0 |
    +------------------+-------------+----------------------+------------+-------------+---------------------+------------------+---------------------+--------+
    1 row in set (0.01 sec)

    use tab_products_sub;

    mysql> show tables;
    +----------------------------+
    | Tables_in_tab_products_sub |
    +----------------------------+
    | products                   |
    +----------------------------+
    1 row in set (0.01 sec)

    mysql> select * from products;
    +------------+--------------+--------+
    | product_id | product_name | price  |
    +------------+--------------+--------+
    |          1 | Laptop       | 999.99 |
    |          2 | Smartphone   | 599.99 |
    |          3 | Tablet       | 399.99 |
    +------------+--------------+--------+
    3 rows in set (0.01 sec)
    ```

4. Data changes

    On the publishing side of data, the publishing and subscription mechanism will synchronize these changes to the subscribing side.

    ```sql
    -- Modify the inventory quantity in the inventory table
    UPDATE inventory SET stock_quantity = 80 WHERE product_id = 1;

    -- Delete a row in the product price list
    DELETE FROM products WHERE product_id = 2;

    mysql> select * from inventory;
    +------------+--------------+----------------+
    | product_id | product_name | stock_quantity |
    +------------+--------------+----------------+
    |          1 | Laptop       |             80 |
    |          2 | Smartphone   |            200 |
    |          3 | Tablet       |            150 |
    +------------+--------------+----------------+
    3 rows in set (0.00 sec)

    mysql> select * from products;
    +------------+--------------+--------+
    | product_id | product_name | price  |
    +------------+--------------+--------+
    |          1 | Laptop       | 999.99 |
    |          3 | Tablet       | 399.99 |
    +------------+--------------+--------+
    2 rows in set (0.01 sec)
    ```

5. View changes on the subscription side

    ```sql
    -- Check stock availability in acc1
    mysql> select * from inventory ;
    +------------+--------------+----------------+
    | product_id | product_name | stock_quantity |
    +------------+--------------+----------------+
    |          1 | Laptop       |             80 |
    |          2 | Smartphone   |            200 |
    |          3 | Tablet       |            150 |
    +------------+--------------+----------------+
    3 rows in set (0.01 sec)

    -- Check product prices in acc2

    mysql> select * from products;
    +------------+--------------+--------+
    | product_id | product_name | price  |
    +------------+--------------+--------+
    |          1 | Laptop       | 999.99 |
    |          3 | Tablet       | 399.99 |
    +------------+--------------+--------+
    2 rows in set (0.01 sec)
    ```

6. Delete publication

    In some cases, when a warehouse is out of use, or data publishing no longer requires synchronization of a certain table, you can use DROP PUBLICATION to release the publishing relationship to prevent unnecessary resource consumption.

    ```sql
    -- Delete product price list publication
    drop publication tab_products_sub;
    ```

## Reference documentation

### Publisher reference documentation

- [CREATE PUBLICATION](../../Reference/SQL-Reference/Data-Definition-Language/create-publication.md)
- [ALTER PUBLICATION](../../Reference/SQL-Reference/Data-Definition-Language/alter-publication.md)
- [DROP PUBLICATION](../../Reference/SQL-Reference/Data-Definition-Language/drop-publication.md)
- [SHOW PUBLICATIONS](../../Reference/SQL-Reference/Other/SHOW-Statements/show-publications.md)
- [SHOW CREATE PUBLICATION](../../Reference/SQL-Reference/Other/SHOW-Statements/show-create-publication.md)

### Subscriber Reference Documentation

- [CREATE...FROM...PUBLICATION...](../../Reference/SQL-Reference/Data-Definition-Language/create-subscription.md)
- [SHOW SUBSCRIPTIONS](../../Reference/SQL-Reference/Other/SHOW-Statements/show-subscriptions.md)
