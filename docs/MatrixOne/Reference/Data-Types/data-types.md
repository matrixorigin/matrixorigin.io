# **Data Types Overview**

MatrixOne Data types conforms with MySQL Data types definition.

Reference: <https://dev.mysql.com/doc/refman/8.0/en/data-types.html>

## **Integer Numbers**

|  Data Type   | Size  |  Min Value   | Max Value  |
|  ----  | ----  |  ----  | ----  |
| TINYINT  | 1 byte | 	-128  | 127 |
| SMALLINT  | 2 bytes | -32768  | 32767 |
| INT  | 4 bytes | 	-2147483648	  | 2147483647 |
| BIGINT  | 8 bytes | -9223372036854775808	  | 9223372036854775807 |
| TINYINT UNSIGNED | 1 byte | 0	  | 255 |
| SMALLINT UNSIGNED | 2 bytes | 0	  | 65535 |
| INT UNSIGNED | 4 bytes | 0	  | 4294967295 |
| BIGINT UNSIGNED | 8 bytes | 0	  | 18446744073709551615 |

### **Examples**

- TINYINT and TINYINT UNSIGNED

```sql
-- Create a table named "inttable" with 2 attributes of a "tinyint", a "tinyint unsigned",
create table inttable ( a tinyint not null default 1, tinyint8 tinyint unsigned primary key);
insert into inttable (tinyint8) values (0),(255), (0xFE), (253);

mysql> select * from inttable order by 2 asc;
+------+----------+
| a    | tinyint8 |
+------+----------+
|    1 |        0 |
|    1 |      253 |
|    1 |      254 |
|    1 |      255 |
+------+----------+
4 rows in set (0.03 sec)
```

- SMALLINT and SMALLINT UNSIGNED

```sql
-- Create a table named "inttable" with 2 attributes of a "smallint", a "smallint unsigned",
drop table inttable;
create table inttable ( a smallint not null default 1, smallint16 smallint unsigned);
insert into inttable (smallint16) values (0),(65535), (0xFFFE), (65534), (65533);

mysql> select * from inttable;
+------+------------+
| a    | smallint16 |
+------+------------+
|    1 |          0 |
|    1 |      65535 |
|    1 |      65534 |
|    1 |      65534 |
|    1 |      65533 |
+------+------------+
5 rows in set (0.01 sec)
```

- INT and INT UNSIGNED

```sql
-- Create a table named "inttable" with 2 attributes of a "int", a "int unsigned",
drop table inttable;
create table inttable ( a int not null default 1, int32 int unsigned primary key);
insert into inttable (int32) values (0),(4294967295), (0xFFFFFFFE), (4294967293), (4294967291);

mysql> select * from inttable order by a desc, 2 asc;
+------+------------+
| a    | int32      |
+------+------------+
|    1 |          0 |
|    1 | 4294967291 |
|    1 | 4294967293 |
|    1 | 4294967294 |
|    1 | 4294967295 |
+------+------------+
5 rows in set (0.01 sec)
```

- BIGINT and BIGINT UNSIGNED

```sql
-- Create a table named "inttable" with 2 attributes of a "bigint", a "bigint unsigned",
drop table inttable;
create table inttable ( a bigint, big bigint primary key );
insert into inttable values (122345515, 0xFFFFFFFFFFFFE), (1234567, 0xFFFFFFFFFFFF0);

mysql> select * from inttable;
+-----------+------------------+
| a         | big              |
+-----------+------------------+
| 122345515 | 4503599627370494 |
|   1234567 | 4503599627370480 |
+-----------+------------------+
2 rows in set (0.01 sec)
```

## **Real Numbers**

|  Data Type   | Size  |  Precision   |  Min Value   | Max Value  | Syntax |
|  ----  | ----  |  ----  | ----  | ---|---|
| FLOAT32  | 4 bytes | 	23 bits  |-3.40282e+038|3.40282e+038 |FLOAT(M, D) <br>M represents the maximum length and D represents the number of decimal places displayed. The value range of M is (1=< M <=255). <br> The value range of D is (1=< D <=30), and M >= D. <br> Float numbers with precision show the number of bits with the required precision, and a trailing zero is added when the number of bits falls short. |
| FLOAT64  | 8 bytes |  53 bits  |-1.79769e+308|1.79769e+308|DOUBLE(M, D) <br>M represents the maximum length and D represents the number of decimal places displayed. The value range of M is (1=< M <=255). <br> The value range of D is (1=< D <=30), and M >= D. <br> Float numbers with precision show the number of bits with the required precision, and a trailing zero is added when the number of bits falls short. |

