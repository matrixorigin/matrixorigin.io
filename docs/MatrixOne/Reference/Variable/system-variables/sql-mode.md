# SQL Mode

`sql_mode` is a system parameter in MatrixOne, which specifies the mode in which MatrixOne executes queries and operations. `sql_mode` can affect the syntax and semantic rules of MatrixOne, thus altering the behavior of MatrixOne's SQL queries. This article will introduce the purpose of `sql_mode`, standard modes, and how to set `sql_mode`.

## Why set `sql_mode`

`sql_mode` can control the behavior of MatrixOne, including how to handle NULL values, perform insert operations, and sort and compare strings. It can ensure strict compliance with SQL standards and avoid non-standard behavior. In addition, `sql_mode` can help developers better identify errors and potential issues in SQL statements.

## Default modes of `sql_mode`

The following are the standard modes of `sql_mode`, which are also the default modes in MatrixOne:

- `ONLY_FULL_GROUP_BY`: The `GROUP BY` clause is used to group query results and perform aggregate calculations on each group, such as `COUNT`, `SUM`, `AVG`, etc. In the `GROUP BY` clause, the specified columns are the grouping columns. Other columns can be identified in the `SELECT` list, including aggregate or non-aggregate function columns. Without the `ONLY_FULL_GROUP_BY` mode, if a non-aggregate function column is set in the `SELECT` list, MatrixOne will select any value that matches the GROUP BY column use it to calculate the aggregate function by default.

   !!! note
       If your table structure is complex and for ease of querying, you can disable the `ONLY_FULL_GROUP_BY` mode.

- `STRICT_TRANS_TABLES`: When executing `INSERT` and `UPDATE` statements, an error will be reported if the data does not conform to the rules defined for the table.

- `NO_ZERO_IN_DATE`: Prohibits inserting zero values into fields of type `DATE` or `DATETIME`.

- `NO_ZERO_DATE`: Prohibits inserting or updating the field value of `0000-00-00` as a date or datetime type. The purpose of this mode is to avoid inserting invalid or illegal values into a date or datetime field and require the use of a valid date or datetime values. If such an operation is performed, an error will be reported. It should be noted that the `NO_ZERO_DATE` mode is only effective for insert or update operations. For existing `0000-00-00` values, they can still be queried and used.

- `ERROR_FOR_DIVISION_BY_ZERO`: This mode throws an error when dividing by zero.

- `NO_ENGINE_SUBSTITUTION`: This mode throws an error when executing ALTER TABLE or CREATE TABLE statements. The purpose of this mode is to force the use of the specified storage engine, preventing data inconsistencies or performance issues. The specified storage engine is unavailable or does not exist instead of automatically substituting it with another available storage engine. If automatic substitution of storage engines is desired, this mode can be removed from the sql_mode or set to other supported sql_mode methods. It is important to note that this mode only applies to ALTER TABLE or CREATE TABLE statements and does not affect the storage engine of existing tables.

## Optional modes for sql_mode

- `ANSI`: ANSI is a standard SQL language specification developed by `ANSI` (American National Standards Institute). In `ANSI` mode, SQL statements must comply with the `ANSI` SQL standard, which means that specific SQL language extensions or features specific to a particular database cannot be used.

- `ALLOW_INVALID_DATES`: `ALLOW_INVALID_DATES`, also known as "loose mode" in MatrixOne SQL mode, allows the insertion of invalid dates in standard date format, such as '0000-00-00' or '2000-00-00'. This mode exists to be compatible with some earlier versions of MySQL and non-standard date formats. It is important to note that inserting invalid dates in `ALLOW_INVALID_DATES` mode can cause unexpected behavior, as invalid dates will not be handled appropriately. Therefore, it is always recommended to use the standard date format.

