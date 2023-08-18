# Insert Data

This document describes how to insert data into MatrixOne by using the SQL language.

## Before you start

Make sure you have already [Deployed standalone MatrixOne](../../Get-Started/install-standalone-matrixone.md).

## INSERT INTO Statement

It is possible to write the `INSERT INTO` statement in several ways:

1. Specify both the column names and the values to be inserted:

    ```
    INSERT INTO tbl_name (a,b,c) VALUES (1,2,3);
    ```

2. If you add values for all the table columns, you do not need to specify the column names in the SQL query. However, make sure the values' order is in the same order as the columns in the table. Here, the `INSERT INTO` syntax would be as follows:

    ```
    INSERT INTO tbl_name VALUES (1,2,3);
    ```

3. `INSERT`statements that use `VALUES` syntax can insert multiple rows. To do this, include multiple lists of comma-separated column values, with lists enclosed within parentheses and separated by commas. Example:

    ```
    INSERT INTO tbl_name (a,b,c) VALUES(1,2,3), (4,5,6), (7,8,9);
    ```

## Demo Database

Below is a selection from the "Customers" table in the Northwind sample database:

```
CREATE TABLE Customers (
  CustomerID INT AUTO_INCREMENT NOT NULL,
  CustomerName VARCHAR(40) NOT NULL,
  ContactName VARCHAR(30) NULL,
  Address VARCHAR(60) NULL,
  City VARCHAR(15) NULL,
  PostalCode VARCHAR(10) NULL,
  Country VARCHAR(15) NULL,
  PRIMARY KEY (CustomerID)
  );
```

| CustomerID | CustomerName         | ContactName     | Address                     | City     | PostalCode | Country |
| :--------- | :------------------- | :-------------- | :-------------------------- | :------- | :--------- | :------ |
| 89         | White Clover Markets | Karl Jablonski  | 305 - 14th Ave. S. Suite 3B | Seattle  | 98128      | USA     |
| 90         | Wilman Kala          | Matti Karttunen | Keskuskatu 45               | Helsinki | 21240      | Finland |
| 91         | Wolski               | Zbyszek         | ul. Filtrowa 68             | Walla    | 01-012     | Poland  |

## INSERT INTO Example

The following SQL statement inserts a new record in the "Customers" table:

### Example

```
INSERT INTO Customers (CustomerName, ContactName, Address, City, PostalCode, Country)
VALUES ('Cardinal', 'Tom B. Erichsen', 'Skagen 21', 'Stavanger', '4006', 'Norway');
```

The selection from the "Customers" table will now look like this:

| CustomerID | CustomerName         | ContactName     | Address                     | City      | PostalCode | Country |
| :--------- | :------------------- | :-------------- | :-------------------------- | :-------- | :--------- | :------ |
| 89         | White Clover Markets | Karl Jablonski  | 305 - 14th Ave. S. Suite 3B | Seattle   | 98128      | USA     |
| 90         | Wilman Kala          | Matti Karttunen | Keskuskatu 45               | Helsinki  | 21240      | Finland |
| 91         | Wolski               | Zbyszek         | ul. Filtrowa 68             | Walla     | 01-012     | Poland  |
| 92         | Cardinal             | Tom B. Erichsen | Skagen 21                   | Stavanger | 4006       | Norway  |

## Insert Data Only in Specified Columns

It is also possible to only insert data in specific columns.

### Example

The following SQL statement will insert a new record, but only insert data in the "CustomerName", "City", and "Country" columns (CustomerID will be updated automatically):

```
INSERT INTO Customers (CustomerName, City, Country)
VALUES ('Cardinal', 'Stavanger', 'Norway');
```

The selection from the "Customers" table will now look like this:

| CustomerID | CustomerName         | ContactName     | Address                     | City      | PostalCode | Country |
| :--------- | :------------------- | :-------------- | :-------------------------- | :-------- | :--------- | :------ |
| 89         | White Clover Markets | Karl Jablonski  | 305 - 14th Ave. S. Suite 3B | Seattle   | 98128      | USA     |
| 90         | Wilman Kala          | Matti Karttunen | Keskuskatu 45               | Helsinki  | 21240      | Finland |
| 91         | Wolski               | Zbyszek         | ul. Filtrowa 68             | Walla     | 01-012     | Poland  |
| 92         | Cardinal             | null            | null                        | Stavanger | null       | Norway  |

