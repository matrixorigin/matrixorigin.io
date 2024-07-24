# **LOAD DATA INLINE**

## **Overview**

The `LOAD DATA INLINE` syntax imports strings organized in *csv* format into a data table, faster than `INSERT INTO` operations. The functionality of `LOAD DATA INLINE` is suitable for streaming fast data writes without a primary key, as in IoT class scenarios.

## Syntax structure

```mysql
mysql> LOAD DATA INLINE 
FORMAT='csv' ,
DATA=$XXX$
csv_string $XXX$
INTO TABLE tbl_name;
```

**Parametric interpretation**

`FORMAT='csv'` indicates that the string data in the following `DATA` is organized in `csv` format.

`$XXX$` in `DATA=$XXX$ csv_string $XXX$` is the identifier for the beginning and end of the data. `csv_string` is string data organized in `csv` format with `\n` or `\r\n` as a newline character.

!!! note
    `$XXX$` is the identifier for the beginning and end of the data, note that `$XXX$` at the end of the data needs to be on the same line as the last line of data, a new line may cause `ERROR 20101`

### Example: Importing data using `LOAD DATA INLINE`

1. Start the MySQL client and connect to MatrixOne:

    ```mysql
    mysql -h 127.0.0.1 -P 6001 -uroot -p111
    ```

    !!! note
        The login account in the above code section is the initial account. Please change the initial password promptly after logging into MatrixOne, see [Password Management](../../../Security/password-mgmt.md).

2. Before executing `LOAD DATA INLINE` in MatrixOne, you need to create the completion data table `user` in MatrixOne in advance:

    ```mysql

    CREATE TABLE `user` (
    `name` VARCHAR(255) DEFAULT null,
    `age` INT DEFAULT null,
    `city` VARCHAR(255) DEFAULT null
    )
    ```

3. Perform a `LOAD DATA INLINE` on the MySQL client for data import, importing data in *csv* format:

    ```mysql
    mysql> LOAD DATA INLINE 
    FORMAT='csv',
    DATA=$XXX$
    Lihua,23,Shanghai
    Bob,25,Beijing $XXX$ 
    INTO TABLE user;
    ```