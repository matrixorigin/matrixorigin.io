# **JSON_QUOTE()**

## **Function description**

The `JSON_QUOTE` function is used to convert a string value to a string in JSON format. Quote the string as a JSON value by wrapping the string in double quotes and escaping inner quotes and other characters, then returning the result as a `utf8mb4` string. If the argument is NULL, NULL is returned.

The `JSON_QUOTE` function is typically used to generate a valid JSON string for inclusion in a JSON document.

## **Grammar structure**

```
select JSON_QUOTE(string_value);
```

## **Parameter description**

`string_value` is the string to be converted to a JSON string. This function returns a JSON-formatted string, where the original string has been surrounded by quotes and escaped appropriately.

## **Example**

```sql
mysql> SELECT JSON_QUOTE('null'), JSON_QUOTE('"null"');
+------------------+--------------------+
| json_quote(null) | json_quote("null") |
+------------------+--------------------+
| "null"           | "\"null\""         |
+------------------+--------------------+
1 row in set (0.00 sec)
mysql> SELECT JSON_QUOTE('[1, 2, 3]');
+-----------------------+
| json_quote([1, 2, 3]) |
+-----------------------+
| "[1, 2, 3]"           |
+-----------------------+
1 row in set (0.00 sec)

mysql> SELECT JSON_QUOTE('hello world');
+-------------------------+
| json_quote(hello world) |
+-------------------------+
| "hello world"           |
+-------------------------+
1 row in set (0.00 sec)
```

As you can see, the original string is surrounded by quotes and the double quotes in the string are escaped. This way, you can use it as a JSON-formatted value, for example, as a property value of a JSON object.