# JSON Functions

MatrixOne supports the following JSON functions:

|Name|Description|
|---|---|
|JSON_EXTREACT()|Return data from JSON document|
|JSON_QUOTE()	|	Quote JSON document|
|JSON_UNQUOTE()	|Unquote JSON value|

## `JSON_EXTREACT()`

A JSON path expression selects a value within a JSON document.

Path expressions are useful with functions that extract parts of or modify a JSON document, to specify where within that document to operate. For example, the following query extracts from a JSON document the value of the member with the name key:

```sql
mysql> SELECT JSON_EXTRACT('{"id": 14, "name": "Aztalan"}', '$.name');
+---------------------------------------------------------+
| JSON_EXTRACT('{"id": 14, "name": "Aztalan"}', '$.name') |
+---------------------------------------------------------+
| "Aztalan"                                               |
+---------------------------------------------------------+
```

Path syntax uses a leading $ character to represent the JSON document under consideration, optionally followed by selectors that indicate successively more specific parts of the document:

- A period followed by a key name names the member in an object with the given key. The key name must be specified within double quotation marks if the name without quotes is not legal within path expressions (for example, if it contains a space).

- [N] appended to a *path* that selects an array names the value at position `N` within the array. Array positions are integers beginning with zero. If the array is negative, an error is generated.

- Paths can contain * or ** wildcards:

   + .[*] evaluates to the values of all members in a JSON object.

   + [*] evaluates to the values of all elements in a JSON array.

   + prefix**suffix evaluates to all paths that begin with the named prefix and end with the named suffix.

- A path that does not exist in the document (evaluates to nonexistent data) evaluates to NULL.

**Example**:

```
[3, {"a": [5, 6], "b": 10}, [99, 100]]
```

- $[0] evaluates to 3.

- $[1] evaluates to {"a": [5, 6], "b": 10}.

- $[2] evaluates to [99, 100].

- $[3] evaluates to NULL (it refers to the fourth array element, which does not exist).

Because $[1] and $[2] evaluate to nonscalar values, they can be used as the basis for more-specific path expressions that select nested values. Examples:

- $[1].a evaluates to [5, 6].

- $[1].a[1] evaluates to 6.

- $[1].b evaluates to 10.

- $[2][0] evaluates to 99.

As mentioned previously, path components that name keys must be quoted if the unquoted key name is not legal in path expressions. Let $ refer to this value:

```
{"a fish": "shark", "a bird": "sparrow"}
```

The keys both contain a space and must be quoted:

- $."a fish" evaluates to shark.

- $."a bird" evaluates to sparrow.

Paths that use wildcards evaluate to an array that can contain multiple values:

```sql
mysql> SELECT JSON_EXTRACT('{"a": 1, "b": 2, "c": [3, 4, 5]}', '$.*');
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
```

In the following example, the path $**.b evaluates to multiple paths ($.a.b and $.c.b) and produces an array of the matching path values:

```sql
mysql> SELECT JSON_EXTRACT('{"a": {"b": 1}, "c": {"b": 2}}', '$**.b');
+---------------------------------------------------------+
| JSON_EXTRACT('{"a": {"b": 1}, "c": {"b": 2}}', '$**.b') |
+---------------------------------------------------------+
| [null, 1, 2]                                                  |
+---------------------------------------------------------+
```

In the following example, showes the querying JSON values from columns:

