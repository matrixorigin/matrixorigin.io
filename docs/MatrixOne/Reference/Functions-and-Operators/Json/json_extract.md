# **JSON_EXTRACT()**

## **Function description**

`JSON EXTRACT()` is a JSON query function that can be used to query JSON documents.

-If used as a column after select, it is recommended to use the functions [JSON_EXTRACT_STRING()](./json_extract_string.md) and [JSON_EXTRACT_FLOAT64()](./json_extract_float64.md);
  
-If comparing in a where condition:
    -If the type is json object comparison, use `JSON EXTRACT()`
    -If the type is a string type, use [JSON_EXTRACT_STRING()](./json_extract_string.md);
    -If the type is float or int, use [JSON_EXTRACT_FLOAT64()](./json_extract_float64.md).

## **Grammar structure**

```sql
select json_extract(jsonDoc, pathExpression);
```

## **Parameter explanation**

| Parameters | Description |
| ----| ----|
| jsonDoc | This is an expression containing JSON data. |
| pathExpression | Represents the path to access a value in the JSON document. The path starts with `$`, which represents the root of the JSON document, and can be followed by a period `.` and a key name or square brackets [ ] to access the elements of the array. |

Path expressions must start with the `$` character:

- `.` followed by a key name names the member in the object using the given key. Key names need to be enclosed in quotes.

- `[N]`: After selecting the *path*of the array, name the value at position `N` in the array. Array positions are zero-based integers. If the array is negative, an error is reported.

- The path can contain the `*` or `**` wildcard characters:

    + `.[*]` Computes the values ​​of all members in a JSON object.

    + `[*]` Computes the values ​​of all elements in a JSON array.

    + `prefix**suffix`: Count all paths starting with a named prefix and ending with a named suffix.

- Paths that do not exist in the document (or data that does not exist) evaluate to `NULL`.

The following set of JSON arrays:

```
[3, {"a": [5, 6], "b": 10}, [99, 100]]
```

- `$[0]` means 3.

- `$[1]` means {"a": [5, 6], "b": 10}.

- `$[2]` means [99, 100].

- `$[3]` is NULL (the array path starts from `$[0]`, and `$[3]` represents the fourth group of data, which does not exist).

Since `$[1]` and `$[2]` evaluate to non-scalar values, expressions can be nested. For example:

- `$[1].a` means [5, 6].

- `$[1].a[1]` means 6.

- `$[1].b` means 10.

- `$[2][0]` means 99.

Key names require double quotes in path expressions. `$` quotes this key value and also requires double quotes:

```
{"a fish": "shark", "a bird": "sparrow"}
```

Both keys contain a space and must be enclosed in quotes:

- `$."a fish"` means `shark`.

- `$."a bird"` means `sparrow`.

## **Example**

```sql
mysql> select JSON_EXTRACT('{"a": 1, "b": 2, "c": [3, 4, 5]}', '$.*');
+---------------------------------------------------------+
| JSON_EXTRACT('{"a": 1, "b": 2, "c": [3, 4, 5]}', '$.*') |
+---------------------------------------------------------+
| [1, 2, [3, 4, 5]]                                       |
+---------------------------------------------------------+

mysql> SELECT JSON_EXTRACT('{"a": 1, "b": 2, "c": [3, 4, 5]}', '$.c[*]');
+------------------------------------------------------------+
| JSON_EXTRACT('{"a": 1, "b": 2, "c": [3, 4, 5]}', '$.c[*]') |
+------------------------------------------------------------+
| [3, 4, 5]                                                  |
+------------------------------------------------------------+

mysql> select json_extract('{"a":{"q":[1,2,3]}}','$.a.q[1]');
+---------------------------------------------+
| json_extract({"a":{"q":[1,2,3]}}, $.a.q[1]) |
+---------------------------------------------+
| 2                                           |
+---------------------------------------------+
1 row in set (0.00 sec)

mysql> select JSON_EXTRACT('{"a": {"b": 1}, "c": {"b": 2}}', '$**.b');
+---------------------------------------------------------+
| JSON_EXTRACT('{"a": {"b": 1}, "c": {"b": 2}}', '$**.b') |
+---------------------------------------------------------+
| [null, 1, 2]                                                  |
+---------------------------------------------------------+

#In the following example, querying JSON values ​​from a column will be shown:
create table t1 (a json,b int);
insert into t1(a,b) values ('{"a":1,"b":2,"c":3}',1);

mysql> select json_extract(t1.a,'$.a') from t1 where t1.b=1;
+-------------------------+
| json_extract(t1.a, $.a) |
+-------------------------+
| 1                       |
+-------------------------+
1 row in set (0.00 sec)

insert into t1(a,b) values ('{"a":4,"b":5,"c":6}',2);

mysql> select json_extract(t1.a,'$.b') from t1 where t1.b=2;
+-------------------------+
| json_extract(t1.a, $.b) |
+-------------------------+
| 5                       |
+-------------------------+
1 row in set (0.00 sec)

mysql> select json_extract(t1.a,'$.a') from t1;
+-------------------------+
| json_extract(t1.a, $.a) |
+-------------------------+
| 1                       |
| 4                       |
+-------------------------+
2 rows in set (0.00 sec)

insert into t1(a,b) values ('{"a":{"q":[1,2,3]}}',3);

mysql> select json_extract(t1.a,'$.a.q[1]') from t1 where t1.b=3;
+------------------------------+
| json_extract(t1.a, $.a.q[1]) |
+------------------------------+
| 2                            |
+------------------------------+
1 row in set (0.01 sec)

insert into t1(a,b) values ('[{"a":1,"b":2,"c":3},{"a":4,"b":5,"c":6}]',4);

mysql> select json_extract(t1.a,'$[1].a') from t1 where t1.b=4;
+----------------------------+
| json_extract(t1.a, $[1].a) |
+----------------------------+
| 4                          |
+----------------------------+
1 row in set (0.00 sec)
```