- `ANSI_QUOTES`: `ANSI_QUOTES` is a strict mode in SQL mode, used to enforce SQL standards more strictly. In `ANSI_QUOTES` mode, MatrixOne treats double quotes as identifier quotes instead of string quotes. If you want to use double quotes to quote an identifier such as a table name or column name, you must use double quotes instead of single quotes. For example, the following SQL statement is correct in `ANSI_QUOTES` mode:

   ```sql
   SELECT "column_name" FROM "table_name";
   ```

   In the default SQL mode, double quotes will be interpreted as string quotes, resulting in incorrect syntax. Therefore, to use double quotes to quote identifiers, you must set MatrixOne to the `ANSI_QUOTES` mode.

   It should be noted that using the `ANSI_QUOTES` mode may cause SQL syntax incompatibility with other database systems because most other database systems use double quotes as string quotes rather than identifier quotes. Therefore, `ANSI_QUOTES` mode should be used cautiously when writing portable SQL statements.

- `HIGH_NOT_PRECEDENCE`: `HIGH_NOT_PRECEDENCE` is called the "high-priority `NOT` operator" mode in MatrixOne SQL mode. In `HIGH_NOT_PRECEDENCE` mode, MatrixOne treats the `NOT` operator as a high-priority operator, meaning its priority is higher than most other operators. This means that if you use both the `NOT` operator and other operators in an SQL statement, MatrixOne will first calculate the result of the `NOT` operator and then calculate the results of the other operators. For example:

   ```sql
   SELECT * FROM table WHERE NOT column = 1 AND column2 = 'value';
   ```

   In `HIGH_NOT_PRECEDENCE` mode, MatrixOne will first calculate the result of `NOT` column = 1, and then calculate the result of column2 = 'value'. If the `NOT` operator is not correctly placed in the statement, it may result in unexpected results.

   It should be noted that in MatrixOne's default SQL mode, the `NOT` operator has the same priority as other operators. If you need to use the `HIGH_NOT_PRECEDENCE` mode, make sure to use parentheses in your SQL statements to clarify the priority.

- `IGNORE_SPACE`: `IGNORE_SPACE` is referred to as the "ignore space" mode in MatrixOne SQL mode. In `IGNORE_SPACE` mode, MatrixOne ignores multiple spaces or tabs in an SQL statement and only considers one space or tab as a delimiter. This means that the following two SQL statements are equivalent in `IGNORE_SPACE` mode:

   ```sql
   SELECT * FROM my_table;
   SELECT*FROM my_table;
   ```

   The purpose of this mode is to make SQL statements more flexible and readable by allowing any number of spaces or tabs between keywords. However, it should be noted that in some cases, this mode may cause unexpected behavior, such as syntax errors when spaces or tabs are incorrectly placed in SQL functions or column names.

   By default, MatrixOne does not enable the `IGNORE_SPACE` mode. To enable this mode, you can use the SQL command `SET sql_mode='IGNORE_SPACE'` when connecting to MatrixOne.

- `NO_AUTO_VALUE_ON_ZERO`: `NO_AUTO_VALUE_ON_ZERO` is called the "no auto value on zero" mode in MatrixOne SQL mode. In `NO_AUTO_VALUE_ON_ZERO` mode, when you insert a value of 0 into an auto-increment column, MatrixOne does not treat it as an auto-increment value but as a regular 0 value. This means that if you insert a value of 0 into an auto-increment column, the value of that column will not be automatically incremented but will remain 0 in `NO_AUTO_VALUE_ON_ZERO` mode. For example, the following SQL statement will not auto-increment the id column in `NO_AUTO_VALUE_ON_ZERO` mode:

   ```sql
   CREATE TABLE my_table (
     id INT(11) NOT NULL AUTO_INCREMENT,
     name VARCHAR(255) NOT NULL,
     PRIMARY KEY (id)
   );

   INSERT INTO my_table (id, name) VALUES (0, 'John');
   ```

   In the default SQL mode, when you insert a value of 0 into an auto-increment column, MatrixOne treats it as an auto-increment value and automatically increases it to the next available one. However, this may not be the desired behavior in some cases, so you can use the `NO_AUTO_VALUE_ON_ZERO` mode to disable it.

   If you use the `NO_AUTO_VALUE_ON_ZERO` mode, inserting data with a value of 0 may cause primary key duplicates or unique vital conflicts. So, extra attention is needed when you insert data.

