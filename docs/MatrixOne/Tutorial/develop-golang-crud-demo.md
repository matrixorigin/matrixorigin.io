# Golang CRUD demo

## Setup your environment

1. Make sure you have already [installed and launched MatrixOne](../Get-Started/install-standalone-matrixone.md).
2. Make sure you have already installed [Golang 1.18 and plus](https://go.dev/dl/).  

    ```
    #To check with Golang installation and its version
    go version
    ```

3. Make sure you have already installed MySQL client.
4. Download and install [`Go-MySQL-Driver`](https://github.com/go-sql-driver/mysql) tool.

## Develop your code

1. Connect to MatrixOne by MySQL client. Create a new database named *test*.

    ```
    mysql> create database test;
    ```

2. Create a plain text file `golang_crud_matrixone.go` and put the code below.

    ```python
    package main

    import (
        "database/sql"
        "fmt"
        "log"
        _ "github.com/go-sql-driver/mysql"
    )

    func main() {
      	//Open a new connection to MatrixOne
        db, err := sql.Open("mysql", "root:111@tcp(127.0.0.1:6001)/test")
        checkErr(err)

        //Create a table
        _, err2 := db.Exec("CREATE TABLE `userinfo` (`uid` INT(10) NOT NULL AUTO_INCREMENT,`username` VARCHAR(64) NULL DEFAULT NULL,`department` VARCHAR(64) NULL DEFAULT NULL,`created` DATETIME NULL DEFAULT NULL, PRIMARY KEY (`uid`));")
        if err2 != nil {
            log.Fatal(err2)
        }
        fmt.Print("Successfully Created\n")

        // Insert a record
        stmt, err := db.Prepare("INSERT userinfo SET username=?,department=?,created=?")
        checkErr(err)

        res, err := stmt.Exec("Alex", "r&d", "2023-01-01" 12:00:00")
        checkErr(err)

        id, err := res.LastInsertId()
        checkErr(err)

        fmt.Println(id)
        //Update a record
        stmt, err = db.Prepare("update userinfo set username=? where uid=?")
        checkErr(err)

        res, err = stmt.Exec("Mark", id)
        checkErr(err)

        affect, err := res.RowsAffected()
        checkErr(err)

        fmt.Println(affect)

        // Query all records
        rows, err := db.Query("SELECT * FROM userinfo")
        checkErr(err)

        for rows.Next() {
            var uid int
            var username string
            var department string
            var created string
            err = rows.Scan(&uid, &username, &department, &created)
            checkErr(err)
            fmt.Println(uid)
            fmt.Println(username)
            fmt.Println(department)
            fmt.Println(created)
        }

        // Delete a record
        stmt, err = db.Prepare("delete from userinfo where uid=?")
        checkErr(err)

        res, err = stmt.Exec(id)
        checkErr(err)

        affect, err = res.RowsAffected()
        checkErr(err)

        fmt.Println(affect)

        db.Close()

    }

    func checkErr(err error) {
        if err != nil {
            panic(err)
        }
    }

    ```

3. Execute this Golang file in the command line terminal.

    ```
    > go run golang_crud_matrixone.go
    Successfully Created
    1
    1
    1
    Mark
    r&d
    2023-01-01
    1
    ```