### **Examples**

```sql
-- Create a table named "floatt1" with precision, a trailing zero is added when the number of bits falls short
create table floatt1(a float(5, 2));
insert into floatt1 values(1), (2.5), (3.56), (4.678);
mysql> select * from floatt1;
+------+
| a    |
+------+
| 1.00 |
| 2.50 |
| 3.56 |
| 4.68 |
+------+
4 rows in set (0.00 sec)

-- Create a table named "floattable" with 1 attributes of a "float"
create table floattable ( a float not null default 1, big float(20,5) primary key);
insert into floattable (big) values (-1),(12345678.901234567),(92233720368547.75807);

mysql> select * from floattable order by a desc, big asc;
+------+----------------------+
| a    | big                  |
+------+----------------------+
|    1 |             -1.00000 |
|    1 |       12345679.00000 |
|    1 | 92233718038528.00000 |
+------+----------------------+
3 rows in set (0.01 sec)

mysql> select min(big),max(big),max(big)-1 from floattable;
+----------+----------------------+----------------+
| min(big) | max(big)             | max(big) - 1   |
+----------+----------------------+----------------+
| -1.00000 | 92233718038528.00000 | 92233718038527 |
+----------+----------------------+----------------+
1 row in set (0.05 sec)
```

## **Binary type**

|  data type | storage space | minimum value | maximum values  | grammatical representation  | descriptive |
| --------| --------| ----- | -------------------- | -------- | ----  |
| BIT     | 1bytes  | 0     | 18446744073709551615 | BIT(M)   | Data type for storing bit data, M supports the range from 1 to 64, M is 1 by default, if the stored data is less than M bits, then the length will be left zero padded. |

### **Examples**

```sql
create table t1 (a bit);
mysql> desc  t1;--bit(M)  M DEFAULT 1
+-------+--------+------+------+---------+-------+---------+
| Field | Type   | Null | Key  | Default | Extra | Comment |
+-------+--------+------+------+---------+-------+---------+
| a     | BIT(1) | YES  |      | NULL    |       |         |
+-------+--------+------+------+---------+-------+---------+
1 row in set (0.01 sec)

create table t2 (a bit(8));

-- Assigning values with bit-value literal syntax
insert into t2 values (0b1);
insert into t2 values (b'1');
mysql> select * from t2;
+------------+
| a          |
+------------+
| 0x01       |
| 0x01       |
+------------+
2 rows in set (0.00 sec)

truncate table t2;

--Assigning values with hex-value literal syntax
insert into t2 values (0x10);
insert into t2 values (x'10');
mysql> select * from t2;
+------------+
| a          |
+------------+
| 0x10       |
| 0x10       |
+------------+
2 rows in set (0.00 sec)

truncate table t2;

--Supports assignment by int type, but the length of the binary representation of int cannot exceed the length of bit type.
insert into t2 values (255);--a = b'11111111'
mysql> insert into t2 values (256);--The length of the binary representation of 256 exceeds 8.
ERROR 20301 (HY000): invalid input: data too long, type width = 8, val = 100000000

mysql> select * from t2;
+------------+
| a          |
+------------+
| 0xFF       |
+------------+
1 row in set (0.00 sec)

truncate table t2;

--Floating-point data will first be rounded to int type and then assigned according to the int type.
insert into t2 values (2.1);--a = b'00000010'
mysql> select * from t2;
+------------+
| a          |
+------------+
| 0x02       |
+------------+
1 row in set (0.00 sec)

truncate table t2;

--Character data is stored as its encoded value, and the total length of the encoding into which the entire string is converted must not exceed the bit type.
insert into t2 values ('a');--a = b'01100001' 
mysql> insert into t2 values ('啊');--utf8('啊') = 0xe5958a;
ERROR 20301 (HY000): invalid input: data too long, type width = 8, val = 111001011001010110001010

mysql> select * from t2;
+------------+
| a          |
+------------+
| 0x61       |
+------------+
1 row in set (0.00 sec)
```

## **String Types**

