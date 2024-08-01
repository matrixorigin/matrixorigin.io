# Publish Subscription

A database's Publish-Subscribe (Pub/Sub) is a messaging model in which a **publisher** sends a message to one or more **subscribers**, who in turn receive and process the message. The **subscriber** sends the message to one or more subscribers. In this model, publishers and subscribers are loosely coupled and do not need to communicate directly with each other, thus increasing application scalability and flexibility.

In databases, publish subscriptions are often used in scenarios such as real-time data updates, cache synchronization, and business event notifications. For example, when data changes for a table in a database, subscribers can be notified in real time through the publish subscription feature, enabling real-time data synchronization and processing. In addition, notification of business events, such as an order being cancelled, an inventory being insufficient, etc., can be achieved by publishing a subscription function.

Typically, a database's publish subscription function consists of two parts: **the publisher** and the **subscriber**. The **publisher** is responsible for publishing the message, while the **subscriber** subscribes to the corresponding message for data synchronization purposes. There can be a many-to-many relationship between the publisher and the subscriber, i.e. one publisher can post messages to multiple subscribers and one subscriber can subscribe to multiple messages/data.

## Application scenarios

The publish subscription feature has several typical application scenarios:

- **Data synchronization**: When one database needs to be synchronized with another, the publish subscription feature can be used to send data changes to the subscriber database. For example, when a website needs to transfer data from one geographic location to another, the publish subscription feature can be used to ensure data synchronization between two databases.

- **Business data distribution**: The publish subscription feature can be used to distribute business data to different systems or business processes. For example, when a bank needs to distribute customer account information to multiple business systems, the publish subscription feature can be used to distribute data to the appropriate systems, ensuring data consistency across business processes.

- **Data backup**: The publish subscription feature can be used to back up data. For example, when one database needs to be backed up to another, the publish subscription feature can be used to back up data to the subscriber database to restore data in the event of a primary database failure.

- **Real-time data processing**: The publish subscription feature can be used to enable real-time data processing. For example, when a website needs to process data from different users, the publish subscription feature can be used to transfer the data to a handler for processing in order to enable real-time data analysis and decision-making.

## Noun interpretation

- **Publishing**: In a database, publishing usually refers to setting a database object to a state accessible to other tenants. This is an important step in data sharing and replication, where published objects can be subscribed to and acquired by other tenants.

- **Subscription**: A subscription is when a database chooses to receive and copy data from published database objects.

- **Publisher (Pub**): A publisher is a database that performs publishing operations. The publishing side is responsible for creating and managing published objects, as well as managing access to databases that subscribe to that published object.

- **Subscriber (Sub)**: A subscriber is a tenant who subscribes to a publishing object.

- **Publish object**: A publish object is a database object created on the publish side and set to publishable, i.e., a database. The data for these objects can be accessed and copied by the subscriber.

- **Subscription objects**: Subscription objects are publishing objects that are copied and stored on the subscription side. The subscription object's data is updated based on the publisher's data.

## Publish Subscription Scope Description

### Publish/Subscribe to Scope of Application

- **Publisher (Pub)**and**Sub (Sub)** are both tenants of MatrixOne.

### Publishable/Subscribeable Permission Range

- **Publisher (Pub)**Only the ACCOUNTADMIN or MOADMIN role can create publications and subscriptions.
- **Subscriber (Sub)**Access to subscription data is manipulated by the ACCOUNTADMIN or MOADMIN role.

### Publish/Subscribe Data Range

- A **publish** can only be associated with a single database.
- Publishing and subscribing is only implemented at the database level; direct table-level publishing and subscribing is not currently supported.
- The **Subscription side** only has read access to the **Subscription library**.
- If **Publisher** adjusts the sharing scope of a publish, those **Subscribers** that are not in the new scope will have invalid access to this **Subscription library** if they have already created a subscription library.
- If the **Publisher** modifies the posting, then the **Subscriber** will see the update without additional action.
- If **Pub** tries to delete a published database, the deletion will not succeed.
- If **Publisher** deletes **Publish** but the corresponding object in the subscription database still exists, accessing this object by **Subscriber (Sub)** will trigger an error and the corresponding **Subscription** will need to be deleted by **Subscriber (Sub)**.
- If the **Publishing side (Pub)** deletes the **Publishing object**, but the corresponding object in the subscription library still exists, then the **Subscribing side (Sub)** accessing this object triggers an error and requires the **Subscribing side (Sub)** to delete the corresponding **Subscription object**.

### Publish Subscription Example

This chapter will give an example of how three tenants, sys, acc1, and acc2, currently exist in a MatrixOne cluster, operating on the three tenants in order of operation:

