# Gorm CRUD demo

This tutorial shows you how to build a simple GO+Gorm CRUD(Create, Read, Update, Delete) application with MatrixOne. Gorm is one of the most popular ORM tools in GO language.

## Before you start

A brief introduction about these softwares concerned:

* Gorm: The fantastic ORM library for Golang aims to be developer friendly. `gorm.io/gorm` and `gorm.io/driver/mysql` will vbe used to make Go connect to MYSQL.

### Setup your environment

Before you start, make sure you have downloaded and installed the following software.

1. Make sure you have already [installed and launched MatrixOne](../Get-Started/install-standalone-matrixone.md). Connect to MatrixOne and create a database by MySQL client.

    ```
    mysql> create database test;
    ```

2. Make sure you have already installed [Golang 1.18 (or plus) version](https://go.dev/dl/).

	```
	#To check with Golang installation and its version
	go version
	```

3. Make sure you have already installed MySQL.

4. Use command `go get` to install `gorm.io/gorm` and `gorm.io/driver/mysql`.

	```
	go get -u gorm.io/gorm
	go get -u gorm.io/driver/mysql
	```

As we have explained how to connect to MatrixOne by Gorm in the other [tutorial](../Develop/connect-mo/connect-to-matrixone-with-go.md), we will focus on the CRUD(Create, Read, Update, Delete) implementations in this tutorial.

## Create

As an Object Relational Mapper(ORM) tool, Gorm allows developers to create go class to map the table in relational database. In the example below, we will create a `User` class. The class name and the attribute name must starts with a capital letter to make `public` access.

Create a go file `gorm_create.go` and put the code below.

```go
package main
import (
	"fmt"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)
// user model
type USER struct {
	ID       uint `gorm:"primaryKey"`
	CNAME    string
	CADDRESS string
}

func getDBConn() *gorm.DB {
	dsn := "root:111@tcp(127.0.0.1:6001)/test?charset=utf8mb4&parseTime=True&loc=Local" //MO
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
    // Logger: logger.Default.LogMode(logger.Info), //print SQL
  })
	// get connection
	if err != nil {
		fmt.Println("Database Connection Failed") //Connection failed
	} else {
		fmt.Println("Database Connection Succeed") //Connection succeed
	}
	return db
}

func main() {
	//get *gorm.DB
	db := getDBConn()

	// auto create table
	db.AutoMigrate(&USER{})
}

```

To enable the logging of converted SQL output, you can uncomment the following line:`Logger: logger.Default.LogMode(logger.Info)`

To run the Go file, open a terminal and use the following command:

```
go run gorm_create.go
```

You can use a MySQL client to verify if the table has been successfully created.

```sql
mysql> show tables;
+----------------+
| Tables_in_test |
+----------------+
| users          |
+----------------+
1 row in set (0.01 sec)
```

## Inserting Data

In the following example, you will be guided on how to insert two records into the users table that was created earlier. The ID column is assumed to be auto-incremented, but you can also specify a fixed value.

Create a new text file named `gorm_insert.go` and copy the following code into the file:

```go
package main
import (
	"fmt"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)
// user model
type USER struct {
	ID       uint `gorm:"primaryKey"`
	CNAME    string
	CADDRESS string
}

func getDBConn() *gorm.DB {
	dsn := "root:111@tcp(127.0.0.1:6001)/test?charset=utf8mb4&parseTime=True&loc=Local" //MO
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	// get connection
	if err != nil {
		fmt.Println("Database Connection Failed") //Connection failed
	} else {
		fmt.Println("Database Connection Succeed") //Connection succeed
	}
	return db
}

func main() {
	//get *gorm.DB
	db := getDBConn()

	// auto create table
	db.AutoMigrate(&USER{})

  // **Insert users**
	users := []USER{
		{
			// ID: 1, //autoincrement
			CNAME:    "lili",
			CADDRESS: "Shanghai"},
		{
			ID:       111,
			CNAME:    "zhang",
			CADDRESS: "Biejing",
		},
	}

	db.Create(users)
	
}

```

Open your terminal and execute the following command to run the  *go*  file:

```
go run gorm_insert.go
```

Similarly, you can use a MySQL client to verify if the data has been successfully inserted into the table.

```sql
mysql> select * from users;
+------+-------+----------+
| id   | cname | caddress |
+------+-------+----------+
|    1 | lili  | Shanghai |
|  111 | zhang | Biejing  |
+------+-------+----------+
2 rows in set (0.01 sec)
```

## Querying Data

In the following example, you will be guided on how to query a subset of data based on a condition, specifically querying data where `CNAME=zhang` .

Create a new text file named `gorm_query.go` and copy the following code into the file:

```go
package main
import (
	"fmt"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)
// user model
type USER struct {
	ID       uint `gorm:"primaryKey"`
	CNAME    string
	CADDRESS string
}

func getDBConn() *gorm.DB {
	dsn := "root:111@tcp(127.0.0.1:6001)/test?charset=utf8mb4&parseTime=True&loc=Local" //MO
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	// get connection
	if err != nil {
		fmt.Println("Database Connection Failed") //Connection failed
	} else {
		fmt.Println("Database Connection Succeed") //Connection succeed
	}
	return db
}

func main() {
	//get *gorm.DB
	db := getDBConn()

	// auto create table
	db.AutoMigrate(&USER{})

  // **Query—— String condition** 
	res := USER{}
	tx := db.Where("CNAME = ? ", "zhang").Find(&USER{}).Scan(&res)
	if tx.Error != nil {
		fmt.Println(tx.Error)
		return
	}
	fmt.Println(res)

}

```

Open your terminal and execute the following command to run the  *go*  file:

```
go run gorm_query.go
```

The output of the terminal will include the following data.

```
{111 zhang Biejing}
```

## Updating Data

In the following demonstration, you will be guided on how to update data.
Create a text file named `gorm_update.go` and copy-paste the following code into the file:

```go
package main
import (
	"fmt"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)
// user model
type USER struct {
	ID       uint `gorm:"primaryKey"`
	CNAME    string
	CADDRESS string
}

func getDBConn() *gorm.DB {
	dsn := "root:111@tcp(127.0.0.1:6001)/test?charset=utf8mb4&parseTime=True&loc=Local" //MO
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	// get connection
	if err != nil {
		fmt.Println("Database Connection Failed") //Connection failed
	} else {
		fmt.Println("Database Connection Succeed") //Connection succeed
	}
	return db
}

func main() {
	//get *gorm.DB
	db := getDBConn()

	// auto create table
	db.AutoMigrate(&USER{})

  // **Update** 
	aUser := USER{}
	tx := db.Where("CNAME = ? ", "zhang").Find(&USER{}).Scan(&aUser)
	if tx.Error != nil {
		fmt.Println(tx.Error)
		return
	}
	res:=db.Model(&aUser).Update("CADDRESS", "HongKong")
  if res.Error != nil {
		fmt.Println(tx.Error)
		return
	}

}

```

Open your terminal and execute the following command to run the  *go*  file:

```
go run gorm_update.go
```

You can use the MySQL client to verify if the table has been updated successfully:

```sql
mysql> select * from users;
+------+-------+----------+
| id   | cname | caddress |
+------+-------+----------+
|  111 | zhang | HongKong |
|    1 | lili  | Shanghai |
+------+-------+----------+
2 rows in set (0.00 sec)
```

## Deleting Data

In the following demonstration, you will be guided on how to delete a single data record. It is important to note that when deleting a single record, you need to specify the primary key, otherwise it may trigger a batch delete.
Create a text file named `gorm_delete.go` and copy-paste the following code into the file:

```go
package main
import (
	"fmt"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)
// user model
type USER struct {
	ID       uint `gorm:"primaryKey"`
	CNAME    string
	CADDRESS string
}

func getDBConn() *gorm.DB {
	dsn := "root:111@tcp(127.0.0.1:6001)/test?charset=utf8mb4&parseTime=True&loc=Local" //MO
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	// get connection
	if err != nil {
		fmt.Println("Database Connection Failed") //Connection failed
	} else {
		fmt.Println("Database Connection Succeed") //Connection succeed
	}
	return db
}

func main() {
	//get *gorm.DB
	db := getDBConn()

	// auto create table
	db.AutoMigrate(&USER{})

  // **Delete** 
	aUser := USER{}
	tx := db.Where("CNAME = ? ", "zhang").Find(&USER{}).Scan(&aUser)
	if tx.Error != nil {
		fmt.Println(tx.Error)
		return
	}
	res := db.Delete(&aUser)
	if res.Error != nil {
		fmt.Println(tx.Error)
		return
	}

}

```

Open your terminal and execute the following command to run the  *go*  file:

```
go run gorm_delete.go
```

You can use the MySQL client to verify if the table has been deleted successfully:

```sql
mysql> select * from users;
+------+-------+----------+
| id   | cname | caddress |
+------+-------+----------+
|    1 | lili  | Shanghai |
+------+-------+----------+
1 row in set (0.00 sec)
```

The above is just a partial demonstration of CRUD operations in GORM. For more usage and examples, please refer to the [GORM Official Guides](https://gorm.io/docs/index.html).
