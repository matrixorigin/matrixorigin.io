# **TRY_JQ()**

## **Function description**

The `TRY_JQ()` function is used to parse and transform JSON data based on jq expressions. Different from [`JQ()`](./jq.md), `TRY_JQ()` supports returning null value when an error occurs, while `JQ()` directly throws an exception when encountering an error.

## **Grammar structure**

```sql
select try_jq(jsonDoc, pathExpression);
```

## **Parameter explanation**

| Parameters | Description |
| ----| ----|
| jsonDoc | This is a column or expression containing JSON data. |
| pathExpression | Used to specify how to extract fields from JSON data |

## **Example**

```sql
mysql> select try_jq('{"foo": 128}', '.foo');
+----------------------------+
| try_jq({"foo": 128}, .foo) |
+----------------------------+
| 128                        |
+----------------------------+
1 row in set (0.00 sec)

mysql> select try_jq(null, '.foo');
+--------------------+
| try_jq(null, .foo) |
+--------------------+
| NULL               |
+--------------------+
1 row in set (0.00 sec)

mysql> select try_jq('{"id": "sample", "10": {"b": 42}}', '{(.id): .["10"].b}');
+---------------------------------------------------------------+
| try_jq({"id": "sample", "10": {"b": 42}}, {(.id): .["10"].b}) |
+---------------------------------------------------------------+
| {"sample":42}                                                 |
+---------------------------------------------------------------+
1 row in set (0.00 sec)

mysql> select try_jq('[1, 2, 3]', '.foo & .bar');
+--------------------------------+
| try_jq([1, 2, 3], .foo & .bar) |
+--------------------------------+
| NULL                           |
+--------------------------------+
1 row in set (0.00 sec)
```