- `NO_BACKSLASH_ESCAPES`: `NO_BACKSLASH_ESCAPES` is also known as "no backslash escapes" mode in MatrixOne SQL mode. In `NO_BACKSLASH_ESCAPES` mode, MatrixOne does not treat the backslash as an escape character. This means that you cannot use the backslash to escape special characters, such as quotes or percent signs, in SQL statements. Instead, if you need to use these special characters in SQL statements, you must use other methods to escape them, such as using single quotes to represent double quotes in strings. For example, the following SQL statement will cause a syntax error in `NO_BACKSLASH_ESCAPES` mode:

   ```sql
   SELECT 'It's a nice day' FROM my_table;
   ```

   In the default SQL mode, MatrixOne allows backslashes to escape special characters, so backslashes can be used in SQL statements to run characters such as quotes and percent signs. However, in some cases, using backslash escapes may result in confusion or incorrect results, so the `NO_BACKSLASH_ESCAPES` mode can be used to prohibit this behavior.

   If you use the `NO_BACKSLASH_ESCAPES` mode, you must use other ways to escape special characters, which may make SQL statements more complex and difficult to understand. Therefore, it's necessary to consider when using this mode carefully.

- `NO_DIR_IN_CREATE`: known as "no directory in create" mode in MatrixOne SQL mode, prohibits directory paths in CREATE TABLE statements. In the `NO_DIR_IN_CREATE` mode, MatrixOne will report an error when a directory path is used in the column definition of a `CREATE TABLE` statement, which includes a way that contains a file name. For example:

   ```sql
   CREATE TABLE my_table (
     id INT(11) NOT NULL AUTO_INCREMENT,
     name VARCHAR(255) NOT NULL,
     datafile '/var/lib/MatrixOne/my_table_data.dat',
     PRIMARY KEY (id)
   );
   ```

   In the SQL statement above, the datafile column defines a path containing a file name, specifying the file storing table data. In the `NO_DIR_IN_CREATE` mode, MatrixOne does not allow the use of such directory paths in `CREATE TABLE` statements and requires that the file path and file name be defined separately, for example:

   ```sql
   CREATE TABLE my_table (
     id INT(11) NOT NULL AUTO_INCREMENT,
     name VARCHAR(255) NOT NULL,
     datafile VARCHAR(255) NOT NULL,
     PRIMARY KEY (id)
   ) DATA DIRECTORY '/var/lib/MatrixOne/' INDEX DIRECTORY '/var/lib/MatrixOne/';
   ```

   The data file column in the SQL statement above only defines the file name. In contrast, the file path is defined separately in the `DATA DIRECTORY` and `INDEX DIRECTORY` clauses of the CREATE TABLE statement.

   It should be noted that the `NO_DIR_IN_CREATE` mode does not affect column definitions in already created tables but only affects column definitions in `CREATE TABLE` statements. Therefore, when using this mode, you'll need careful consideration to ensure your SQL statements meet its requirements.

