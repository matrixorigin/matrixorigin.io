# Regular Expressions Overview

Regular expressions provide a powerful method for matching text patterns. You can use simple wildcards (such as %, _) in LIKE statements, but regular expressions offer more flexibility and matching options.

## Scenarios

Regular expressions can perform complex string matching and manipulation. Here are some common use cases:

- **Data Validation**: Regular expressions can validate whether data complies with a specific format, such as checking whether a field contains a valid email address, phone number, or social security number. For example, you can use a regular expression to find all email addresses that do not conform to the standard format:

    ```sql
    SELECT email
    FROM users
    WHERE email NOT REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$';
    ```

- **Data Filtering**: Regular expressions can be used to search for data that contains or does not contain specific patterns. For example, if you want to find all phone numbers that start with a specific prefix, you can use a regular expression to match these numbers:

    ```sql
    SELECT phone_number
    FROM users
    WHERE phone_number REGEXP '^180';
    ```

- **Data Cleaning**: Regular expressions are also instrumental in data cleaning. For example, you may need to clear special characters and spaces or extract numbers from strings; regular expressions can quickly implement these functions:

    ```sql
    SELECT REGEXP_REPLACE(name, '[^a-zA-Z]', '')
    FROM users;
    ```

    This SQL will return the result of all non-alphabetical characters in the name field being replaced.

- **Text Analysis**: If you are conducting text analysis, regular expressions can help you find specific words or phrases in the text and can even be used for certain forms of natural language processing.

## Special Characters

Regular expressions use POSIX (Portable Operating System Interface) extended regular expressions. Here are some special characters to note:

|Character|Explanation|
|---|---|
| `.`  |  Matches any single character (except a newline) |
| `*`  | Indicates the preceding element can be repeated any number of times (including zero times)  |
| `+`  |  Indicates the preceding element can be repeated one or more times. |
|  `?` |  Indicates the primary element can be repeated zero or once. |  
| `{n}`  |  Indicates the primary element can be repeated n times. |
| `{n,}`  |  Indicates the primary element can be repeated n times or more. |
| `{n,m}`  | Indicates the primary element can be repeated from n to m times.  |
| `^`  | Indicates matching the beginning of the string.  |
| `$`  | Indicates matching the end of the string.  |
| `[abc]`  | Indicates matching a, b, or c.  |
| `[^abc]`  | Indicates matching any character that is not a, b, or c.  |
| `(abc|def)`  | Indicates matching abc or def.  |
| `\d`  |  Indicates matching numbers |
| `\s`  | Indicates matching whitespace characters  |
| `\w` |  Indicates matching word characters |
|`\D`, `\S` and `\W` |Indicate matching opposite character sets|

!!! note
    In regular expressions, these special characters need to be escaped using `\`; for example, `\\.` indicates matching an actual `.` character, not any character.

MatrixOne's regular expressions are case-sensitive by default. If you want to perform case-insensitive matching, you can use syntax like `REGEXP_LIKE(column, pattern, 'i')`. Where `i` indicates case insensitivity.

## Reference

**List of Regular Expression Functions**

|Name	|Definition|
|---|---|
|[NOT REGEXP](not-regexp.md)| Negation of REGEXP|
|[REGEXP_INSTR()](regexp-instr.md) |Starting index of substring matching regular expression|
|[REGEXP_LIKE()](regexp-like.md)|Whether string matches regular expression|
|[REGEXP_REPLACE()](regexp-replace.md)|Replace substring matching regular expression|
|[REGEXP_SUBSTR()](regexp-substr.md)|Return substring matching regular expression|
