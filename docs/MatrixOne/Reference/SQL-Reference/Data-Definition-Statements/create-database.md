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
CREATE DATABASE test01;
CREATE DATABASE IF NOT EXISTS test01;
CREATE DATABASE test02 DEFAULT CHARACTER SET utf8 collate utf8_general_ci ENCRYPTION 'Y';
CREATE DATABASE test03 CHARACTER SET=utf8 collate=utf8_general_ci ENCRYPTION='N';
```

**Expected Result**

You can use [`SHOW DATABASES`](../Database-Administration-Statements/SHOW-Statements/show-databases.md) to check if the databases have been created.

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
| test02             |
| test03             |
| mo_catalog         |
+--------------------+
10 rows in set (0.01 sec)
```

You can see that the new database *test01*, *test02* and *test03* have been created in addition to the six system databases.

## **Constraints**

- Only `UTF-8` CHARACTER SET is supported for now.
- `CHARACTER SET`, `COLLATE`, `ENCRYPTION` can be used but don't work.
