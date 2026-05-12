---
title: "Role Rewrite Rules (ALTER ROLE ... RULE / SHOW RULES)"
doc_type: reference
mysql_compat: mo_only
differs_from_mysql: []
mo_only: []
since: v3.0.10
last_updated: 2026-05-08
llms_summary: "Attach per-table rewrite rules to a MatrixOne role via ALTER ROLE ADD RULE / DROP RULE and list them with SHOW RULES ON ROLE, enabled per session by enable_remap_hint."
---

# Role Rewrite Rules

> Attach per-table rewrite rules to a role with `ALTER ROLE ... ADD RULE ... ON TABLE db.tbl`, remove them with `ALTER ROLE ... DROP RULE ON TABLE db.tbl`, and list them with `SHOW RULES ON ROLE role`. Rules are injected as a hint into queries issued by sessions whose default role owns the rule and that have enabled `enable_remap_hint`.

## Description

Role rewrite rules attach a replacement SQL fragment to a `(role, table)` pair inside `mo_catalog.mo_role_rule`. When a session whose default role owns matching rules has the `enable_remap_hint` session variable enabled, the frontend prepends a `/*+ {"rewrites": {...}} */` hint to outgoing SQL, letting downstream rewriters transparently redirect queries against the base table to the rule body (for example, to route reads to a view or a filtered subquery).

The feature is controlled by three statements:

- `ALTER ROLE <role> ADD RULE "<sql>" ON TABLE <db>.<tbl>` — upsert a rule.
- `ALTER ROLE <role> DROP RULE ON TABLE <db>.<tbl>` — remove a rule.
- `SHOW RULES ON ROLE <role>` — list all rules for a role.

Rules live per role; one role can own at most one rule per `(db, tbl)` pair — adding a second rule for the same table replaces the first.

## Syntax

```text
ALTER ROLE <role_name> ADD RULE "<rewrite_sql>" ON TABLE <db_name>.<table_name>
ALTER ROLE <role_name> DROP RULE ON TABLE <db_name>.<table_name>
SHOW RULES ON ROLE <role_name>
```

## Arguments

| Parameter | Description |
|-----------|-------------|
| `role_name` | The role to attach or detach the rule on. Must already exist. |
| `rewrite_sql` | Replacement SQL string, given as a double- or single-quoted literal. Stored verbatim in `mo_catalog.mo_role_rule.rule`. |
| `db_name.table_name` | Fully qualified target table identifier. The two parts together make up the `rule_name` column in `mo_catalog.mo_role_rule`. |

## Usage Notes

- **Role must exist.** All three statements first look up the role by name. If the role does not exist, they fail with `there is no role <role_name>`.
- **Target table need not exist at rule-creation time.** `ALTER ROLE ... ADD RULE` does not verify the table exists — the `db_name.table_name` pair is only used as the rule key and as the rewrite target for later queries.
- **Upsert semantics.** Adding a rule for a `(role, db.table)` pair that already has a rule overwrites the previous rule body.
- **DROP RULE requires an existing rule.** `ALTER ROLE ... DROP RULE ON TABLE db.tbl` fails with `rule '<db.table>' does not exist for role '<role>'` when no rule is attached.
- **`enable_remap_hint`.** Rewrite hints are injected only when the session variable `enable_remap_hint` is `1` (or `ON`). Without it, rules are stored but have no runtime effect.
- **Cache invalidation is per session.** Adding or dropping a rule invalidates the current session's cached rule map. Other sessions that already loaded their rule cache continue using the previous set until they reconnect or re-execute `SET ROLE`.
- **Storage.** Rules live in `mo_catalog.mo_role_rule`, one row per `(role_id, rule_name)`. `SHOW RULES ON ROLE` returns the `rule_name` and `rule` columns.

## Examples

```sql
DROP DATABASE IF EXISTS role_rule_demo;
CREATE DATABASE role_rule_demo;
USE role_rule_demo;

CREATE TABLE t1 (a INT PRIMARY KEY, age INT);
INSERT INTO t1 VALUES (1, 1), (2, 2), (100, 30);

DROP ROLE IF EXISTS demo_rule_role;
CREATE ROLE demo_rule_role;

-- Example 1: add a rule and list the rules attached to the role.
ALTER ROLE demo_rule_role ADD RULE 'select a, age from t1 where age > 28' ON TABLE role_rule_demo.t1;
SHOW RULES ON ROLE demo_rule_role;

-- Example 2: adding a second rule for the same (role, db.table) pair overwrites the previous body.
ALTER ROLE demo_rule_role ADD RULE 'select a, age from t1 where age > 50' ON TABLE role_rule_demo.t1;
SHOW RULES ON ROLE demo_rule_role;

-- Example 3: DROP RULE removes the rule for the target table.
ALTER ROLE demo_rule_role DROP RULE ON TABLE role_rule_demo.t1;
SHOW RULES ON ROLE demo_rule_role;

-- Example 4: dropping a rule that does not exist fails.
-- Expected-Success: false
ALTER ROLE demo_rule_role DROP RULE ON TABLE role_rule_demo.t1;

-- Example 5: targeting a non-existent role fails on all three verbs.
-- Expected-Success: false
ALTER ROLE non_existent_role ADD RULE 'select 1' ON TABLE role_rule_demo.t1;

DROP ROLE IF EXISTS demo_rule_role;
DROP TABLE t1;
DROP DATABASE role_rule_demo;
```

## Notes

1. The hint format injected into rewritten queries is `/*+ {"rewrites": {"<db.table>": "<rule_sql>", ...}} */`. Downstream rewriters decide how to apply it; absent a matching rewriter, the hint is inert.
2. Rule bodies are opaque strings — the server does not validate that `rewrite_sql` references the target table. Keep rules narrow and review `mo_catalog.mo_role_rule` periodically.
3. Rules are resolved by the session's *default* role. Changing the default role on the same user (via `SET ROLE` or re-login) reloads the rule cache.
