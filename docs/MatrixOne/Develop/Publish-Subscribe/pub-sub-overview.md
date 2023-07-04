# Publish-subscribe

Publish-Subscribe (Pub/Sub for short) of a database is a messaging model in which **Publisher** sends messages to one or more **Subscribers**, and **Subscribers** The message is received and processed. In this mode, publishers and subscribers are loosely coupled, and no direct communication is required between them, thus improving the scalability and flexibility of the application.

In databases, the publish-subscribe function is usually used in scenarios such as real-time data updates, cache synchronization, and business event notification. For example, when the data of a particular table in the database changes, the subscribers can be notified in real-time through the publish and subscribe function, to realize real-time data synchronization and processing. In addition, the notification of business events can also be recognized through the publish and subscribe function, such as an order being canceled, a certain inventory quantity is insufficient, and so on.

There can be a many-to-many relationship between publishers and subscribers; one publisher can publish messages to multiple subscribers, and one subscriber can also subscribe to various messages/data. Usually, the publish-subscribe function of the database consists of two parts: **Publisher** and **Subscriber**. **Publisher** is responsible for publishing messages, while **Subscriber** subscribes to corresponding messages to achieve data synchronization.

## Application scenarios

The publish-subscribe function has many typical application scenarios:

- **Data Synchronization**: When a database needs to be kept in sync with another database, the publish-subscribe feature can send data changes to the subscriber database. For example, when a website needs to transfer data from one geographic location to another, publish-subscribe functionality can ensure data synchronization between the two databases.

- **Business data distribution**: The publish and subscribe function can distribute business data to different systems or processes. For example, when a bank needs to distribute customer account information to multiple business systems, the publish-subscribe function can distribute data to corresponding systems to ensure data consistency between various business processes.

- **Data backup**: The publish-subscribe function can back up data. For example, when one database needs to be backed up to another database, the publish-subscribe part can be used to back up the data to the subscriber database so that the data can be recovered in the event of failure of the primary database.

- **Real-time data processing**: The publish-subscribe function can be used to realize real-time data processing. For example, when a website needs to process data from different users, the publish-subscribe part can be used to transmit data to a processing program for processing, to realize real-time data analysis and decision-making.

## Publication/Subscription Scope Explanation

### Publishable/Subscribable Permissions

- Only ACCOUNTADMIN or MOADMIN role can create publications and subscriptions on the publishing side.
- Subscribers are controlled by ACCOUNTADMIN or MOADMIN roles to access subscription data permissions.

### Publication/Subscription Data Scope

- A single **Publication** is associated with just one database.
- Publications and subscriptions only implement at the database level; direct publication and subscription at the table level are not currently supported.
- On the **Subscription side**, permissions for the **subscribed database** are read-only.
- If the **publishing side** modifies the scope of its sharing, and a tenant no longer within the new scope has already created a subscription database, access to that **subscribed database** is invalidated.
- If the **publishing side** tries to delete a **published database**, the deletion fails if this database has been published.
- If the **publishing side** deletes a **Publication** on the publishing side, the corresponding objects in the subscription database still exist. Still, an error will be reported when the **subscriber** tries to access this object. The **subscriber** needs to delete the **Subscription**.
- If the **publishing side** deletes a **published object**, the corresponding **subscribed object** in the subscription database still exists. However, an error will be occured when the **subscriber** tries to access this object. The **subscriber** needs to delete the **subscribed object**.

### Examples

