# UDF-Python-Advanced

This document will guide you on how to use the advanced features of UDF, including building UDF in phython files, whl packages.

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
    pip3 install protobuf
    pip3 install grpcio
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

## Import phython file to build UDF

Embedded UDFs write function bodies directly in SQL, which can inflate SQL statements and be detrimental to code maintenance if the function logic is complex. To avoid this, we can write the UDF function body in an external, separate Python file, and then create the function in MatrixOne by importing the Python file.

1. Prepare your python files

    You can write python code from the original SQL function body inside the `/opt/add_func.py` file:

    ```
    python def add(a, b): return a + b 
    ```

2. Creating a UDF Function

    Use the following command to create the function. We use the import keyword to import the add\_func.py file under the specified path.

    ```
    mysql create or replace function py_add_2(a int, b int) returns int language python import '/opt/add_func.py' -- absolute path to python file in OS handler 'add';
    ```

3. Call the UDF function

    Once the function has been created, the UDF function can be called with a **function name +** a parameter list of the matching type, for example:

    ```mysql
    select py_add_2(12345,23456);
    +-------------------------+
    |  py_add(12345, 23456)   |
    +-------------------------+
    |                   35801 |
    +-------------------------+
    1 row in set (0.02 sec)
    ```

## Import whl package to build UDF

WHL file is a standard built-in package format for python distribution that allows installation packages to run without building source distributions. WHL file is essentially a ZIP file.

### Preparations

1. Before building the whl package, we need to install the following tools:

    ```
    bash pip install setuptools wheel
    # setuptools: for building and packaging Python libraries
    # wheel: Used to generate .whl files
    ```

### Build a whl package

1. Create the file and its contents according to the following file structure

    We use a simple Python project directory, `func_add` (folder names can be arbitrarily named), with the following directory structure:

    ```bash
    func_add/
    ├── add_udf.py
    └── setup.py
    ```

    where `add_udf.py` is a normally executable Python code file that implements the function method body logic or can be treated as a module. The code in `add_udf.py` is for example:

    ```python
    # function

    def add(a, b):
        return a + b
    ```

    The `setup.py` file is used to define metadata, configuration information, etc. for the library, with code such as:

    ```python
    # setup.py

    from setuptools import setup

    setup( name="udf", version="1.0.0",
    # The python file name containing the function body is the module name after removing the extension name .py
    py\_modules=\["add\_udf"] ) 
    ```

2. Build a whl package

    Once the project file is written in place, execute the following command inside the `func_add` directory to build the wheel package:

    ```bash
     python setup.py bdist_wheel 
     ```

    When the packaging is complete, the `udf-1.0.0-py3-none-any.whl` file is generated in the `func_add/dist` directory.

### Create and call UDF functions

1. Creating a UDF Function

    Copy the whl package to the planned function repository directory, such as the path: `/opt/udf/udf-1.0.0-py3-none-any.whl`, and use the whl package in the create statement to create the UDF function. An example of the create statement is as follows:

    ```sql
    create or replace function py_add_3(a int, b int)
    returns int language python 
    import '/opt/udf/udf-1.0.0-py3-none-any.whl' -- wheel The directory in which the package resides 
    handler 'add_udf.add'; -- Specifies the add function that calls the add_udf module in the whl package
    ```

2. Call the UDF function

    Once the function has been created, the UDF function can be called with a **function name +** a parameter list of the matching type, for example:

    ```sql
    select py_add_3(12345,23456);
    +-------------------------+
    |  py_add(12345, 23456)   |
    +-------------------------+
    |                   35801 |
    +-------------------------+
    1 row in set (0.02 sec)
    ```

## Function Vector

In some scenarios, we would expect the python function to receive multiple tuples at once to improve its efficiency. As in model inference, we usually do this in a batch, where batch is the vector of the tuple, and MatrixOne provides the vector option of the function to handle this situation. We still use the py\_add function as an example to show the use of the vector option.

1. Create a data table named grades under the udf\_test library:

    ```sql
    create table grades(chinese int,math int); 
    ```

2. Insert several pieces of test data:

    ```sql
    insert into grades values(97,100),(85,89),(79,99); 
    ```

3. View the data in the following table:

    ```mysql
    select * from grades;
    +---------+------+
    | chinese | math |
    +---------+------+
    |      97 |  100 |
    |      85 |   89 |
    |      79 |   99 |
    +---------+------+
    ```

4. Create a UDF function by executing the following command We use `add.vector = True` to mark the python function add to receive two int lists (vectors) instead of int values:

    ```sql
    create or replace function py_add_4(a int, b int) returns int language python as $$ def add(a, b): \# a, b are list return \[a\[i] + b\[i] for i in range(len(a))] add.vector = True $$ handler 'add'; 
    ```

5. Call the UDF function

    The function is also called by its name and argument list, where the argument list we can use two integer field columns in the grades table, for example:

    ```sql
    select py_add_4(chinese,math) as Total from grades;
    +-------+
    | Total |
    +-------+
    |   197 |
    |   174 |
    |   178 |
    +-------+
    ```

    With the vector option, we are free to choose the processing form of the function, such as a tuple at a time, or a tuple at a time.