## INSERT INTO...SELECT

With `INSERT INTO SELECT`, you can quickly insert many rows into a table from the result of a SELECT statement, which can select from one or many tables. The `INSERT INTO SELECT` statement requires that the data types in source and target tables match.

### INSERT INTO SELECT Syntax

Copy all columns from one table to another table:

```
INSERT INTO *table2*
SELECT * FROM *table1
*WHERE *condition*;
```

Copy only some columns from one table into another table:

```
INSERT INTO *table2* (*column1*, *column2*, *column3*, ...)
SELECT *column1*, *column2*, *column3*, ...
FROM *table1*
WHERE *condition*;
```

## Northwind sample database

In this tutorial we will use the Northwind sample database.

```
CREATE TABLE Customers (
  CustomerID INT AUTO_INCREMENT NOT NULL,
  CustomerName VARCHAR(40) NOT NULL,
  ContactName VARCHAR(30) NULL,
  Address VARCHAR(60) NULL,
  City VARCHAR(15) NULL,
  PostalCode VARCHAR(10) NULL,
  Country VARCHAR(15) NULL,
  PRIMARY KEY (CustomerID)
  );
CREATE TABLE Suppliers (
  SupplierID INT AUTO_INCREMENT NOT NULL,
  SupplierName VARCHAR(40) NOT NULL,
  ContactName VARCHAR(30) NULL,
  Address VARCHAR(60) NULL,
  City VARCHAR(15) NULL,
  PostalCode VARCHAR(10) NULL,
  Country VARCHAR(15) NULL,
  PRIMARY KEY (SupplierID)
  );
```

Below is a selection from the "Customers" table:

| CustomerID | CustomerName                       | ContactName    | Address                       | City        | PostalCode | Country |
| :--------- | :--------------------------------- | :------------- | :---------------------------- | :---------- | :--------- | :------ |
| 1          | Alfreds Futterkiste                | Maria Anders   | Obere Str. 57                 | Berlin      | 12209      | Germany |
| 2          | Ana Trujillo Emparedados y helados | Ana Trujillo   | Avda. de la Constitución 2222 | México D.F. | 05021      | Mexico  |
| 3          | Antonio Moreno Taquería            | Antonio Moreno | Mataderos 2312                | México D.F. | 05023      | Mexico  |

And a selection from the "Suppliers" table:

| SupplierID | SupplierName               | ContactName      | Address        | City        | PostalCode | Country |
| :--------- | :------------------------- | :--------------- | :------------- | :---------- | :--------- | :------ |
| 1          | Exotic Liquid              | Charlotte Cooper | 49 Gilbert St. | Londona     | EC1 4SD    | UK      |
| 2          | New Orleans Cajun Delights | Shelley Burke    | P.O. Box 78934 | New Orleans | 70117      | USA     |
| 3          | Grandma Kelly's Homestead  | Regina Murphy    | 707 Oxford Rd. | Ann Arbor   | 48104      | USA     |

### Example

The following SQL statement copies "Suppliers" into "Customers" (the columns that are not filled with data, will contain NULL):

```
INSERT INTO Customers (CustomerName, City, Country)
SELECT SupplierName, City, Country FROM Suppliers;
```

The selection from the "Customers" table will now look like this:

| CustomerID | CustomerName                       | ContactName    | Address                       | City        | PostalCode | Country |
| :--------- | :--------------------------------- | :------------- | :---------------------------- | :---------- | :--------- | :------ |
| 1          | Alfreds Futterkiste                | Maria Anders   | Obere Str. 57                 | Berlin      | 12209      | Germany |
| 2          | Ana Trujillo Emparedados y helados | Ana Trujillo   | Avda. de la Constitución 2222 | México D.F. | 05021      | Mexico  |
| 3          | Antonio Moreno Taquería            | Antonio Moreno | Mataderos 2312                | México D.F. | 05023      | Mexico  |
| 4          | Exotic Liquid                      | null           | null                          | Londona     | null       | UK      |
| 5          | New Orleans Cajun Delights         | null           | null                          | New Orleans | null       | USA     |
| 6          | Grandma Kelly's Homestead          | null           | null                          | Ann Arbor   | null       | USA     |