- `NO_UNSIGNED_SUBTRACTION`: `NO_UNSIGNED_SUBTRACTION` is also also known as "no unsigned subtraction" mode in MatrixOne SQL mode, treats the result of the subtraction of unsigned integers with the subtraction operator (-) as a signed integer instead of an unsigned integer. This means that if the value of the unsigned integer is smaller than the subtrahend, the result will be a negative number instead of an unsigned integer. For example:

   ```sql
   SET SQL_MODE = 'NO_UNSIGNED_SUBTRACTION';
   SELECT CAST(1 AS UNSIGNED) - CAST(2 AS UNSIGNED);
   ```

   In the SQL statement above, the `NO_UNSIGNED_SUBTRACTION` mode treats `CAST(1 AS UNSIGNED) - CAST(2 AS UNSIGNED)` as a signed integer operation, so the result is -1 instead of the result of an unsigned integer operation, which is 4294967295.

   It should be noted that the `NO_UNSIGNED_SUBTRACTION` mode only affects unsigned integers that are subtracted using the subtraction operator (-), and other operations that use unsigned integers are not affected. If you need to perform many unsigned integer operations in MatrixOne, using appropriate type conversions in your code is recommended to avoid potential errors.

- `PAD_CHAR_TO_FULL_LENGTH`: `PAD_CHAR_TO_FULL_LENGTH` is called the "pad CHAR to full length" mode in MatrixOne SQL mode.

   In the `PAD_CHAR_TO_FULL_LENGTH` mode, when you define a column of `CHAR` type, MatrixOne pads the column's value with spaces to make its length equal to the length specified for the column. This is because in MatrixOne, a column of `CHAR` type always occupies the defined length when stored, and any shortfall is filled with spaces. However, by default, the character set used by MatrixOne may be a multi-byte character set, so if spaces are used for padding, it may lead to incorrect length calculation.

   In the `PAD_CHAR_TO_FULL_LENGTH` mode, MatrixOne uses the maximum character length of the character set to pad the column of `CHAR` type to ensure that the length it occupies matches the defined size. This can avoid the problem of length calculation errors when using multi-byte character sets, but it also increases the use of storage space.

   It should be noted that the `PAD_CHAR_TO_FULL_LENGTH` mode only affects columns of `CHAR` type and does not affect columns of other varieties. If you need to use `CHAR` type columns in MatrixOne and correctly calculate the length of column values in a multi-byte character set, you can consider using the PAD_CHAR_TO_FULL_LENGTH mode.

- `PIPES_AS_CONCAT`: `PIPES_AS_CONCAT` is called the "pipes as concatenation" mode in MatrixOne SQL mode. In the `PIPES_AS_CONCAT` mode, MatrixOne treats the vertical bar symbol (|) as a string concatenation rather than a bitwise operator. If you use the standing bar symbol to concatenate two strings, MatrixOne will treat them as one string instead of interpreting them as a binary bit operation.

   For example, the following SQL statement will return an error in the default mode because MatrixOne treats the vertical bar symbol as a bitwise operator:

   ```sql
   SELECT 'abc' | 'def';
   ```

   However, if the SQL mode is set to `PIPES_AS_CONCAT`, the above SQL statement will return the string 'abcdef'.

   Note that if your SQL statement contains the vertical bar symbol and it should be treated as a bitwise operator, do not use the PIPES_AS_CONCAT mode. Conversely, if you need to treat the vertical bar symbol as a string concatenation operator, use the `PIPES_AS_CONCAT` mode.

- `REAL_AS_FLOAT`: `REAL_AS_FLOAT` is known as "treat REAL type as FLOAT type" mode in MatrixOne SQL mode.
   In `REAL_AS_FLOAT` mode, MatrixOne treats data of the `REAL` type as data of the `FLOAT` type. This means that MatrixOne uses the storage format of the `FLOAT` type to store data of the `REAL` type, rather than the more precise but also more space-consuming `DOUBLE` type storage format.

   Note that since the storage format of `FLOAT` type data occupies less space than DOUBLE type data, treating data of the `REAL` type as data of the `FLOAT` type can save storage space in some cases. However, doing so will also reduce the precision of the data, as `FLOAT` type data can only provide about 7 significant digits of precision, while `DOUBLE` type data can provide about 15 significant digits of precision.

   If you need to store high-precision floating-point data in MatrixOne, it is recommended not to use the `REAL_AS_FLOAT` mode and use DOUBLE type data to store it. If you do not require high data precision, you may consider using the `REAL_AS_FLOAT` mode to save storage space.

