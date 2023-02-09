# **CREATE DATABASE**

## **Description**

Create a database.

## **Syntax**

```
> CREATE DATABASE [IF NOT EXISTS] <database_name> [create_option] ...

> create_option: [DEFAULT] {
	CHARACTER SET [=] charset_name
  | COLLATE [=] collation_name
  | ENCRYPTION [=] {'Y' | 'N'}
}
```

## **Examples**

```sql
CREATE DATABASE IF NOT EXISTS test01;
```

**Expected Result**

You can use [`SHOW DATABASES`](../Other/SHOW-Statements/show-databases.md) to check if the databases have been created.

```sql
mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| mo_task            |
| information_schema |
| mysql              |
| system_metrics     |
| system             |
| test01             |
| mo_catalog         |
+--------------------+
10 rows in set (0.01 sec)
```

You can see that the new database *test01* has been created in addition to the six system databases.

## **Constraints**

- Only `UTF-8` CHARACTER SET is supported for now.
- `CHARACTER SET`, `COLLATE`, `ENCRYPTION` can be used but don't work.