## Machine Learning Case: Credit Card Fraud Detection

This section describes the use of python UDF in the machine learning inference pipeline, using Credit Card Fraud Detection as an example. (The code is detailed in [github-demo](https://github.com/matrixorigin/matrixone/tree/main/pkg/udf/pythonservice/demo) and includes the following files to be downloaded and written)

### Environment Configuration

In this section, we need to make sure that the local python environment has numpy and scikit-learn and joblib installed.

```bash
pip install numpy pip install scikit-learn pip install joblib 
```

### Background and data

Credit card companies need to identify fraudulent transactions to prevent customers' credit cards from being used maliciously. (See [kaggle Credit Card Fraud Detection](https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud) for more details)

The data set contains transactions made by European cardholders using credit cards in September 2013. The data format is as follows:

| Column Name | Type | Meaning |
| :--- | :--- | :--- |
|Time | int | Number of seconds elapsed between this transaction and the first transaction in the dataset |
| V1~V28 | double | Features extracted using PCA (to protect user identity and sensitive features) |
| Amount | double | Transaction Amount |
| Class | int | 1: fraudulent transactions, 0: Non-fraudulent transactions |

Let's take the data according to 8: 1: The scale of 1 is divided into a training set, a validation set, and a test set. Since the training process is not the focus of this article, it is not covered too much here.

We store the test set as new data emerging from the production process in the MO. [Click here to](https://github.com/matrixorigin/matrixone/blob/main/pkg/udf/pythonservice/demo/ddl.sql) get the `ddl.sql` file, import the data table with the following statement and some of the test data:

```sql
source /your_download_path/ddl.sql 
```

### Preparing the python-whl package

1. Write `detection.py`:

    ```python
    # coding = utf-8
    # -*\- coding:utf-8 -*-
    import decimal import os from typing import List

    import joblib import numpy as np

    model\_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'model\_with\_scaler')


    def detect(featuresList: List\[List\[int]], amountList: List\[decimal.Decimal]) -> List\[bool]: model\_with\_scaler = joblib.load(model\_path)

        columns_features = np.array(featuresList)
        column_amount = np.array(amountList, dtype='float').reshape(-1, 1)
        column_amount = model_with_scaler['amount_scaler'].transform(column_amount)
        data = np.concatenate((columns_features, column_amount), axis=1)
        predictions = model_with_scaler['model'].predict(data)
        return [pred == 1 for pred in predictions.tolist()]


    detect.vector = True 
    ```

2. Write `__init__.py`:

    ```python
    # coding = utf-8
    # -*- coding:utf-8 -*-
    from .detection import detect
    ```

3. [Click to download](https://github.com/matrixorigin/matrixone/blob/main/pkg/udf/pythonservice/demo/credit/model_with_scaler) the trained model `model_with_scaler`

4. Write `setup.py`:

    ```python
    # coding = utf-8
    # -*- coding:utf-8 -*-
    from setuptools import setup, find_packages

    setup(
        name="detect",
        version="1.0.0",
        packages=find_packages(),
        package_data={
            'credit': ['model_with_scaler']
        },
    )
    ```

5. Organize the above files into the following structure:

    ```bash
    |-- demo/
        |-- credit/
            |-- __init__.py
            |-- detection.py		# inference function
            |-- model_with_scaler	# model
        |-- setup.py
    ```

6. Go to the directory `demo` and build the wheel package detect-1.0.0-py3-none-any.whl with the following command:

    ```bash
    python setup.py bdist_wheel 
    ```

### Fraud detection using udf

1. To create a udf function:

    ```sql
    create or replace function py_detect(features json, amount decimal) 
    returns bool 
    language python 
    import 'your_code_path/detect-1.0.0-py3-none-any.whl' -- replace with handler 'credit.detect';
    handler 'credit.detect';-- detect function under credit module
    ```

2. Call the udf function for fraud detection:

    ```sql
    select id, py_detect(features, amount) as is_fraud from credit_card_transaction limit 10;
    ```

    Output:

    ```sql
    +---------+----------+
    | id      | is_fraud |
    +---------+----------+
    |       1 | false    |
    |       2 | false    |
    |       3 | true     |
    |       4 | false    |
    |       5 | false    |
    |       6 | false    |
    |       7 | false    |
    |       8 | true     |
    |       9 | false    |
    |      10 | false    |
    +---------+----------+
    ```

At this point, we have completed the reasoning for the credit card fraud detection task in MO.

As the case shows, we can easily use python UDF for tasks that SQL cannot solve. Python UDF greatly improves development efficiency by both extending the semantics of SQL and eliminating the need for us to manually program data movement and transformation.

## Reference Documents

For base usage of UDF in MatrixOne, see [UDF Base Usage](udf-python.md).

For specific parameters that MatrixOne creates for UDFs, see [Creating UDFs](../../Reference/SQL-Reference/Data-Definition-Language/create-function-python.md).

For specific parameters for MatrixOne deletion of UDFs, see [Removing UDFs](../../Reference/SQL-Reference/Data-Definition-Language/drop-function.md).