- `STRICT_ALL_TABLES`: `STRICT_ALL_TABLES` is known as "enable strict mode" mode in MatrixOne SQL mode. In `STRICT_ALL_TABLES` mode, MatrixOne enables a series of strict checks to ensure that insert, update, and delete operations comply with constraints such as data types, NULL values, and foreign keys. Specifically, `STRICT_ALL_TABLES` mode performs the following operations:

   a. Rejects illegal values from being inserted into any column.
   b. Rejects NULL values from being inserted into non-NULL columns.
   c. Rejects values outside the allowed range from being inserted into any column.
   d. Rejects strings from being inserted into numeric type columns.
   e. Rejects date or time strings from being inserted into non-date or time type columns.
   f. Rejects values that exceed the length defined for CHAR, VARCHAR, and TEXT type columns from being inserted.
   g. Rejects values with mismatched data types from being inserted into foreign key columns.

   Note that enabling strict mode may cause problems for some old applications as they may assume that MatrixOne does not perform mandatory constraint checks. If you encounter problems when updating or migrating applications, consider disabling strict mode or modifying the application to comply with strict mode requirements.

- `TIME_TRUNCATE_FRACTIONAL`: `TIME_TRUNCATE_FRACTIONAL` is known as "truncate fractional part of time" mode in MatrixOne SQL mode. In `TIME_TRUNCATE_FRACTIONAL` mode, MatrixOne truncates the fractional part of data of the `TIME`, `DATETIME`, and `TIMESTAMP` types, retaining only the integer part. This means that if you insert time data with a fractional part into a column of the `TIME`,` DATETIME`, or `TIMESTAMP` type, MatrixOne will truncate the fractional part and set it to 0.

   Note that enabling the `TIME_TRUNCATE_FRACTIONAL` mode may cause some loss of data precision, as truncating the fractional part may lose some critical time information. If you need to store and manipulate accurate time data, it is recommended not to use the `TIME_TRUNCATE_FRACTIONAL` mode.

- `TRADITIONAL`: `TRADITIONAL` is a type of schema in the MatrixOne SQL mode, also known as the "traditional" mode. In `TRADITIONAL` mode, MatrixOne enables a series of strict checks to ensure that insert, update, and delete operations conform to SQL standard constraints. Specifically, the `TRADITIONA`L mode performs the following operations:

   a. Enables `STRICT_TRANS_TABLES` and `STRICT_ALL_TABLES` modes.
   b. Rejects `INSERT` statements that omit column names to ensure all columns are explicitly assigned values.
   c. Rejects inserting values with unclear data types into foreign key columns.
   d. Rejects inserting strings into numeric columns.
   e. Rejects inserting date or time strings into non-date or time-type columns.
   f. Rejects inserting values that exceed the defined length of `CHAR`, `VARCHAR`, and `TEXT` columns.
   g. Rejects using non-aggregate columns in the `GROUP BY` clause.
   h. Rejects using non-listed non-aggregate columns in the `SELECT` statement.
   i. It should be noted that enabling traditional mode may cause issues with some older applications that assume MatrixOne will not perform mandatory constraint checks. If you encounter problems when updating or migrating applications, consider the traditional disabling mode or modifying the applications to comply with traditional mode requirements.

## How to set sql_mode

The sql_mode can be set using the `SET` statement, for example:

```sql
SET sql_mode='STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,ONLY_FULL_GROUP_BY';
```

The sql_mode can also be set in the configuration file of MatrixOne, for example:

```sql
sql_mode=STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,ONLY_FULL_GROUP_BY
```

In the example settings above, MatrixOne will use the `STRICT_TRANS_TABLES`, `NO_ZERO_IN_DATE`, and `ONLY_FULL_GROUP_BY` modes.

## Constraints

To maintain compatibility with MySQL, MatrixOne currently only implements syntax support for all modes of sql_mode.
