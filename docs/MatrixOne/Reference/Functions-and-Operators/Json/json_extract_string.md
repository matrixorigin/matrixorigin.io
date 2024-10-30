# **JSON_EXTRACT_FLOAT64()**

## **Function description**

`JSON_EXTRACT_FLOAT64()` is used to extract the numeric value of the specified path from JSON data.
  
If comparing in where condition:

- If the type is json object comparison, use [JSON EXTRACT()](./json_extract.md);
- If the type is a string type, use [JSON_EXTRACT_STRING()](./json_extract_string.md);
- If type is float or int, use `JSON_EXTRACT_FLOAT64()`.

## **Grammar structure**

```sql
select col_name from tab_name where json_extract_float64(jsonDoc, pathExpression)= number;
```

## **Parameter explanation**

| Parameters | Description |
| ----| ----|
| jsonDoc | This is a column or expression containing JSON data. |
| pathExpression | Represents the path to access a value in the JSON document. Only one path can be received at a time. The path starts with `$`, indicating the root of the JSON document, and can be followed by a period `.` and a key name or square brackets [ ] to access the elements of the array. |
| number | Specifies the value to be extracted from the JSON data, which is a numeric type. |

Path expressions must start with the `$` character:

- `,` followed by a key name names the member in the object using the given key. Key names need to be enclosed in double quotes.

- `[N]`: After selecting the *path*of the array, name the value at position `N` in the array. Array positions are zero-based integers. If the array is negative, an error is reported.

- The path can contain the `*` or `**` wildcard characters:

    + `.[*]` Computes the values ​​of all members in a JSON object.

    + `[*]` Computes the values ​​of all elements in a JSON array.

    + `prefix**suffix`: Count all paths starting with a named prefix and ending with a named suffix.

- Paths that do not exist in the document (or data that does not exist) evaluate to `NULL`.

## **Example**

```sql
create table student(n1 int,n2 json);
insert into student values
    (1,'{"name": "tom", "age": 18, "score": 90,"gender": "male"}'),
    (2,'{"name": "bob", "age": 20, "score": 80,"gender": "male"}'),
    (3,'{"name": "jane", "age": 17, "score": 95,"gender": "female"}'),
    (4,'{"name": "lily", "age": 19, "score": 79,"gender": "female"}');

mysql> select n1 from student where  json_extract_float64(n2,'$.age')=19;  
+------+
| n1   |
+------+
|    4 |
+------+
1 row in set (0.00 sec)

mysql> select json_extract_float64(n2,'$.age')=19 from student;  
+--------------------------------------+
| json_extract_float64(n2, $.age) = 19 |
+--------------------------------------+
| false                                |
| false                                |
| false                                |
| true                                 |
+--------------------------------------+
4 rows in set (0.00 sec)
```