|  Data Type   | Size |Length | Syntax | Description|
|  ----  | ----  |  ---  | ----  | ---- |
| char      | 24 bytes| 0 ~ 4294967295 |CHAR| Fixed length string |
| varchar   | 24 bytes| 0 ~ 4294967295 |VARCHAR| Variable length string|
| binary     |255 bytes| 0 ~ 65535  |BINARY(M)| Similar to CHAR, binary string |
| varbinary  | 255 bytes| 0 ~ 65535  |VARBINARY(M)| Similar to VARCHAR, binary string|
| text      | 1 GB|other types mapping |TEXT |Long text data, TINY TEXT, MEDIUM TEXT, and LONG TEXT are not distinguished|
| blob      | 1 GB| other types mapping|BLOB |Long text data in binary form, TINY BLOB, MEDIUM BLOB, and LONG BLOB are not distinguished|
| enum  | 1 byte or 2 bytes | 0 ~ 65535 | enum  | An enumeration. A string object that can have only one value, chosen from the list of values 'value1', 'value2', ..., NULL or the special '' error value. ENUM values are represented internally as integers. |

### **Examples**

- CHAR and VARCHAR

```sql
-- Create a table named "names" with 2 attributes of a "varchar" and a "char"
create table names(name varchar(255),age char(255));
insert into names(name, age) values('Abby', '24');
insert into names(name, age) values("Bob", '25');
insert into names(name, age) values('Carol', "23");
insert into names(name, age) values("Dora", "29");

mysql> select name,age from names;
+-------+------+
| name  | age  |
+-------+------+
| Abby  | 24   |
| Bob   | 25   |
| Carol | 23   |
| Dora  | 29   |
+-------+------+
4 rows in set (0.00 sec)
```

- BINARY and VARBINARY

```sql
-- Create a table named "names" with 2 attributes of a "varchar" and a "char"
create table names(name varbinary(255),age binary(255));
insert into names(name, age) values('Abby', '24');
insert into names(name, age) values("Bob", '25');
insert into names(name, age) values('Carol', "23");
insert into names(name, age) values("Dora", "29");

mysql> select name,age from names;
+--------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| name         | age                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
+--------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| 0x41626279   | 0x323400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000 |
| 0x426F62     | 0x323500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000 |
| 0x4361726F6C | 0x323300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000 |
| 0x446F7261   | 0x323900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000 |
+--------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
4 rows in set (0.01 sec)
```

- TEXT

```sql
-- Create a table named "texttest" with 1 attribute of a "text"
create table texttest (a text);
insert into texttest values('abcdef');
insert into texttest values('_bcdef');
insert into texttest values('a_cdef');
insert into texttest values('ab_def');
insert into texttest values('abc_ef');
insert into texttest values('abcd_f');
insert into texttest values('abcde_');

mysql> select * from texttest where a like 'ab\_def' order by 1 asc;
+--------+
| a      |
+--------+
| ab_def |
+--------+
1 row in set (0.01 sec)
```

- BLOB

```sql
-- Create a table named "blobtest" with 1 attribute of a "blob"
create table blobtest (a blob);
insert into blobtest values('abcdef');
insert into blobtest values('_bcdef');
insert into blobtest values('a_cdef');
insert into blobtest values('ab_def');
insert into blobtest values('abc_ef');
insert into blobtest values('abcd_f');
insert into blobtest values('abcde_');

mysql> select * from blobtest where a like 'ab\_def' order by 1 asc;
+----------------+
| a              |
+----------------+
| 0x61625F646566 |
+----------------+
1 row in set (0.01 sec)
```

- ENUM

```sql
-- Create a table named "enumtest" with 1 attribute of a "enum"
CREATE TABLE enumtest (color ENUM('red', 'green', 'blue'));
INSERT INTO enumtest (color) VALUES ('red');
mysql> SELECT * FROM enumtest WHERE color = 'green';
+-------+
| color |
+-------+
| green |
+-------+
1 row in set (0.01 sec)
```

## **JSON Types**

|JSON Data Type| Syntax |
|---|---|
|Object|Object is enclosed by `{}`, separated by commas between key-value pairs, and separated by colons `:` between keys and values.<br>The value/key can be String, Number, Bool, Time and date.|
|Array|Array is enclosed by `[]`, separated by commas between key-value pairs, and separated by colons `:` between keys and values. <br>The value can be String, Number, Bool, Time and date.|

### **Examples**

```sql
-- Create a table named "jsontest" with 1 attribute of a "json"
create table jsontest (a json,b int);
insert into jsontest values ('{"t1":"a"}',1),('{"t1":"b"}',2);

mysql> select * from jsontest;
+-------------+------+
| a           | b    |
+-------------+------+
| {"t1": "a"} |    1 |
| {"t1": "b"} |    2 |
+-------------+------+
2 rows in set (0.01 sec)
```

## **Time and Date Types**

