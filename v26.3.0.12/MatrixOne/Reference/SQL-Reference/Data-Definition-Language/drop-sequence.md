---
title: "DROP SEQUENCE"
doc_type: reference
mysql_compat: mo_only
differs_from_mysql: []
mo_only:
  - "DROP SEQUENCE"
since: unknown
last_updated: 2026-05-08
llms_summary: "DROP SEQUENCE is used to drop a sequence."
---
# **DROP SEQUENCE**

> DROP SEQUENCE is used to drop a sequence.

## **Description**

`DROP SEQUENCE` is used to drop a sequence. It allows you to delete sequences previously created with the `CREATE SEQUENCE` command.

Deleting a sequence deletes all properties and values of the sequence. Therefore, before dropping a sequence, you must ensure that no tables are still using the sequence.

## **Syntax**

```
> DROP SEQUENCE [ IF EXISTS ] SEQUENCE_NAME [, ...]
  [IF EXISTS]
```

## **Examples**

<!-- validator-ignore-exec -->
```sql
-- Delete the sequence named "seq_id"
DROP SEQUENCE seq_id;
```