![](https://github.com/matrixorigin/artwork/blob/main/docs/develop/pub-sub/example-en.png?raw=true)

This chapter will give an example to introduce that there are currently three accounts in the MatrixOne cluster, sys, *acc1*, and *acc2*, and operate on the three accounts according to the order of operations:

1. **Publisher**: sys account creates database *sub1* and table *t1*, and publishes *pub1*:

    ```sql
    create database sub1;
    create table sub1.t1(a int,b int);
    create publication pub1 database sub;
    ```

2. **Subscriber**: both *acc1* and *acc2* create a subscription database *syssub1*, and thus get the shared table *t1*:

    ```sql
    -- The SQL statements for acc1 and acc2 to create the subscription library are the same, so there will not repeat them
    create database syssub1 from sys publication pub1;
    use syssub1;
    show tables;
    mysql> show tables;
    +--------------------+
    | Tables_in_syssub1  |
    +--------------------+
    | t1                 |
    +--------------------+
    2 rows in set (0.02 sec)
    ```

3. **Publisher**: *sys* account creates table *t2*:

    ```sql
    create table sub1.t2(a text);
    ```

4. **Subscribers**: *acc1* and *acc2* get shared tables *t1* and *t2*:

    ```sql
    show tables;
    +--------------------+
    | Tables_in_syssub1  |
    +--------------------+
    | t1                 |
    +--------------------+
    | t2                 |
    +--------------------+
    2 rows in set (0.02 sec)
    ```

5. **Publisher**: *sys* account creates database *sub2* and table *t2*, and publishes *pub2* to accounts *acc1* and *acc3*:

    ```sql
    create database sub2;
    create table sub2.t1(a float);
    create publication pub2 database sub2 account acc1,acc3;
    ```

6. **Subscriber**: both *acc1* and *acc2* create the subscription database *syssub2*, and *acc1* gets the shared data table *t1*; *acc2* fails to create the subscription database *syssub2*:

    - *acc1*

    ```sql
    create database syssub2 from sys publication pub2;
    use syssub2;
    mysql> show tables;
    +--------------------+
    | Tables_in_syssub2  |
    +--------------------+
    | t1                 |
    +--------------------+
    2 rows in set (0.02 sec)
    ```

    - *acc2*

    ```sql
    create database syssub2 from sys publication pub2;
    > ERROR 20101 (HY000): internal error: the account acc3 is not allowed to subscribe the publication pub2
    ```

7. **Publisher**: The *sys* account modifies and publishes *pub2* to all accounts:

    ```sql
    alter publication pub2 account all;
    ```

8. **Subscriber**: *acc2* successfully created the subscription database *syssub2*, and got the shared data table *t1*:

    ```sql
    create database syssub2 from sys publication pub2;
    use syssub2;
    mysql> show tables;
    +--------------------+
    | Tables_in_syssub2  |
    +--------------------+
    | t1                 |
    +--------------------+
    2 rows in set (0.02 sec)
    ```

9. **Publisher**: *sys* account deletes publication *pub1*:

    ```sql
    drop publication pub1;
    ```

10. **Subscriber**: *acc1* failed to connect to *syspub1*:

     ```sql
     use syssub1;
     ERROR 20101 (HY000): internal error: there is no publication pub1
     ```

11. **Subscriber**: *acc2* delete *syspub1*:

     ```sql
     drop database syssub1;
     ```

12. **Publisher**: *sys* account recreates *pub1*:

     ```sql
     create publication pub1 database sub;
     ```

13. **Subscriber**: *acc1* connects to *syspub1* successfully:

     ```sql
     create database syssub1 from sys publication pub1;
     use syssub1;
     mysql> show tables;
     +--------------------+
     | Tables_in_syssub1  |
     +--------------------+
     | t1                 |
     +--------------------+
     2 rows in set (0.02 sec)
     ```

## Reference

### Publisher Reference

- [CREATE PUBLICATION](../../Reference/SQL-Reference/Data-Definition-Language/create-publication.md)
- [ALTER PUBLICATION](../../Reference/SQL-Reference/Data-Definition-Language/alter-publication.md)
- [DROP PUBLICATION](../../Reference/SQL-Reference/Data-Definition-Language/drop-publication.md)
- [SHOW PUBLICATIONS](../../Reference/SQL-Reference/Other/SHOW-Statements/show-publications.md)
- [SHOW CREATE PUBLICATION](../../Reference/SQL-Reference/Other/SHOW-Statements/show-create-publication.md)

### Subscriber Reference

- [CREATE...FROM...PUBLICATION...](../../Reference/SQL-Reference/Data-Definition-Language/create-subscription.md)
- [SHOW SUBSCRIPTIONS](../../Reference/SQL-Reference/Other/SHOW-Statements/show-subscriptions.md)
