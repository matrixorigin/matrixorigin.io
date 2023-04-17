# **SHOW SEQUENCES**

## **Description**

`SHOW SEQUENCES` is used to view the name and list type of the current sequence list.

## **Syntax**

```
> SHOW SQUENCES
       [WHERE expr]
```

## **Examples**

```sql
CREATE SEQUENCE s1 START 101;
CREATE SEQUENCE s3 as smallint INCREMENT 10 MINVALUE -100 MAXVALUE 100 START 0 CYCLE;
CREATE SEQUENCE seq_id INCREMENT BY 1 MAXVALUE 1000 START with 1;
mysql> show sequences;
+--------+-----------+
| Names  | Data Type |
+--------+-----------+
| s3     | SMALLINT  |
| s1     | BIGINT    |
| seq_id | BIGINT    |
+--------+-----------+
3 rows in set (0.01 sec)
```
