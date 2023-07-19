# Privilege Control Types

The privilege control of a MatrixOne is classified into **System Permission** and **Object Permission**. You can refer to the permissions granted to roles.

## System Permission

System permissions are the permissions of the initial system account. The system account is the cluster system administrator *root*, also called the cluster administrator. The system root can create and delete other accounts, and manage accounts. A system root cannot manage other resources of other accounts.

|Permissions|Description|
|---|---|
|CREATE ACCOUNT|Create an account. It belongs only to the SYS account.|
|DROP ACCOUNT|Delete an account. It belongs only to the SYS account.|
|ALTER ACCOUNT|Manage accounts. It belongs only to the SYS account.|

## Object Permission

Object permission can be classified into **Account Permission**, **User Permission**, **Role Permission**, **Database Permission**, and **Table Permission**.

### Account Permission

Objects with *Account Permission* can have the following permissions:

|Permissions|Description|
|---|---|
|CREATE USER|Create a user|
|DROP USER|Delete a user|
|ALTER USER|Modify users|
|CREATE ROLE|Create a role|
|DROP ROLE|Delete a role|
|CREATE DATABASE|Create a database|
|DROP DATABASE|Delete a database|
|SHOW DATABASES| View all databases in the current account|
|CONNECT|Use `use [database | role]`, execute `SELECT`  which does not involve concrete object|
|MANAGE GRANTS|Permission management. You can authorize roles and inherit permission from roles|
|ALL [PRIVILEGES]|All permissions of the Account|
|OWNERSHIP|All permissions of the Account. The account can be set using `WITH GRANT OPTION`|
|SHOW GRANT	|View the permission list of a role or user under the current account|

### User Permission

Objects with *User Permission* can have the following permissions:

|Permissions|Description|
|---|---|
|Ownership|You can manage all user permission, including modifying user information, passwords, and deleting users, and transfer these permissions to other roles.|

### Role Permission

Objects with *Role Permission* can have the following permissions:

|Permissions|Description|
|---|---|
|Ownership|You can manage all rights of a role, including modifying the name, description, and deletion of a role, and transfer these rights to other roles.|

### Database Permission

Objects with *Database Permission* can have the following permissions:

|Permissions|Description|
|---|---|
|SHOW TABLES|View all tables in the current database|
|CREATE TABLE|Create a table|
|DROP TABLE|Delete a table|
|CREATE VIEW|Create a view,A view created without the corresponding table permission cannot be queried|
|DROP VIEW|Delete a view|
|ALTER TABLE|Modify a table|
|ALTER VIEW|Modify a view. A view created without the corresponding table permission cannot be queried.|
|ALL [PRIVILEGES]|All permission of database|
|OWNERSHIP|All permission of database.  The database can be set using `WITH GRANT OPTION`|

### Table Permission

Objects with *Table Permission* can have the following permissions:

|Permissions|Description|
|---|---|
|SELECT|Execute the `SELECT` statement|
|INSERT|Execute the `INSERT` statement|
|UPDATE|Execute the `UPDATE` statement|
|TRUNCATE|Execute the `TRUNCATE TABLE` statement|
|DELETE|Execute the `DELETE` statement|
|REFERENCE|Allows a table to be referenced as a unique/primary key table for external constraints. View the structure of the table with the `DESCRIBE` or `SHOW` command|
|INDEX|Create or drop INDEX|
|ALL|Specifies all permissions for the table|
|OWNERSHIP|Specifies all permissions for the table, append `WITH GRANT OPTION`|

### Table Routine Level Permission

Objects with *Table Routine Level Permission* can have the following permissions:

|Permissions|Description|
|---|---|
|EXECUTE|Permission to execute a function or stored procedure|

### Publish and subscribe permission

In MatrixOne, publish-subscribe is data-sharing access to the specified database.

__Note:__ Currently, only *moadmin* and *accountadmin* roles are supported in MatrixOne to perform publish and subscribe operations.

- **publisher**

The publisher is the party that publishes the data that needs to be shared and synchronized.

|Permissions|Description|
|---|---|
|CREATE PUBLICATION|Create Publication|
|ALTER PUBLICATION|Modify Publication|
|DROP PUBLICATION|Delete a publication|
|SHOW PUBLICATION|View Publication|
|SHOW CREATE PUBLICATION|View create publication statement|

- **Subscriber**

The subscriber is the party that obtains the shared and synchronized data.

|Permissions|Description|
|---|---|
|CREATE DATABASE db_name FROM account_name PUBLICATION|CREATE SUBSCRIPTION|
|SHOW SUBSCRIPTIONS|View Subscriptions|