![](https://github.com/matrixorigin/artwork/blob/main/docs/develop/pub-sub/data-share.png?raw=true)

1. **Publisher**: sys tenant creates database sub1 with table t1 and publishes pub1:

    ```sql
    create database sub1;
    create table sub1.t1(a int,b int);
    create publication pub1 database sub1;
    mysql> show publications;
    +-------------+----------+---------------------+-------------+-------------+----------+
    | publication | database | create_time         | update_time | sub_account | comments |
    +-------------+----------+---------------------+-------------+-------------+----------+
    | pub1        | sub1     | 2024-04-23 10:28:15 | NULL        | *           |          |
    +-------------+----------+---------------------+-------------+-------------+----------+
    1 row in set (0.01 sec)
    ```

2. **Subscribers**: acc1 and acc2 both create the subscription library syssub1, resulting in the shared data table t1:

    ```sql
    -- The all option allows you to see all the subscriptions that you have permission to subscribe to, and the unsubscribed sub_time and sub_name are null, so if you don't add all, you can only see the information that you have already subscribed to.
    mysql> show subscriptions all;
    +----------+-------------+--------------+---------------------+----------+----------+
    | pub_name | pub_account | pub_database | pub_time            | sub_name | sub_time |
    +----------+-------------+--------------+---------------------+----------+----------+
    | pub1     | sys         | sub1         | 2024-04-23 10:28:15 | NULL     | NULL     |
    +----------+-------------+--------------+---------------------+----------+----------+
    1 row in set (0.01 sec)

    -- The sql statements for creating a subscription library are the same for both acc1 and acc2, so I won't repeat them here.
    create database syssub1 from sys publication pub1;
    use syssub1;

    mysql> show subscriptions;
    +----------+-------------+--------------+---------------------+----------+---------------------+
    | pub_name | pub_account | pub_database | pub_time            | sub_name | sub_time            |
    +----------+-------------+--------------+---------------------+----------+---------------------+
    | pub1     | sys         | sub1         | 2024-04-23 10:28:15 | syssub1  | 2024-04-23 10:35:13 |
    +----------+-------------+--------------+---------------------+----------+---------------------+
    1 row in set (0.00 sec)

    mysql> show tables;
    +--------------------+
    | Tables_in_syssub1  |
    +--------------------+
    | t1                 |
    +--------------------+
    2 rows in set (0.02 sec)
    ```

3. **Publisher**: sys tenant create data table t2:

    ```sql
    create table sub1.t2(a text);
    ```

4. **Subscribers**: acc1 and acc2 get shared data tables t1 and t2:

    ```sql
    use syssub1;
    mysql> show tables;
    +-------------------+
    | Tables_in_syssub1 |
    +-------------------+
    | t1                |
    | t2                |
    +-------------------+
    2 rows in set (0.01 sec)
    ```

5. **Publisher**: sys tenant creates database sub2 with table t1 and publishes pub2 to tenant acc1

    ```sql
    create database sub2;
    create table sub2.t1(a float);
    create publication pub2 database sub2 account acc1;
    ```

6. **Subscribers**:acc1 and acc2 both create subscription library syssub2,acc1 gets shared data table t1;acc2 fails to create subscription library syssub2:

    - acc1

    ```sql
    mysql> show subscriptions all;
    +----------+-------------+--------------+---------------------+----------+---------------------+
    | pub_name | pub_account | pub_database | pub_time            | sub_name | sub_time            |
    +----------+-------------+--------------+---------------------+----------+---------------------+
    | pub1     | sys         | sub1         | 2024-04-23 10:28:15 | syssub1  | 2024-04-23 10:30:43 |
    | pub2     | sys         | sub2         | 2024-04-23 10:40:54 | NULL     | NULL                |
    +----------+-------------+--------------+---------------------+----------+---------------------+
    2 rows in set (0.01 sec)

    create database syssub2 from sys publication pub2;
    use syssub2;

    mysql> show subscriptions all;
    +----------+-------------+--------------+---------------------+----------+---------------------+
    | pub_name | pub_account | pub_database | pub_time            | sub_name | sub_time            |
    +----------+-------------+--------------+---------------------+----------+---------------------+
    | pub2     | sys         | sub2         | 2024-04-23 10:40:54 | syssub2  | 2024-04-23 10:42:31 |
    | pub1     | sys         | sub1         | 2024-04-23 10:28:15 | syssub1  | 2024-04-23 10:30:43 |
    +----------+-------------+--------------+---------------------+----------+---------------------+
    2 rows in set (0.01 sec)

    mysql> show tables;
    +--------------------+
    | Tables_in_syssub2  |
    +--------------------+
    | t1                 |
    +--------------------+
    2 rows in set (0.02 sec)
    ```

    - acc2

    ```sql
    -- acc2 看不到 pub2,因为没有订阅权限
    mysql> show subscriptions all;
    +----------+-------------+--------------+---------------------+----------+---------------------+
    | pub_name | pub_account | pub_database | pub_time            | sub_name | sub_time            |
    +----------+-------------+--------------+---------------------+----------+---------------------+
    | pub1     | sys         | sub1         | 2024-04-23 10:28:15 | syssub1  | 2024-04-23 10:35:13 |
    +----------+-------------+--------------+---------------------+----------+---------------------+
    1 row in set (0.01 sec)

    mysql> create database syssub2 from sys publication pub2;
    ERROR 20101 (HY000): internal error: the account acc2 is not allowed to subscribe the publication pub2
    ```

7. **Publisher**: sys tenant modifies publishing pub2 to all tenants:

    ```sql
    alter publication pub2 account all;
    mysql> show publications;
    +-------------+----------+---------------------+---------------------+-------------+----------+
    | publication | database | create_time         | update_time         | sub_account | comments |
    +-------------+----------+---------------------+---------------------+-------------+----------+
    | pub2        | sub2     | 2024-04-23 10:40:54 | 2024-04-23 10:47:53 | *           |          |
    | pub1        | sub1     | 2024-04-23 10:28:15 | NULL                | *           |          |
    +-------------+----------+---------------------+---------------------+-------------+----------+
    2 rows in set (0.00 sec)
    ```

8. **Subscriber**:acc2 Created subscription library syssub2 successfully with shared data table t1:

    ```sql
    -- acc2 can now see pub2.
    mysql> show subscriptions all;
    +----------+-------------+--------------+---------------------+----------+---------------------+
    | pub_name | pub_account | pub_database | pub_time            | sub_name | sub_time            |
    +----------+-------------+--------------+---------------------+----------+---------------------+
    | pub1     | sys         | sub1         | 2024-04-23 10:28:15 | syssub1  | 2024-04-23 10:35:13 |
    | pub2     | sys         | sub2         | 2024-04-23 10:40:54 | NULL     | NULL                |
    +----------+-------------+--------------+---------------------+----------+---------------------+
    2 rows in set (0.00 sec)

    create database syssub2 from sys publication pub2;
    use syssub2;

    mysql> show subscriptions all;
    +----------+-------------+--------------+---------------------+----------+---------------------+
    | pub_name | pub_account | pub_database | pub_time            | sub_name | sub_time            |
    +----------+-------------+--------------+---------------------+----------+---------------------+
    | pub2     | sys         | sub2         | 2024-04-23 10:40:54 | syssub2  | 2024-04-23 10:50:43 |
    | pub1     | sys         | sub1         | 2024-04-23 10:28:15 | syssub1  | 2024-04-23 10:35:13 |
    +----------+-------------+--------------+---------------------+----------+---------------------+
    2 rows in set (0.00 sec)

    mysql> show tables;
    +--------------------+
    | Tables_in_syssub2  |
    +--------------------+
    | t1                 |
    +--------------------+
    2 rows in set (0.02 sec)
    ```

9. **Publisher**:sys tenant delete publish pub1:

    ```sql
    drop publication pub1;
    mysql> show publications;
    +-------------+----------+---------------------+---------------------+-------------+----------+
    | publication | database | create_time         | update_time         | sub_account | comments |
    +-------------+----------+---------------------+---------------------+-------------+----------+
    | pub2        | sub2     | 2024-04-23 10:40:54 | 2024-04-23 10:47:53 | *           |          |
    +-------------+----------+---------------------+---------------------+-------------+----------+
    1 row in set (0.00 sec)
    ```

10. **Subscribers**:acc1,acc2 Connection to syspub1 failed:

    ```sql
    mysql> use syssub1;
    ERROR 20101 (HY000): internal error: there is no publication pub1
    ```

11. **Publisher**: sys tenant creates new database sub1\_new and republishes it as pub1

    ```sql
    create database sub1_new;
    use sub1_new;
    create table t3(n1 int);
    insert into t3 values (1);
    create publication pub1 database sub1_new;
    mysql> show publications;
    +-------------+----------+---------------------+---------------------+-------------+----------+
    | publication | database | create_time         | update_time         | sub_account | comments |
    +-------------+----------+---------------------+---------------------+-------------+----------+
    | pub2        | sub2     | 2024-04-23 10:40:54 | 2024-04-23 10:47:53 | *           |          |
    | pub1        | sub1_new | 2024-04-23 10:59:11 | NULL                | *           |          |
    +-------------+----------+---------------------+---------------------+-------------+----------+
    2 rows in set (0.00 sec)
    ```

12. **Subscribers**: acc1, acc2 Connect to syspub1 and see what's new in pub1, meaning if the publisher changes what's published, the subscriber doesn't have to do anything to see the update.
  
    ```sql
    use syssub1;
    mysql> show subscriptions;
    +----------+-------------+--------------+---------------------+----------+---------------------+
    | pub_name | pub_account | pub_database | pub_time            | sub_name | sub_time            |
    +----------+-------------+--------------+---------------------+----------+---------------------+
    | pub2     | sys         | sub2         | 2024-04-23 10:40:54 | syssub2  | 2024-04-23 10:42:31 |
    | pub1     | sys         | sub1_new     | 2024-04-23 10:59:11 | syssub1  | 2024-04-23 10:30:43 |
    +----------+-------------+--------------+---------------------+----------+---------------------+
    2 rows in set (0.01 sec)

    mysql> show tables;
    +-------------------+
    | Tables_in_syssub1 |
    +-------------------+
    | t3                |
    +-------------------+
    1 row in set (0.01 sec)

    mysql> select * from t3;
    +------+
    | n1   |
    +------+
    |    1 |
    +------+
    1 row in set (0.01 sec)
    ```

13. **Subscriber**:acc1 Delete subscription:

    ```sql
     -- Remove a subscription by drop database
     drop database syssub1;
     mysql> show subscriptions;
    +----------+-------------+--------------+---------------------+----------+---------------------+
    | pub_name | pub_account | pub_database | pub_time            | sub_name | sub_time            |
    +----------+-------------+--------------+---------------------+----------+---------------------+
    | pub2     | sys         | sub2         | 2024-04-23 10:40:54 | syssub2  | 2024-04-23 10:42:31 |
    +----------+-------------+--------------+---------------------+----------+---------------------+
    1 row in set (0.00 sec)
    ```

14. **Publisher**: Before a sys tenant deletes a published database, delete its corresponding publication:

    ```sql
    mysql> drop database sub1_new;
    ERROR 20101 (HY000): internal error: can not drop database 'sub1_new' which is publishing
    mysql> drop publication pub1;
    Query OK, 0 rows affected (0.00 sec)

    mysql> drop database sub1_new;
    Query OK, 1 row affected (0.03 sec)
    ```

15. **Publisher**: sys tenant modifies publication:

     ```sql
     alter publication pub2 comment "this is pub2";--alter comments
     mysql> show publications;
     create database new_sub2;
     create table new_sub2.new_t (xxx int);
     insert into new_sub2.new_t values (123);
     alter publication pub2 database new_sub2;--alter database
     mysql> show publications;
     +-------------+----------+---------------------+---------------------+-------------+--------------+
     | publication | database | create_time         | update_time         | sub_account | comments     |
     +-------------+----------+---------------------+---------------------+-------------+--------------+
     | pub2        | new_sub2 | 2024-04-23 10:40:54 | 2024-04-23 11:04:20 | *           | this is pub2 |
     +-------------+----------+---------------------+---------------------+-------------+--------------+
     1 row in set (0.00 sec)
     ```

16. **Subscribers**: acc1, acc2 View the subscription to see the modified content of the publishing database:

    ```sql
     mysql> show subscriptions;
    +----------+-------------+--------------+---------------------+----------+---------------------+
    | pub_name | pub_account | pub_database | pub_time            | sub_name | sub_time            |
    +----------+-------------+--------------+---------------------+----------+---------------------+
    | pub2     | sys         | new_sub2     | 2024-04-23 10:40:54 | syssub2  | 2024-04-23 10:42:31 |
    +----------+-------------+--------------+---------------------+----------+---------------------+
    1 row in set (0.00 sec)
    
    use syssub2;
    mysql> show tables;
    +-------------------+
    | Tables_in_syssub2 |
    +-------------------+
    | new_t             |
    +-------------------+
    1 row in set (0.00 sec)

    mysql> select * from new_t;
    +------+
    | xxx  |
    +------+
    |  123 |
    +------+
    1 row in set (0.00 sec)
    ```

## Reference Documents

### Publisher Reference Documentation

- [CREATE PUBLICATION](../../Reference/SQL-Reference/Data-Definition-Language/create-publication.md)
- [ALTER PUBLICATION](../../Reference/SQL-Reference/Data-Definition-Language/alter-publication.md)
- [DROP PUBLICATION](../../Reference/SQL-Reference/Data-Definition-Language/drop-publication.md)
- [SHOW PUBLICATIONS](../../Reference/SQL-Reference/Other/SHOW-Statements/show-publications.md)
- [SHOW CREATE PUBLICATION](../../Reference/SQL-Reference/Other/SHOW-Statements/show-create-publication.md)

### Subscriber Reference Documents

- [CREATE...FROM...PUBLICATION...](../../Reference/SQL-Reference/Data-Definition-Language/create-subscription.md)
- [SHOW SUBSCRIPTIONS](../../Reference/SQL-Reference/Other/SHOW-Statements/show-subscriptions.md)
