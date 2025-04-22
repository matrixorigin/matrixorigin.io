# **CREATE PUBLICATION**

## **Syntax description**

`CREATE PUBLICATION` adds a new publication to the current database.

## **Grammar structure**

```
CREATE PUBLICATION <pubname>
    DATABASE <database_name>[<table_name>] ACCOUNT
    [ { ALL
    | account_name, [, ... ] }]
    [COMMENT 'string']
```

## Grammar explanation

- pubname: Publish name. The publication name must be different from the name of any existing publication in the current database.
- database_name: The name of a database that already exists under the current tenant.
- account_name: The tenant name of the publication can be obtained.

## **Example**

```sql
create account acc01 admin_name 'root' identified by '111';
create account acc02 admin_name 'root' identified by '111';
create database db1;
use db1;
create table t1(n1 int);
create table t2(n1 int);

--Database level publishing
create publication db_pub1 database db1 account acc01,acc02;

--Table level publishing
create publication tab_pub1 database db1 table t1,t2 account acc01,acc02;
```

## limit

-Database-level publishing currently only supports publishing one database data at a time.