```sql
CREATE table t1 (a json,b int);
INSERT into t1(a,b) values ('{"a":1,"b":2,"c":3}',1);

mysql> SELECT json_extract(t1.a,'$.a') from t1 where t1.b=1;
+-------------------------+
| json_extract(t1.a, $.a) |
+-------------------------+
| 1                       |
+-------------------------+
1 row in set (0.00 sec)

INSERT into t1(a,b) values ('{"a":4,"b":5,"c":6}',2);

mysql> SELECT json_extract(t1.a,'$.b') from t1 where t1.b=2;
+-------------------------+
| json_extract(t1.a, $.b) |
+-------------------------+
| 5                       |
+-------------------------+
1 row in set (0.00 sec)

mysql> SELECT json_extract(t1.a,'$.a') from t1;
+-------------------------+
| json_extract(t1.a, $.a) |
+-------------------------+
| 1                       |
| 4                       |
+-------------------------+
2 rows in set (0.00 sec)

INSERT into t1(a,b) values ('{"a":{"q":[1,2,3]}}',3);

mysql> SELECT json_extract(t1.a,'$.a.q[1]') from t1 where t1.b=3;
+------------------------------+
| json_extract(t1.a, $.a.q[1]) |
+------------------------------+
| 2                            |
+------------------------------+
1 row in set (0.01 sec)

INSERT into t1(a,b) values ('[{"a":1,"b":2,"c":3},{"a":4,"b":5,"c":6}]',4);

mysql> SELECT json_extract(t1.a,'$[1].a') from t1 where t1.b=4;
+----------------------------+
| json_extract(t1.a, $[1].a) |
+----------------------------+
| 4                          |
+----------------------------+
1 row in set (0.00 sec)
```

## `JSON_QUOTE()`

The `JSON_QUOTE` function converts a string value into a string in `JSON` format. It wraps the string with double quotes, escapes inner quotes and other characters, quotes the string as a `JSON` value, and then returns the result as a utf8mb4 string. If the parameter is `NULL`, it returns `NULL`.

The `JSON_QUOTE` function is commonly used to generate valid `JSON` strings to include in JSON documents.

The syntax structure is: `select JSON_QUOTE(string_value);`

string_value is the string to be converted to a `JSON` string. The function returns a string in `JSON` format, where the original string is surrounded by quotes and properly escaped.

**Example**:

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

As we can see, the original string is surrounded by quotes, and the double quotes within the string are escaped. This allows it to be used in JSON format, such as as a property value in a JSON object.

## `JSON_UNQUOTE()`

The `JSON_UNQUOTE()` function extracts an unquoted `JSON` value from a `JSON` string and returns it as a string.

Specifically, the `JSON_UNQUOTE()` function takes a `JSON` string as input, extracts a `JSON` value from it, and returns it as a string. If the input `JSON` string does not contain a valid `JSON` value or the parameter is `NULL`, the function returns `NULL`. An error occurs if the value begins and ends with double quotes but is not a valid `JSON` string literal.

The syntax structure: `select JSON_UNQUOTE(string_value);`

In the string, specific sequences have special meanings and start with a backslash (), known as escape characters, with the following rules. For example, \b is interpreted as backspace, while \B is interpreted as B. For all other escape sequences, the backslash is ignored. That is, the escape character is interpreted as unescaped. For example, \x is just x. These sequences are case-sensitive.

|Escape Sequence|Character Represented by Sequence|
|---|---|
|\"|A double quote (") character|
|\b|A backspace character|
|\f|A formfeed character|
|\n|A newline (linefeed) character|
|\r|A carriage return character|
|\t|A tab character|
|\\|A backslash (\) character|
|\uXXXX|UTF-8 bytes for Unicode value XXXX|

**Example**:

```sql
mysql> SET @j = '"abc"';
Query OK, 0 rows affected (0.00 sec)

mysql> SELECT @j, JSON_UNQUOTE(@j);
+-------+------------------+
| @j    | json_unquote(@j) |
+-------+------------------+
| "abc" | abc              |
+-------+------------------+
1 row in set (0.00 sec)

mysql> SET @j = '[1, 2, 3]';
Query OK, 0 rows affected (0.00 sec)

mysql> SELECT @j, JSON_UNQUOTE(@j);
+-----------+------------------+
| @j        | json_unquote(@j) |
+-----------+------------------+
| [1, 2, 3] | [1, 2, 3]        |
+-----------+------------------+
1 row in set (0.00 sec)

mysql> SELECT JSON_UNQUOTE('"\\t\\u0032"');
+----------------------------+
| json_unquote("\\t\\u0032") |
+----------------------------+
|       2                         |
+----------------------------+
1 row in set (0.00 sec)
```
