# UDF-Python

You can write handlers for user-defined functions (UDFs) in Python. This document will guide you through how to create a simple Python UDF, including usage environment requirements, UDF creation, viewing, use, and deletion.

## Prepare before you start

### Environment Configuration

Before you begin, confirm that you have downloaded and installed the following software:

- Verify that you have installed [Python 3.8 (or plus)](https://www.python.org/downloads/), check the Python version using the following code to confirm that the installation was successful:

    ```bash
    #To check with Python installation and its version 
    python3 -V
    ```

    !!! note
        If you have both Pyhon2 and Python3 in your operating system, you need to configure it globally for Python3 before using UDF, for example by renaming `/usr/bin/python` and then creating a python3 softlink there with the same name, an example of the relevant command:

        ```bash
        mv /usr/bin/python /usr/bin/python.bak
        ln -s /usr/local/python3/bin/python3 /usr/bin/python
        ```

- Download and install the `protobuf` and `grpcio` tools and use the following code to download and install the `protobuf` and `grpcio` tools:

    ```
    pip3 install protobuf pip3 install grpcio 
    ```

- Verify that you have completed installing the MySQL client.

### Start MatrixOne

1. Follow the steps in the [Quick Start](../../Get-Started/install-standalone-matrixone.md) chapter to complete the deployment of MatrixOne using mo\_ctl. When the deployment is complete, execute the following command to modify the configuration of mo\_ctl:

    ```bash
    mo_ctl set_conf MO_CONF_FILE="\${MO_PATH}/matrixone/etc/launch-with-python-udf-server/launch.toml" 
    ```

2. After modifying the configuration, you need to start (or restart) the MatrixOne service for the configuration to take effect, such as starting the MatrixOne service with mo\_ctl:

    ```bash
    mo_ctl start 
    ```

3. Wait for the MatrixOne service to start normally (if MatrixOne is starting for the first time, background initialization will take about ten seconds before connecting after initialization is complete). Execute the following command to access the MatrixOne service:

    ```
    mo_ctl connect 
    ```

    You will be taken to the mysql client command line tool after a successful connection.

## Embedded Build UDF

MatrixOne supports creating UDFs in SQL by writing function bodies directly in Python code using the AS keyword. UDFs created in this form are called **embedded UDFs**.

1. Create a test library

    Before you can create a UDF function, you need to create a test library:

    ```sql
    mysql> create database udf_test; Query 0k, 1 row affected (0.02 sec) 
    mysql> use udf_test; 
    Database changed 
    ```

2. Creating a UDF Function

    Within the target library, the CREATE command can be executed in conjunction with Python statements to create UDF functions. For example, use the following SQL to define a function named **py\_add** that defines a list of arguments to receive two arguments of type int . The function function returns the sum of the two arguments, with the specific function logic in the python code after as . Then, use the handler keyword to specify the name of the python function called:

    ```sql
    create or replace function py_add(a int, b int) returns int language python as 
    $$
    def add(a, b):
        return a + b
    $$
    handler 'add';
    ```

    !!! note
        The current version of matrixone does not check the python syntax when creating a UDF. Users need to guarantee the correctness of the python syntax themselves, or they will get an error when executing subsequent execution functions.

3. Call the UDF function

    Once the function has been created, the UDF function can be called with a **function name +** a parameter list of the matching type, for example:

    ```sql
    select py_add(12345,23456);
    +-------------------------+
    |  py_add(12345, 23456)   |
    +-------------------------+
    |                   35801 |
    +-------------------------+
    1 row in set (0.02 sec)
    ```

## Delete UDF

Created UDF functions can be removed by `drop function` command. MatrixOne fully identifies a UDF function by its **`function name (`**parameter list), so deleting a UDF function requires explicitly specifying the **function name** and **parameter list**, for example:

```
sql drop function py_add(int, int); 
```

## View UDF

Information about created UDF functions is saved in the metadata of MatrixOne. You can obtain the UDF details already in MatrixOne by querying the system table `mo_catalog.mo_user_defined_function`, for example:

```mysql
mysql> select * from mo_catalog.mo_user_defined_function\G
*************************** 1. row ***************************
         function_id: 9000016
                name: py_add
               owner: 0
                args: [{"name": "a", "type": "int"}, {"name": "b", "type": "int"}]
             rettype: int
                body: {"handler":"add","import":false,"body":"\ndef add(a, b):\n  return a + b\n"}
            language: python
                  db: udf_test
             definer: root
       modified_time: 2023-12-26 13:59:39
        created_time: 2023-12-26 13:59:39
                type: FUNCTION
       security_type: DEFINER
             comment: 
character_set_client: utf8mb4
collation_connection: utf8mb4_0900_ai_ci
  database_collation: utf8mb4_0900_ai_ci
```

## Reference Documents

For advanced usage of UDF in MatrixOne, see [UDF Advanced Usage](udf-python-advanced.md).

For specific parameters that MatrixOne creates for UDFs, see [Creating UDFs](../../Reference/SQL-Reference/Data-Definition-Language/create-function-python.md).

For specific parameters for MatrixOne deletion of UDFs, see [Removing UDFs](../../Reference/SQL-Reference/Data-Definition-Language/drop-function.md).