|  Data Type   | Size  | Resolution |  Min Value   | Max Value  | Precision |
|  ----  | ----  |   ----  |  ----  | ----  |   ----  |
|  Time  | 8 bytes  |   microsecond  |  -2562047787:59:59.999999 | 2562047787:59:59.999999  |   hh:mm:ss.ssssss  |
| Date  | 4 bytes | day | 0001-01-01  | 9999-12-31 | YYYY-MM-DD/YYYYMMDD |
| DateTime  | 8 bytes | microsecond | 0001-01-01 00:00:00.000000  | 9999-12-31 23:59:59.999999 | YYYY-MM-DD hh:mi:ssssss |
| TIMESTAMP|8 bytes|microsecond|0001-01-01 00:00:00.000000|9999-12-31 23:59:59.999999|YYYYMMDD hh:mi:ss.ssssss|

The Time and Date section type supports the following hint values when inserting data:

- `Time`:{t 'xx'},{time 'xx'}

- `Date`:{d 'xx'},{date 'xx'}

- `TIMESTAMP`:{ts 'xx'},{timestamp 'xx'}

### **Examples**

- TIME

```sql
-- Create a table named "timetest" with 1 attributes of a "time"
create table time_02(t1 time);
insert into time_02 values(200),(time'23:29:30'),({t'12:11:12'}),('');

mysql> select * from time_02;
+----------+
| t1       |
+----------+
| 00:02:00 |
| 23:29:30 |
| 12:11:12 |
| NULL     |
+----------+
4 rows in set (0.01 sec)
```

- DATE

```sql
-- Create a table named "datetest" with 1 attributes of a "date"
create table datetest (a date not null, primary key(a));
insert into datetest values ({d'2022-01-01'}), ('20220102'),(date'2022-01-03'),({d now()});
mysql> select * from datetest;
+------------+
| a          |
+------------+
| 2022-01-01 |
| 2022-01-02 |
| 2022-01-03 |
| 2024-03-19 |
+------------+
4 rows in set (0.00 sec)
```

- DATETIME

```sql
-- Create a table named "datetimetest" with 1 attributes of a "datetime"
create table datetimetest (a datetime(0) not null, primary key(a));
insert into datetimetest values ('20200101000000'), ('2022-01-02'), ('2022-01-02 00:00:01'), ('2022-01-02 00:00:01.512345');

mysql> select * from datetimetest order by a asc;
+---------------------+
| a                   |
+---------------------+
| 2020-01-01 00:00:00 |
| 2022-01-02 00:00:00 |
| 2022-01-02 00:00:01 |
| 2022-01-02 00:00:02 |
+---------------------+
4 rows in set (0.02 sec)
```

- TIMESTAMP

```sql
-- Create a table named "timestamptest" with 1 attribute of a "timestamp"
create table timestamptest (a timestamp(0) not null, primary key(a));
insert into timestamptest values ('20200101000000'), (timestamp'2022-01-02 11:30:40'), ({ts'2022-01-02 00:00:01'}), ({ts current_timestamp});

mysql> select * from timestamptest;
+---------------------+
| a                   |
+---------------------+
| 2020-01-01 00:00:00 |
| 2022-01-02 11:30:40 |
| 2022-01-02 00:00:01 |
| 2024-03-19 17:22:08 |
+---------------------+
4 rows in set (0.00 sec)
```

## **Bool**

|  Data Type   | Size  |
|  ----  | ----  |
| True  | 1 byte |
|False|1 byte|

### **Examples**

```sql
-- Create a table named "booltest" with 2 attribute of a "boolean" and b "bool"
create table booltest (a boolean,b bool);
insert into booltest values (0,1),(true,false),(true,1),(0,false),(NULL,NULL);

mysql> select * from booltest;
+-------+-------+
| a     | b     |
+-------+-------+
| false | true  |
| true  | false |
| true  | true  |
| false | false |
| NULL  | NULL  |
+-------+-------+
5 rows in set (0.00 sec)
```

## **Decimal Types**

