---
title: "Role Rewrite Rules (ALTER ROLE ... RULE / SHOW RULES)"
doc_type: reference
mysql_compat: mo_only
differs_from_mysql: []
mo_only: []
since: v3.0.10
last_updated: 2026-05-26
llms_summary: "Attach per-table rewrite rules to a MatrixOne role via ALTER ROLE ADD RULE / DROP RULE and list them with SHOW RULES ON ROLE, enabled per session by enable_remap_hint."
---

# Role Rewrite Rules

> Attach per-table rewrite rules to a role with `ALTER ROLE ... ADD RULE ... ON TABLE db.tbl`, remove them with `ALTER ROLE ... DROP RULE ON TABLE db.tbl`, and list them with `SHOW RULES ON ROLE role`. Rules are injected as a hint into queries issued by sessions whose default role owns the rule and that have enabled `enable_remap_hint`.

## Description

Role rewrite rules attach a replacement SQL fragment to a `(role, table)` pair inside `mo_catalog.mo_role_rule`. When a session has the `enable_remap_hint` session variable enabled, the frontend collects rules from **all active roles** — the default role, directly granted secondary roles, and inherited roles — then prepends a `/*+ {"rewrites": {...}} */` hint to outgoing SQL, letting downstream rewriters transparently redirect queries against the base table to the rule body (for example, to route reads to a view or a filtered subquery).

The feature is controlled by three statements:

- `ALTER ROLE <role> ADD RULE "<sql>" ON TABLE <db>.<tbl>` — upsert a rule. The `<sql>` must be a syntactically valid `SELECT` statement; non-SELECT or malformed SQL is rejected before any write occurs.
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

- **All active roles contribute rules.** When `enable_remap_hint` is enabled, rules are loaded from the default role, directly granted secondary roles (if `SET SECONDARY ROLE ALL` is active), and all inherited roles discovered via breadth-first traversal by grant time. Previously only the default role's rules were used.
- **Rule conflict resolution.** When multiple roles define a rule for the same `(db, tbl)` pair, priority follows active-role discovery order: default role first, directly granted secondary roles by grant time second, inherited roles in breadth-first grant-time order third. Later rules in priority order override earlier ones for the same `rule_name`.
- **Compatible rules are merged.** If rules from different roles for the same table produce identical output columns (same column names and expressions), they are merged into a single `(...rule_a...) UNION DISTINCT (...rule_b...)` rule body. Rules that are not mergeable (differing output columns, aggregates, window functions, ORDER BY, LIMIT, or volatile functions) are resolved by priority — the higher-priority rule wins rather than producing a broken UNION.
- **Rule SQL is validated on ADD RULE.** `ALTER ROLE ... ADD RULE` now parses and validates the `rule_sql` before writing to `mo_catalog.mo_role_rule`. Only syntactically valid `SELECT` (and parenthesized `SELECT`) statements are accepted. Empty SQL, syntax errors, and non-SELECT statements (e.g., `DELETE`, `UPDATE`) are rejected immediately with an error.
- **Error propagation.** If loading the rule cache fails (e.g., a previously accepted rule is unparseable), the error is returned to the client as a query error rather than being silently swallowed. Queries that would have silently fallen back to unmodified SQL in older versions may now fail explicitly.
- **Role must exist.** All three statements first look up the role by name. If the role does not exist, they fail with `there is no role <role_name>`.
- **Target table need not exist at rule-creation time.** `ALTER ROLE ... ADD RULE` does not verify the table exists — the `db_name.table_name` pair is only used as the rule key and as the rewrite target for later queries.
- **Upsert semantics.** Adding a rule for a `(role, db.table)` pair that already has a rule overwrites the previous rule body.
- **DROP RULE requires an existing rule.** `ALTER ROLE ... DROP RULE ON TABLE db.tbl` fails with `rule '<db.table>' does not exist for role '<role>'` when no rule is attached.
- **`enable_remap_hint`.** Rewrite hints are injected only when the session variable `enable_remap_hint` is `1` (or `ON`). Without it, rules are stored but have no runtime effect.
- **Cache invalidation is per session.** Adding or dropping a rule invalidates the current session's cached rule map. Switching roles (via `SET ROLE` or secondary role toggle) also invalidates the privilege and rewrite rule caches, so newly active rules take effect immediately.
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
2. Rule bodies are opaque strings beyond the initial `SELECT` syntax validation at `ADD RULE` time — the server does not verify that `rewrite_sql` references the target table or produces semantically correct results. Keep rules narrow and review `mo_catalog.mo_role_rule` periodically.
3. Rules are resolved from all active roles: the session's default role, secondary roles (when `SET SECONDARY ROLE ALL` is active), and inherited roles. Changing the active role set (via `SET ROLE`, `SET SECONDARY ROLE ALL/NONE`, or re-login) invalidates the rule cache and reloads rules from the new role configuration.
