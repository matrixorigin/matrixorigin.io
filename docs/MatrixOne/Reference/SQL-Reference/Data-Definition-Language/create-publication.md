# **CREATE PUBLICATION**

## **Grammar description**

`CREATE PUBLICATION` Adds a new publication to the current database.

## **Grammar structure**

```
CREATE PUBLICATION pubname
    DATABASE database_name ACCOUNT
    [ { ALL
    | account_name, [, ... ] }]
    [ COMMENT 'string']
```

## Interpretation of grammar

- pubname: The publication name. The publication name must be different from the name of any existing publication in the current database.
- database_name: The name of a database that already exists under the current tenant.
- account_name: Gets the tenant name for this publication.

## **Examples**

```sql
create database t;
create account acc0 admin_name 'root' identified by '111';
create account acc1 admin_name 'root' identified by '111';
mysql> create publication pub1 database t account acc0,acc1;
Query OK, 0 rows affected (0.01 sec)
```

## Limitations

MatrxiOne currently only supports publishing one database data at a time.