|  Data Type   | Size  |  Precision   | Syntax |
|  ----  | ----  |  ----  | ----  |
| Decimal64  | 8 bytes | 	18 digits  | Decimal(N,S) <br> N is the total number of digits, the range is(1 ~ 18). The decimal point and (for negative numbers) the - sign are not counted in N.<br>If N is omitted, the default value of N should be the largest; that is, the value is 18. <br>S is the number of digits after the decimal point (the scale), the range is(0 ~ N)<br> If S is 0, values have no decimal point or fractional part. If S is omitted, the default is 0, for example, Decimal(10) is equivalent to Decimal(10, 0). <br>For example, Decimal(10,8) represents a number with a total length of 10 and a decimal place of 8. |
| Decimal128  | 16 bytes | 	38 digits  |  Decimal(N,S) <br> N is the total number of digits, the range is(18 ~ 38). The decimal point and (for negative numbers) the - sign are not counted in N.<br>If N is omitted, the default value of N should be the largest; that is, the value is 38. <br>S is the number of digits after the decimal point (the scale), the range is(0 ~ N)<br> If S is 0, values have no decimal point or fractional part. If S is omitted, the default is 0, for example, Decimal(20) is equivalent to Decimal(20, 0).<br>For example, Decimal(20,9) represents a number with a total length of 20 and a decimal place of 9.  |

### **Examples**

```sql
-- Create a table named "decimalTest" with 2 attribute of a "decimal" and b "decimal"
create table decimalTest(a decimal(6,3), b decimal(24,18));
insert into decimalTest values(123.4567, 123456.1234567891411241355);

mysql> select * from decimalTest;
+---------+---------------------------+
| a       | b                         |
+---------+---------------------------+
| 123.457 | 123456.123456789141124136 |
+---------+---------------------------+
1 row in set (0.01 sec)
```

## **UUID Type**

|UUID type | Explanation |
|---|---|
|[UUID](uuid-type.md) | A UUID value consists of 32 hexadecimal digits and 4 hyphens '-', in the form of 8-4-4-4-12, a standard UUID example: `a0eebc99 -9c0b-4ef8-bb6d-6bb9bd380a11`. |

### **Example**

```sql
-- Create a new table named 't1' and set the 'a' column as UUID type, and set the 'a' column as the primary key
create table t1(a uuid primary key);

-- Insert a new UUID value into column 'a' of table 't1'
insert into t1 values ​​(uuid());

-- Query the length of the value of the 'a' column in the 't1' table converted to a string
mysql> select length(cast(a as varchar)) from t1;
+----------------------------+
|length(cast(a as varchar))|
+----------------------------+
| 36 |
+----------------------------+
1 row in set (0.01 sec)

-- Query all records in the t1 table, whose value is a UUID
mysql> select * from t1;
+----------------------------------------+
| a |
+----------------------------------------+
| 948d8e4e-1b00-11ee-b656-5ad2460dea50 |
+----------------------------------------+
1 row in set (0.00 sec)
```

## **vector data type**

|type         | descriptive       |
|------------|---------------------  |
|vecf32      | Vector column type is float32     |
|vecf64      | Vector column type is float64     |

### **Example**

```sql
create table t1(n1 vecf32(3), n2 vecf64(2));
insert into t1 values("[1,2,3]",'[4,5]');

mysql> select * from t1;
+-----------+--------+
| n1        | n2     |
+-----------+--------+
| [1, 2, 3] | [4, 5] |
+-----------+--------+
1 row in set (0.00 sec)
```

## Datalink data type

|Type | Explanation |
|----------------|---------------------|
|datalink | Special data class used to store links to documents (such as satge) or files |

### Example

```sql
drop table test01;
create table test01 (col1 int, col2 datalink);
create stage stage01 url='file:///Users/admin/case/';
insert into test01 values (1, 'file:///Users/admin/case/t1.csv');
insert into test01 values (2, 'file:///Users/admin/case/t1.csv?size=2');
insert into test01 values (3, 'file:///Users/admin/case/t1.csv?offset=4');
insert into test01 values (4, 'file:///Users/admin/case/t1.csv?offset=4&size=2');
insert into test01 values (5, 'stage://stage01/t1.csv');
insert into test01 values (6, 'stage://stage01/t1.csv?size=2');
insert into test01 values (7, 'stage://stage01/t1.csv?offset=4');
insert into test01 values (8, 'stage://stage01/t1.csv?offset=4&size=2');

mysql> select * from test01;
+------+-------------------------------------------------+
| col1 | col2                                            |
+------+-------------------------------------------------+
|    1 | file:///Users/admin/case/t1.csv                 |
|    2 | file:///Users/admin/case/t1.csv?size=2          |
|    3 | file:///Users/admin/case/t1.csv?offset=4        |
|    4 | file:///Users/admin/case/t1.csv?offset=4&size=2 |
|    5 | stage://stage01/t1.csv                          |
|    6 | stage://stage01/t1.csv?size=2                   |
|    7 | stage://stage01/t1.csv?offset=4                 |
|    8 | stage://stage01/t1.csv?offset=4&size=2          |
+------+-------------------------------------------------+
8 rows in set (0.01 sec)
```