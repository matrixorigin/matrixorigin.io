# **UNNEST()**

## **Description**

The `UNNEST` function is used to expand the column or parameter of the array type in the JSON type data into a table. It splits the elements in the array in the JSON-type data into individual rows so that the array elements can be processed individually or joined with other tables.

When given an empty array, the `UNNEST` function returns an empty list because there are no additional elements.

When a `NULL` value is entered, the `UNNEST` function returns an empty table because `NULL` is not a valid array.

## **Syntax**

```
> UNNEST(array_expression)
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| array_expression | Required. It is an array expression that can be an array column, an array constant, or the return value of an array function. |

## **Examples**

- Example 1:

```sql
-- Expand a string array containing JSON objects, '{"a":1}' is a string array containing a single element. This element is a string representing a JSON object.
> select * from unnest('{"a":1}') u;
+----------------+------+------+------+-------+-------+----------+
| col            | seq  | key  | path | index | value | this     |
+----------------+------+------+------+-------+-------+----------+
| UNNEST_DEFAULT |    0 | a    | $.a  |  NULL | 1     | {"a": 1} |
+----------------+------+------+------+-------+-------+----------+
1 row in set (0.00 sec)

-- Expand a string array '[1,2,3]' containing integers, and use the alias u to represent the expanded columns.
> select * from unnest('[1,2,3]') u;
+----------------+------+------+------+-------+-------+-----------+
| col            | seq  | key  | path | index | value | this      |
+----------------+------+------+------+-------+-------+-----------+
| UNNEST_DEFAULT |    0 | NULL | $[0] |     0 | 1     | [1, 2, 3] |
| UNNEST_DEFAULT |    0 | NULL | $[1] |     1 | 2     | [1, 2, 3] |
| UNNEST_DEFAULT |    0 | NULL | $[2] |     2 | 3     | [1, 2, 3] |
+----------------+------+------+------+-------+-------+-----------+
3 rows in set (0.00 sec)

-- Expands a string array '[1,2,3]' containing integers and selects the first element of the array to return as part of the result set. '$[0]' is a path expression specifying the array elements to select, and true is a boolean indicating whether to return a path and uses the alias u for expanded columns.
> select * from unnest('[1,2,3]','$[0]',true) u;
+----------------+------+------+------+-------+-------+------+
| col            | seq  | key  | path | index | value | this |
+----------------+------+------+------+-------+-------+------+
| UNNEST_DEFAULT |    0 | NULL | $[0] |  NULL | NULL  | 1    |
+----------------+------+------+------+-------+-------+------+
1 row in set (0.00 sec)
```

- Example 2:

```sql
create table t1 (a json,b int);
insert into t1 values ('{"a":1,"b":[{"c":2,"d":3},false,4],"e":{"f":true,"g":[null,true,1.1]}}',1);
insert into t1 values ('[1,true,false,null,"aaa",1.1,{"t":false}]',2);
> select * from t1;
+---------------------------------------------------------------------------------------+------+
| a                                                                                     | b    |
+---------------------------------------------------------------------------------------+------+
| {"a": 1, "b": [{"c": 2, "d": 3}, false, 4], "e": {"f": true, "g": [null, true, 1.1]}} |    1 |
| [1, true, false, null, "aaa", 1.1, {"t": false}]                                      |    2 |
+---------------------------------------------------------------------------------------+------+
2 rows in set (0.00 sec)

-- Expand the elements of array t1.a from table t1 and select the expanded elements to return as part of the result set. "$a" is a path expression specifying the array elements to select; true is a Boolean value indicating whether to return the path; use f.* to select all columns after expansion; f is an alias for the UNNEST function, representing expanded the result of.
mysql> select f.* from t1,unnest(t1.a, "$.a", true) as f;
+------+------+------+------+-------+-------+------+
| col  | seq  | key  | path | index | value | this |
+------+------+------+------+-------+-------+------+
| t1.a |    0 | NULL | $.a  |  NULL | NULL  | 1    |
| t1.a |    0 | NULL | $.a  |  NULL | NULL  | 1    |
+------+------+------+------+-------+-------+------+
2 rows in set (0.00 sec)
```
