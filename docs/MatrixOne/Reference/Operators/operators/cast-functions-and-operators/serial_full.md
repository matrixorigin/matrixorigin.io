# SERIAL_FULL()

## Function Description

`SERIAL_FULL()` is used to serialize concatenation strings and convert single or multiple column/value combinations into binary format with a return type of `VARCHAR`, generally used with the [`SERIAL_EXTRACT()`](../../../Functions-and-Operators/Other/serial_extract.md) function. `SERIAL_FULL()` is similar to [`SERIAL()`](serial.md), but `SERIAL_FULL()` retains a NULL value.

## Function syntax

```
> SERIAL_FULL(para)
```

## Parameter interpretation

| Parameters | Description |
| ---- | ---- |
| para | Column/Value to Serialize|

## Examples

```sql
create table t1(a varchar(3), b int);
insert into t1 values("ABC",1);
insert into t1 values("DEF",NULL);

mysql> select serial_full(a,b) from t1;--The query returns the result serialized for the combination of columns a and b. NULL values are preserved when available.
+-------------------+
| serial_full(a, b) |
+-------------------+
| FABC :         |
| FDEF             |
+-------------------+
2 rows in set (0.00 sec)

mysql> select serial_full(1.2,'world') ;--The query returns the result serialized as a combination of the value 1.2 and the value hello.
+-------------------------+
| serial_full(1.2, world) |
+-------------------------+
| D?      
          Fworld         |
+-------------------------+
1 row in set (0.01 sec)
```