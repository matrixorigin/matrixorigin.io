# Write data to MatrixOne using DataX

## Overview

DataX is an Ali open source offline synchronization tool for heterogeneous data sources that provides stable and efficient data synchronization for efficient data synchronization between heterogeneous data sources.

DataX divides synchronization of different data sources into two main components: **Reader** and **Writer**. The DataX framework theoretically supports data synchronization efforts for any data source type.

MatrixOne is highly compatible with MySQL 8.0, but since DataX's included MySQL Writer plug-in adapts to the JDBC driver of MySQL 5.1, the community has separately revamped the MySQL 8.0-driven MatrixOneWriter plug-in to improve compatibility. The MatrixOneWriter plugin implements the ability to write data to the MatrixOne database target table. In the underlying implementation, the MatrixOneWriter connects to a remote MatrixOne database via JDBC and executes the corresponding `insert into ...` SQL statement to write data to MatrixOne, while supporting bulk commits.

MatrixOneWriter leverages the DataX framework to get the generated protocol data from Reader and generates the appropriate `insert into...` statement based on the `writeMode` you configured. When a primary key or unique index conflict is encountered, conflicting rows are excluded and writes continue. For performance optimization reasons, we took the `PreparedStatement + Batch` approach and set the `rewriteBatchedStatements=true` option to buffer the data into the thread context's buffer. A write request is triggered only when the amount of data in the buffer reaches a predetermined threshold.

![DataX](https://github.com/matrixorigin/artwork/blob/main/docs/develop/Computing-Engine/datax-write/datax.png?raw=true)

!!! note
    You need to have at least `insert into ...` permissions to execute the entire task. Whether you need additional permissions depends on your `preSql` and `postSql` in the task configuration.

MatrixOneWriter is primarily intended for ETL development engineers who use MatrixOneWriter to import data from a data warehouse into MatrixOne. At the same time, MatrixOneWriter can also serve users such as DBAs as a data migration tool.