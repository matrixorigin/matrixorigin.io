# Privilege Management Scenario

## Scenario overview

- If your company has deployed a MatrixOne cluster after the deployment, a cluster administrator will automatically exist when the cluster is initialized. If you like, contact the project manager or sales representative of MatrixOne to get the account information and initial password. Using the cluster administrator, you can create a new account, manage the life cycle of the account, and assign the account account password to the corresponding person in charge of your company. For more information on how to manage accounts, see [Quick Start: Create accounts, Verify Resource Isolation](../how-tos/quick-start-create-account.md) or [Privilege Management Operation Guide](../how-tos/user-guide.md).

- If your enterprise only needs to use MatrixOne cluster account resources, after the deployment is complete, the MatrixOne cluster administrator will help you open an account administrator account. Please contact the MatrixOne project manager or sales representative for the account information and initial password. Using the account administrator account, you can create new users, manage user lifecycles and resources in the account (users, roles, and permissions), and assign user account passwords to the corresponding persons in charge of your company. For more information on how to manage accounts, see [Quick Start: Create accounts, Verify Resource Isolation](../how-tos/quick-start-create-account.md) or [Privilege Management Operation Guide](../how-tos/user-guide.md).

## Scenario 1: Create a new data administrator and grant the privilege

### Scenario Introduction

In practical application scenarios, it is necessary to set up a data administrator position responsible for managing the allocation of resources in the entire database. For example, other company members need to be assigned a user account, password, and role and be granted minimum Usage rights.

### Before you start

- You first need to have an account of **account Administrator**.

- Already connected to the MatrixOne cluster.

### Solution

Create a data administrator role and grant him global management permissions within the account; then, you need to do the following:

- Create a new user, username: *dbauser*; password: *123456*.
- Assign a data administrator role to this user, and the role is named: *dba*.
- This role requires the following permissions:
    * Own all permissions of the account object: With this permission, the data administrator can create new users and new roles and assign permissions to other users.
    * Own all permissions of database objects: With this permission, the data administrator can create, edit, and delete databases.
    * Own all permissions of the table object: With this permission, the data administrator can create, edit, and delete data tables.

### Steps

#### Step 1: Use the account administrator to create the database administrator

1. Log in to the account with the account administrator account:

    __Note__: The account administrator account *account1* here is an example; you can customize it when creating an account administrator.

    ```
    mysql -h 127.0.0.1 -P 6001 -u account1:admin:admin -p
    ```

2. Create a user and named *dbauser* with a password of *123456*:

    ```
    create user dbauser identified by "123456";
    ```

3. Create a data administrator role named *dba*:

    ```
    create role dba;
    ```

4. Grant the privilege to the role the following permissions:

    - Full permissions on the account object
    - Full permissions on database objects
    - Full permissions on the table object

    ```
    grant all on account * to dba with grant option;
    grant all on database * to dba with grant option;
    grant all on table *.* to dba with grant option;
    ```

5. Grant role *dba* to user *dbauser*:

    ```
    grant dba to dbauser;
    ```

6. Check the privilege using the following command:

    ```
    show grants for dbauser@localhost;
    ```

#### Step 2: Use the data administrator to log and test

1. Log into MatrixOne with the data administrator account *dbauser*:

    ```
    mysql -h 127.0.0.1 -P 6001 -u account1:dbauser:dba -p
    ```

2. Check the privileges of *dbauser*:

    ```
    show grants for dbauser@localhost;
    ```

3. Check the role of *dbauser*:

    ```
    SET SECONDARY ROLE ALL;
    use mo_catalog;
    select mu.user_name,mr.role_name from mo_role mr,mo_user mu,mo_user_grant mug where mu.user_id=mug.user_id and mr.role_id=mug.role_id and mu.user_name='dbauser';
    ```

4. Create a database to verify the privilege is valid:

    ```
    drop database if exists test;
    create database test;
    use test;
    create table t1(a int);
    insert into t1 values(1),(2),(3);
    select * from t1;
    ```

5. The above code indicates that the verification is successful.

## Scenario 2: Application System Goes Online

### Scenario Introduction

When the application system goes online, a new database and corresponding database user will be created according to the usage requirements of the application system, and this user will be granted all permissions of the target database.

### Before you start

- You first need to have an account of account administrator (or you, as a user, already have full privileges to create new users and authorize new user the database objects).

- Already connected to the MatrixOne cluster.

### Solution

- Requirement 1: The application system requires a new database dedicated to application development.
    * Solution: Create a new database named *appdb*.

- Requirement 2: The application system requires a dedicated role.
    * Solution: Create a new database role, named *approle*, and grant all database privileges to this role.

- Requirement 3: The application system requires a dedicated person to manage the database.
    * Solution: Create a new database user, named *appuser*, and authorize the role to this user.

### Steps

#### Step 1: The account administrator creates and authorizes the database user

1. Log in to the account with the account administrator:

    __Note__: The account administrator account *account1* here is an example; you can customize it when creating an account administrator.

    ```
    mysql -h 127.0.0.1 -P 6001 -u account1:admin:admin -p
    ```

2. To create the database required by the application, name the database *appdb* :

    ```
    create database appdb;
    ```

3. Create a role named *approle* and grant this role full privilege to database *appdb* :

    ```
    create role approle;
    grant all on database appdb to approle;
    grant all on table appdb.* to approle;
    ```

4. Create user *appuser* with password *123456* and grant the role *approle* to *appuser* :

    ```
    create user appuser identified by "123456" default role approle;
    ```

#### Step 2: Use the data user to log in and test

1. Log into MatrixOne with the data user *appuser*:

    ```
    mysql -h127.0.0.1 -utest:appuser -P6001 -p123456
    ```

2. Verify the privileges of the data user *appuser*:

    ```
    set secondary role all;
    use appdb;
    create table t1(a int);
    insert into t1 values(1),(2),(3);
    select * from t1;
    drop table t1;
    ```

3. The above code indicates that the verification is successful.
