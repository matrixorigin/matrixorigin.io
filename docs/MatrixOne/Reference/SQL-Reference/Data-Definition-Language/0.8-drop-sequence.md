# **DROP SEQUENCE**

## **Description**

`DROP SEQUENCE` is used to drop a sequence. It allows you to delete sequences previously created with the `CREATE SEQUENCE` command.

Deleting a sequence deletes all properties and values of the sequence. Therefore, before dropping a sequence, you must ensure that no tables are still using the sequence.

## **Syntax**

```
> DROP SEQUENCE [ IF EXISTS ] SEQUENCE_NAME [, ...]
  [IF EXISTS]
```

## **Examples**

```sql
-- Delete the sequence named "seq_id"
DROP SEQUENCE seq_id;
```
