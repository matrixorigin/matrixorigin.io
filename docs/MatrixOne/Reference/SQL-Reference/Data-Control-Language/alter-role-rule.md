# ALTER ROLE ... ADD/DROP RULE

## Description

`ALTER ROLE role_name ADD RULE 'sql_text' ON TABLE db.tbl` registers a
per-role SQL rewrite rule in the `mo_catalog.mo_role_rule` catalog
table. `ALTER ROLE role_name DROP RULE ON TABLE db.tbl` removes the
rule previously registered for the given role and `db.tbl`.

Registered rules cooperate with the existing session variable
`enable_remap_hint`: when a session runs with the role that owns a
rule and `enable_remap_hint = 1`, the server prepends a JSON hint
(`/*+ {"rewrites": {...}} */`) to each SQL statement, which is then
consumed by the rewrite pipeline. Turning off `enable_remap_hint` (or
using a role with no rules) disables the injection.

This documents the `rewrite_rule` feature.

## Syntax

```
ALTER ROLE role_name ADD RULE 'sql_text' ON TABLE db_name '.' tbl_name ;

ALTER ROLE role_name DROP RULE ON TABLE db_name '.' tbl_name ;
```

## Arguments

| Parameter | Description |
|-----------|-------------|
| `role_name` | Role that owns the rule. The role must already exist; otherwise the server returns `internal error: there is no role <role_name>`. |
| `'sql_text'` | The rewrite rule body. Passed as a quoted string literal; stored verbatim in `mo_catalog.mo_role_rule.rule`. |
| `db_name.tbl_name` | Target table scope for the rule. The rule key (`rule_name` column) is derived as the concatenation `db_name + "." + tbl_name`. |

## Usage Notes

- **Upsert semantics for ADD RULE.** Re-running
  `ALTER ROLE role_name ADD RULE ... ON TABLE db.tbl` with the same
  `(role, db.tbl)` overwrites the previous rule body rather than
  creating a duplicate row.
- **DROP RULE requires the rule to exist.** If no row exists for
  `(role, db.tbl)` the server returns
  `internal error: rule '<db.tbl>' does not exist for role '<role>'`.
- **DROP RULE requires the role to exist.** Dropping a rule for a
  non-existent role returns
  `internal error: there is no role <role_name>`.
- **Session cache invalidation.** After a successful ADD or DROP the
  current session's in-memory rewrite-rule cache is invalidated;
  other sessions using the same role will pick up the new rule set
  after they refresh their cache (for example by re-executing
  `SET ROLE`).
- **Hint injection is gated by `enable_remap_hint`.** The rules only
  affect query execution when the session variable
  `enable_remap_hint` is truthy (e.g. `1`).

## Examples

The examples below mirror the behavior covered by the
`role_rule.sql` regression test: creating a role and a rule,
overwriting the rule, merging multiple rules, dropping, and the
error cases for non-existent roles/rules.

### Example 1: Add a rule and verify via SHOW RULES

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

### Example 2: ADD RULE is an upsert on (role, db.tbl)

Re-running ADD RULE for the same role and table overwrites the
previous rule body.

```sql
ALTER ROLE test_rule_role
    ADD RULE "select * from db1.t1 where age > 50"
    ON TABLE db1.t1;

SHOW RULES ON ROLE test_rule_role;
+-----------+-------------------------------------+
| rule_name | rule                                |
+-----------+-------------------------------------+
| db1.t1    | select * from db1.t1 where age > 50 |
+-----------+-------------------------------------+
```

### Example 3: Multiple rules for the same role

Different `(db.tbl)` keys coexist.

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

### Example 4: DROP RULE

```sql
ALTER ROLE test_rule_role DROP RULE ON TABLE db1.t1;

SHOW RULES ON ROLE test_rule_role;
+-----------+---------------------------+
| rule_name | rule                      |
+-----------+---------------------------+
| db2.t2    | select id from db2.t2_new |
+-----------+---------------------------+
```

### Example 5: Error cases

Non-existent role on ADD or DROP:

```sql
ALTER ROLE non_existent_role
    ADD RULE "select * from db1.t1"
    ON TABLE db1.t1;
-- ERROR: internal error: there is no role non_existent_role

ALTER ROLE non_existent_role DROP RULE ON TABLE db1.t1;
-- ERROR: internal error: there is no role non_existent_role
```

Non-existent rule on DROP:

```sql
ALTER ROLE test_rule_role DROP RULE ON TABLE no_such.rule;
-- ERROR: internal error: rule 'no_such.rule' does not exist for role 'test_rule_role'
```

### Example 6: End-to-end hint injection via enable_remap_hint

With the rule registered and `enable_remap_hint = 1` on the session,
queries issued under the role are rewritten transparently.

```sql
ALTER ROLE test_rule_role
    ADD RULE "select * from db1.t1 where age > 28"
    ON TABLE db1.t1;

CREATE USER test_rule_user IDENTIFIED BY '123456' DEFAULT ROLE test_rule_role;
GRANT connect ON ACCOUNT * TO test_rule_role;
GRANT select ON TABLE *.* TO test_rule_role;

-- Then, logged in as test_rule_user with test_rule_role active:
SET enable_remap_hint = 1;
SELECT * FROM db1.t1;
-- The filter "age > 28" is injected via a /*+ {"rewrites": {...}} */
-- hint and applied during execution.
```

## Notes

1. The catalog table `mo_catalog.mo_role_rule` is the backing store;
   `(role_id, rule_name)` forms the logical key, where `rule_name`
   is `db.tbl`.
2. Only the current session's cache is invalidated on ADD/DROP.
   Other sessions using the same role continue to serve the old
   rule set until they refresh (for example via `SET ROLE`).
3. See also: [SHOW RULES ON ROLE](show-rules-on-role.md) for
   inspecting registered rules.
