# SHOW RULES ON ROLE

## Description

`SHOW RULES ON ROLE role_name` lists every SQL rewrite rule
registered for the given role in `mo_catalog.mo_role_rule`. Each row
pairs the scope key (`rule_name`, which is `db.tbl`) with the raw
rule body. This documents the `rewrite_rule` feature; rules are
created and removed with
[`ALTER ROLE ... ADD/DROP RULE`](alter-role-rule.md).

## Syntax

```
SHOW RULES ON ROLE role_name ;
```

## Arguments

| Parameter | Description |
|-----------|-------------|
| `role_name` | Role to inspect. The role must exist; otherwise the server returns `internal error: there is no role <role_name>`. |

### Output columns

| Column | Description |
|--------|-------------|
| `rule_name` | The `db.tbl` scope key the rule applies to. |
| `rule` | The rule body as supplied to `ALTER ROLE ... ADD RULE`. |

## Usage Notes

- Returns an empty result set (with the `rule_name` / `rule` header)
  when the role exists but has no rules registered.
- Does not require the `enable_remap_hint` session variable. `SHOW
  RULES ON ROLE` always queries `mo_catalog.mo_role_rule` and does
  not perform rewriting itself.
- Fails with `internal error: there is no role <role_name>` if the
  role does not exist.

## Examples

### Example 1: One rule per role

```sql
CREATE ROLE test_rule_role;

ALTER ROLE test_rule_role
    ADD RULE "select * from db1.t1 where age > 28"
    ON TABLE db1.t1;

SHOW RULES ON ROLE test_rule_role;
+-----------+-------------------------------------+
| rule_name | rule                                |
+-----------+-------------------------------------+
| db1.t1    | select * from db1.t1 where age > 28 |
+-----------+-------------------------------------+
```

### Example 2: Multiple rules for the same role

```sql
ALTER ROLE test_rule_role
    ADD RULE "select id from db2.t2_new"
    ON TABLE db2.t2;

SHOW RULES ON ROLE test_rule_role;
+-----------+-------------------------------------+
| rule_name | rule                                |
+-----------+-------------------------------------+
| db1.t1    | select * from db1.t1 where age > 50 |
| db2.t2    | select id from db2.t2_new           |
+-----------+-------------------------------------+
```

### Example 3: Empty result set

After dropping all rules for a role, `SHOW RULES ON ROLE` returns
just the header row.

```sql
ALTER ROLE test_rule_role DROP RULE ON TABLE db2.t2;

SHOW RULES ON ROLE test_rule_role;
+-----------+------+
| rule_name | rule |
+-----------+------+
```

### Example 4: Non-existent role

```sql
SHOW RULES ON ROLE non_existent_role;
-- ERROR: internal error: there is no role non_existent_role
```

## Notes

1. `SHOW RULES ON ROLE` is purely a read path — it does not modify
   the catalog or invalidate any cache.
2. See also: [ALTER ROLE ... ADD/DROP RULE](alter-role-rule.md).
