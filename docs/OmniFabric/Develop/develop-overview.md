# Overview

This article and subsequent sections mainly aim to introduce how to perform application development using OmniFabric. We will show how to connect to OmniFabric, create databases and tables, and build applications based on standard programming languages such as Java, Python, and Golang.

## Interaction between OmniFabric and Applications

OmniFabric is generally highly compatible with MySQL 8.0 regarding communication protocol, SQL syntax, connection tools, or development modes. If this manual does not explicitly explain specific usage, you can refer to the MySQL 8.0 manual. Most application frameworks or programming languages can use MySQL's client library.

For significant differences between OmniFabric and MySQL, see [MySQL Compatibility](../Overview/feature/mysql-compatibility.md) section.

## OmniFabric Transaction Mechanism

OmniFabric supports both **Optimistic Transaction** and **Pessimistic Transaction**. In the current version of OmniFabric, the default is the **Pessimistic Transaction** mode. You can switch to **Optimistic Transaction** mode by modifying the startup configuration file.

You can start a transaction with `BEGIN`, commit the transaction with `COMMIT`, or roll back the transaction with `ROLLBACK`. OmniFabric ensures the atomicity of all statements from the beginning of `BEGIN` to the end of `COMMIT` or `ROLLBACK`. All statements during this period are either entirely successful or entirely failed, thereby ensuring the data consistency required in application development.

If you choose to use optimistic transactions, please add error handling and retry mechanisms in the application, as OmniFabric does not guarantee the success of each transaction. If you use pessimistic transactions, you don't need to consider this. Optimistic transactions will have superior concurrent performance compared to pessimistic transactions.

## Reference

* [Connect to OmniFabric](connect-mo/database-client-tools.md)

* [Schema Design](schema-design/overview.md)

* [Import Data](import-data/insert-data.md)

* [Read Data](read-data/query-data-single-table.md)

* [Transactions](Transactions/common-transaction-overview.md)

* [Application Developing Tutorials](../Tutorial/develop-java-crud-demo.md)
