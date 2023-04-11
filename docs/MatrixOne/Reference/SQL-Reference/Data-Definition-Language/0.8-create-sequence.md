# **CREATE SEQUENCE**

## **Description**

The `CREATE SEQUENCE` user creates a sequence object. A sequence is a unique database object that can automatically generate a unique sequence of numbers. Typically, sequences are used to automatically generate unique values for a table's primary key fields.

`CREATE SEQUENCE` is a command that creates an auto-increment number sequence to generate unique, continuous numeric values, usually used to create values for primary key columns or other columns requiring auto-increment numbers.

## **Syntax**

```
> CREATE SEQUENCE [ IF NOT EXISTS ] SEQUENCE_NAME
    [ AS data_type ]
    [ INCREMENT [ BY ] increment ]
    [ MINVALUE minvalue] [ MAXVALUE maxvalue]
    [ START [ WITH ] start ] [ [ NO ] CYCLE ]
```

## **Explanations**

#### data_type

The optional clause `AS data_type` specifies the data type of the sequence. Supported data types include `smallint [unsigned]`, `integer [unsigned]`, and `bigint [unsigned]`, with `bigint` being the default. The data type determines the default minimum and maximum values for the sequence.

#### INCREMENT

The optional clause `INCREMENT [BY] increment` specifies the value to add to the current sequence value to create a new value. Positive values generate ascending sequences, and negative values generate descending sequences; the default value is 1.

#### MINVALUE

The optional clause `MINVALUE minvalue` determines the minimum value that the sequence can generate. If this clause is not provided or `MINVALUE` is not specified, a default value will be used. The default value for an ascending sequence is `1`, and for a descending sequence it is the minimum value for the data type.

#### MAXVALUE

The optional clause `MAXVALUE maxvalue` determines the maximum value for the sequence. If this clause is not provided or `MAXVALUE` is not specified, a default value will be used. The default value for an ascending sequence is the maximum value for the data type, and for a descending sequence it is `-1`.

#### START

The optional clause `START [WITH] start` allows the sequence to start from any point. The default starting value is the minimum value for an ascending sequence and the maximum value for a descending sequence.

#### CYCLE

The `CYCLE` option allows the sequence to wrap around when it reaches the maximum or minimum value for an ascending or descending sequence, respectively. If the limit is reached, the next generated number will be the minimum or maximum value, respectively.

### Operations

The following functions are used to manipulate sequence values:

#### `NEXTVAL(sequence_name)`

Sets the current value to the next value in the sequence and returns it.

#### `CURRVAL(sequence_name)`

Returns the current value in the sequence.

#### `SETVAL(sequence_name, n [,b])`

Sets the current value in the sequence to n.

- If b is set to true, the next call to `NEXTVAL` will return `n`.
- If b is set to false, the next call to `NEXTVAL` will return `n+increment`.

#### `LASTVAL()`

Return the value of any sequence obtained by `NEXTVAL` in the current session; if the current value is set by `SETVAL` first, and then use `LASTVAL` to operate on the sequence, return `SETVAL` The current value of the setting. Since 'LASTVAL()' returns a 'NEXTVAL' value, 'LASTVAL()' can only be initialized by 'NEXTVAL'.

`LASTVAL()` is affected by `SETVAL(sequence_name, n [,true])` to change the current value, as shown in the following example:

Suppose a sequence named seq_id was created with a starting value of 1, an increment of 1, and a maximum value of 1000:

```sql
CREATE SEQUENCE seq_id INCREMENT BY 1 MAXVALUE 1000 START with 1;
```

Then, the `NEXTVAL()` function can be used to get the next sequence value and automatically increment the sequence counter:

```sql
SELECT NEXTVAL('seq_id');
```

Next, the `LASTVAL()` function can be used to return the current value of the sequence:

```sql
SELECT LASTVAL();
```

Alternatively, the `SETVAL()` function can be used to set the current value to 30, with the optional `[,b]` parameter set to true:

```sql
SELECT SETVAL('seq_id', 30);
```

Afterward, the `NEXTVAL()` function can be used again to get the next sequence value:

```sql
SELECT NEXTVAL('seq_id');
```

This will return 31 because the current value has been set to 30, and the `NEXTVAL()` function will return the next sequence value 31.

```sql
SELECT LASTVAL();
```

Using `LASTVAL()` will return the value of the sequence that was retrieved with `NEXTVAL()` in the current session, which is 31 in this case.

The above example shows that if the current value is set using `SETVAL(sequence_name, n [,true])` and then the next sequence value is retrieved using `NEXTVAL`, calling `LASTVAL()` again will return the value of the sequence retrieved with `NEXTVAL()`.

### Using `SEQUENCE` in a table

To use a sequence in a table, the following steps need to be completed:

1. Create a sequence object: A sequence named "my_sequence" can be created using the following SQL command:

    ```sql
    CREATE SEQUENCE my_sequence;
    ```

    This will create a simple sequence object that will start at 1 and increment by 1.

2. Apply a sequence to a field in a table: To apply a sequence to a field in a table, you need to specify a default value for the next value in the sequence in the table definition, as follows:

    ```sql
    CREATE TABLE my_table (
      id INTEGER DEFAULT nextval('my_sequence'),
      name VARCHAR(50));
    ```

    In the example above, the "id" field will automatically get the following unique value from the sequence as its default value.

3. Insert data: After the table and sequence have been defined, you can use the `INSERT` statement to insert data into the table. When inserting a row of data, if no value is specified for the "id" field, MatrixOne will automatically get the following unique value from the sequence as its default value.

    For example, the following statement will insert a row into the "my_table" table and automatically assign a unique value to the "id" field:

    ```sql
    INSERT INTO my_table (name) VALUES ('John');
    INSERT INTO my_table (name) VALUES ('Tom');
    ```

4. Using sequences makes it easy to automatically assign unique identifiers in the form, thus avoiding the possible errors of manually assigning identifiers. Use the following statement for query verification:

    ```sql
    mysql> select * from my_table;
    +------+------+
    | id   | name |
    +------+------+
    |    1 | John |
    |    2 | Tom  |
    +------+------+
    2 rows in set (0.01 sec)
    ```

!!! note
    When using SEQUENCE in a table, the `auto_increment` and `sequence` cannot be used together; otherwise, an error will be reported.

## **Examples**

```sql
-- Create a sequence named "seq_id" that starts from 1, increments by 1, and has a maximum value of 1000:
CREATE SEQUENCE seq_id INCREMENT BY 1 MAXVALUE 1000 START with 1;
-- After creating the sequence, the NEXTVAL function can be used to retrieve the next sequence value as shown below:
mysql> SELECT NEXTVAL('seq_id');
+-----------------+
| nextval(seq_id) |
+-----------------+
| 1               |
+-----------------+
1 row in set (0.02 sec)
-- This command will return the next value in the sequence (e.g., 1) and automatically increment the counter of the sequence.

-- The CURRVAL function returns the current value.
mysql> SELECT CURRVAL('seq_id');
+-----------------+
| currval(seq_id) |
+-----------------+
| 1               |
+-----------------+
1 row in set (0.01 sec)

-- Returns the most recent value retrieved by NEXTVAL in the current session for any sequence.
mysql> SELECT LASTVAL();
+-----------+
| lastval() |
+-----------+
| 1         |
+-----------+
1 row in set (0.00 sec)

-- Set the current value to 30.
mysql> SELECT SETVAL('seq_id', 30);
+--------------------+
| setval(seq_id, 30) |
+--------------------+
| 30                 |
+--------------------+
1 row in set (0.02 sec)

-- The NEXTVAL function retrieves the next sequence value.
mysql> SELECT NEXTVAL('seq_id');
+-----------------+
| nextval(seq_id) |
+-----------------+
| 31              |
+-----------------+
1 row in set (0.00 sec)
```
