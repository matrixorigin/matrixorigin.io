# Connecting to MatrixOne with Golang

MatrixOne supports Golang application connection, [`Go-MySQL-Driver`](https://github.com/go-sql-driver/mysql) is supported. This tutorial will walk you through how to connect MatrixOne with Golang.

## Before you start

1. Make sure you have already [installed and launched MatrixOne](../../Get-Started/install-standalone-matrixone.md).
2. Make sure you have already installed [Golang 1.18 and plus](https://go.dev/dl/).  

```
#To check with Golang installation and its version
go version
```

3. Make sure you have already installed MySQL client.

## Using Golang to connect to MatrixOne

`Go-MySQL-Driver` is a MySQL driver for Go's (golang) database/sql package.

1. Install `go-mysql-driver` tool. Simple install the package to your [$GOPATH](https://github.com/golang/go/wiki/GOPATH) with the [go tool](https://golang.org/cmd/go/) from shell. Make sure [Git is installed](https://git-scm.com/downloads) on your machine and in your system's `PATH`.

    ```
    > go get -u github.com/go-sql-driver/mysql
    ```

2. Connect to MatrixOne by MySQL client. Create a new database named *test*.

    ```sql
    mysql> create database test;
    ```

3. Create a plain text file `golang_connect_matrixone.go` and put the code below.

    ```python
    package main

    import (
        "database/sql"
        "fmt"
        _ "github.com/go-sql-driver/mysql"
    )

    func main() {
        //"username:password@[protocol](address:port)/database"
        db, _ := sql.Open("mysql", "root:111@tcp(127.0.0.1:6001)/test") // Set database connection
        defer db.Close()                                            //Close DB
        err := db.Ping()                                            //Connect to DB
        if err != nil {
            fmt.Println("Database Connection Failed")               //Connection failed
            return
        } else {
            fmt.Println("Database Connection Succeed")              //Connection succeed
        }
    }
    ```

4. Execute this golang file in the command line terminal.

    ```
    > go run golang_connect_matrixone.go
    Database Connection Succeed
    ```

## Reference

For the example about using Golang to build a simple CRUD with MatrixOne, see [Build a simple Golang CRUD demo with MatrixOne](../../Tutorial/develop-golang-crud-demo.md).
