---
title: "CREATE ACCOUNT"
doc_type: reference
mysql_compat: mo_only
differs_from_mysql: []
mo_only:
  - "CREATE ACCOUNT … ADMIN_NAME …"
since: unknown
last_updated: 2026-05-08
llms_summary: "Create a new account in your organization."
---
# **CREATE ACCOUNT**

> Create a new account in your organization.

## **Description**

Create a new account in your organization.

## **Syntax**

```
> CREATE ACCOUNT  [IF NOT EXISTS]
account auth_option
[COMMENT 'comment_string']

auth_option: {
    ADMIN_NAME [=] 'admin_name'
    IDENTIFIED BY 'auth_string'
}

```

### Explanations

#### auth_option

Specifies the default account name and authorization mode of the account, `auth_string` specifies the password explicitly.

## **Examples**

```sql
> create account tenant_test admin_name = 'root' identified by '111' comment 'tenant_test';
Query OK, 0 rows affected (0.08 sec)
```
