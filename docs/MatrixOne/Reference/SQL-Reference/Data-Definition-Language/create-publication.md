# **CREATE PUBLICATION**

## **Description**

`CREATE PUBLICATION` adds a new publication into the current database.

## **Syntax**

```
CREATE PUBLICATION pubname
    DATABASE database_name ACCOUNT
    [ { ALL
    | account_name, [, ... ] }]
    [ COMMENT 'string']
```

## **Explanations**

- pubname: The publication name. The publication name must be distinct from the name of any existing publication in the current database.
- database_name: specifies the database name that exists under the current account.
- account_name: The account name. The name of the account which obtains the publication.

## **Examples**

```sql
create database t;
create account acc0 admin_name 'root' identified by '111';
create account acc1 admin_name 'root' identified by '111';
mysql> create publication pub1 database t account acc0,acc1;
Query OK, 0 rows affected (0.01 sec)
```

## **Constraints**

MatrxiOne currently only supports publishing one database at a time.
