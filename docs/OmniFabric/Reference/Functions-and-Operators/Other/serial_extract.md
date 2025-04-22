# SERIAL_EXTRACT function

## Function Description

The `SERIAL_EXTRACT()` function is used to extract the individual elements in a sequence/tuple value and is used in conjunction with the functions [`MAX()`](../Aggregate-Functions/max.md), [`MIN()`](../Aggregate-Functions/min.md), [`SERIAL()`](../../Operators/operators/cast-functions-and-operators/serial.md), [`SERIAL_NULL()`](../../Operators/operators/cast-functions-and-operators/serial_full.md).

## Function syntax

```
>SERIAL_EXTRACT(serial_col, pos as type)
```

## Parameter interpretation

| Parameters | Description |
| ---- | ---- |
| serial_col | Required parameters. Holds a string row of serial/serial_full function values. If you need to change the output type you can use it in conjunction with the [`CAST()`](../../Operators/operators/cast-functions-and-operators/cast.md) function. |
| pos | Required parameters. Position of the field to extract, 0 is the first. |
| type| Required parameter. The original type of the exported element. Requires consistency with extracted element type. |

## Examples

```sql
drop table if exists vtab64;
create table vtab64(id int primary key auto_increment,`vecf64_3` vecf64(3),`vecf64_5` vecf64(5));
insert into vtab64(vecf64_3,vecf64_5) values("[1,NULL,2]",NULL);
insert into vtab64(vecf64_3,vecf64_5) values(NULL,NULL);
insert into vtab64(vecf64_3,vecf64_5) values("[2,3,4]",NULL);
insert into vtab64(vecf64_3,vecf64_5) values ("[4,5,6]","[1,2,3,4,5]");
insert into vtab64(vecf64_3,vecf64_5) values ("[7,8,9]","[2,3,4,5,6]");

mysql> select * from vtab64;
+------+-----------+-----------------+
| id   | vecf64_3  | vecf64_5        |
+------+-----------+-----------------+
|    1 | NULL      | NULL            |
|    2 | [2, 3, 4] | NULL            |
|    3 | [4, 5, 6] | [1, 2, 3, 4, 5] |
|    4 | [7, 8, 9] | [2, 3, 4, 5, 6] |
+------+-----------+-----------------+
4 rows in set (0.01 sec)

--max(max(serial(id, `vecf64_3`, `vecf64_5`)) gets a maximum serialized value, and then normally the max obtained would be the record (4, [7, 8, 9], [2, 3, 4, 5, 6]), but the 1 represents the value in the second position, so that's [7, 8, 9].
mysql> select serial_extract(max(serial(id, `vecf64_3`, `vecf64_5`)), 1 as vecf64(3)) as a from vtab64;
+-----------+
| a         |
+-----------+
| [7, 8, 9] |
+-----------+
1 row in set (0.01 sec)

mysql> select serial_extract(min(serial(id, `vecf64_3`, `vecf64_5`)), 2 as vecf64(5)) as a from vtab64;
+-----------------+
| a               |
+-----------------+
| [1, 2, 3, 4, 5] |
+-----------------+
1 row in set (0.00 sec)

mysql> select serial_extract(max(serial_full(cast(id as decimal), `vecf64_3`)), 0 as decimal) as a from vtab64;
+------+
| a    |
+------+
|    4 |
+------+
1 row in set (0.01 sec)

mysql> select serial_extract(min(serial_full(cast(id as decimal), `vecf64_3`)), 1 as vecf64(3)) as a from vtab64;
+------+
| a    |
+------+
| NULL |
+------+
1 row in set (0.00 sec)
```
