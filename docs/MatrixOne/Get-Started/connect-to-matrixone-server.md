# Unit 3. Connect to MatrixOne Server

Congratulations! You have now installed the stand-alone MatrixOne. You can open a new terminal window and use the MySQL command line client to connect to the MatrixOne service.

## **Connect to MatrixOne server**

You can use the MySQL command-line client to connect to MatrixOne server:

```
mysql -h IP -P PORT -uUsername -p
```

After you enter the preceding command, the terminal will prompt you to provide the username and password. You can use our built-in account:

- user: dump
- password: 111

You can also use the following command line on the MySQL client to connect to the MatrixOne service: 

```
mysql -h 127.0.0.1 -P 6001 -udump -p
Enter password:
```

Currently, MatrixOne only supports the TCP listener.

## Reference

For more information on connecting to MatriOne, see
[Using client connect to the MatrixOne server](../Develop/connect-mo/client-connect-to-matrixone.md),[Connecting to MatrixOne with JDBC](../Develop/connect-mo/java-connect-to-matrixone/connect-mo-with-jdbc.md), and [Connecting to MatrixOne with Python](../Develop/connect-mo/python-connect-to-matrixone.md).
