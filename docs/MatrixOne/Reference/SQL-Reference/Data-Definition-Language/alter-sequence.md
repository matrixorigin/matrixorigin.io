# **ALTER SEQUENCE**

## **Grammar description**

`ALTER SEQUENCE` is used to modify an existing sequence.

## **Grammar structure**

```
> ALTER SEQUENCE [ IF EXISTS ] SEQUENCE_NAME
[ AS data_type ]
[ INCREMENT [ BY ] increment ]
[ MINVALUE minvalue] [ MAXVALUE maxvalue]
[ START [ WITH ] start ] [ [ NO ] CYCLE ]
```

### Grammatical interpretation

- `[IF EXISTS]`: Optional clause indicating that no error is raised if the specified sequence does not exist. If this clause is used, the system checks whether the sequence exists, and if not, ignores the modification request.

- `SEQUENCE_NAME`: The name of the sequence to modify.

- `[AS data_type]`: Optional clause that allows you to specify a data type for a sequence. Typically, the data type of a sequence is an integer.

- `[INCREMENT[BY]increment]`: This is the incremental value of the specified sequence. The increment value of a sequence is the amount to be added to the current value each time it is incremented or decremented. If no incremental value is specified, it usually defaults to 1.

- `[MINVALUE minvalue]`: This is the minimum value of the sequence, which specifies the minimum value allowed for the sequence. If a minimum value is specified, the current value of the sequence cannot be lower than this value.

- `[MAXVALUE maxvalue]`: This is the maximum value of the sequence, which specifies the maximum allowed for the sequence. If a maximum value is specified, the current value of the sequence cannot exceed this value.

- `[ START [`WITH ] start ]: This is the start value of the sequence, which specifies the initial value of the sequence. If no starting value is specified, it usually defaults to 1.

- `[NO] CYCLE]`: Optional clause that specifies whether sequence values should be recycled. If `NO CYCLE` is specified, the sequence stops incrementing or decrementing when the maximum or minimum value is reached. If this clause is not specified, it usually defaults to no loop.

## **Examples**

```sql
-- Create a sequence called alter_seq_01, set the increment of the sequence to 2, set the minimum value of the sequence to 30 and the maximum value to 100, and enable the loop
create sequence alter_seq_01 as smallint increment by 2 minvalue 30 maxvalue 100 cycle;

mysql> show sequences;
+--------------+-----------+
| Names        | Data Type |
+--------------+-----------+
| alter_seq_01 | SMALLINT  |
+--------------+-----------+
1 row in set (0.00 sec)

mysql> alter sequence alter_seq_01 as bigint;
Query OK, 0 rows affected (0.01 sec)

mysql> show sequences;
+--------------+-----------+
| Names        | Data Type |
+--------------+-----------+
| alter_seq_01 | BIGINT    |
+--------------+-----------+
1 row in set (0.00 sec)

-- Cancel loop for sequence alter_seq_01
mysql> alter sequence alter_seq_01 no cycle;
Query OK, 0 rows affected (0.01 sec)

mysql> select nextval('alter_seq_01'),currval('alter_seq_01');
+-----------------------+-----------------------+
| nextval(alter_seq_01) | currval(alter_seq_01) |
+-----------------------+-----------------------+
| 30                    | 30                    |
+-----------------------+-----------------------+
1 row in set (0.01 sec)

mysql> select nextval('alter_seq_01'),currval('alter_seq_01');
+-----------------------+-----------------------+
| nextval(alter_seq_01) | currval(alter_seq_01) |
+-----------------------+-----------------------+
| 32                    | 32                    |
+-----------------------+-----------------------+
1 row in set (0.00 sec)

-- Set the starting value of the sequence alter_seq_01 to 40
mysql> alter sequence alter_seq_01 start with 40;
Query OK, 0 rows affected (0.01 sec)

mysql> select nextval('alter_seq_01'),currval('alter_seq_01');
+-----------------------+-----------------------+
| nextval(alter_seq_01) | currval(alter_seq_01) |
+-----------------------+-----------------------+
| 40                    | 40                    |
+-----------------------+-----------------------+
1 row in set (0.01 sec)

mysql> select nextval('alter_seq_01'),currval('alter_seq_01');
+-----------------------+-----------------------+
| nextval(alter_seq_01) | currval(alter_seq_01) |
+-----------------------+-----------------------+
| 42                    | 42                    |
+-----------------------+-----------------------+
1 row in set (0.00 sec)

-- Set the incremental value of the sequence alter_seq_01 to 3
mysql> alter sequence alter_seq_01 increment by 3;
Query OK, 0 rows affected (0.01 sec)

mysql> select nextval('alter_seq_01'),currval('alter_seq_01');
+-----------------------+-----------------------+
| nextval(alter_seq_01) | currval(alter_seq_01) |
+-----------------------+-----------------------+
| 40                    | 40                    |
+-----------------------+-----------------------+
1 row in set (0.00 sec)

mysql> select nextval('alter_seq_01'),currval('alter_seq_01');
+-----------------------+-----------------------+
| nextval(alter_seq_01) | currval(alter_seq_01) |
+-----------------------+-----------------------+
| 43                    | 43                    |
+-----------------------+-----------------------+
1 row in set (0.00 sec)
```
