# FOREIGN KEY integrity constraints

FOREIGN KEY constraints can keep related data consistent when cross-referencing associated data across tables.

**Rules**

When defining FOREIGN KEY, the following rules need to be followed:

- The parent table must already exist in the database or be a table currently being created. In the latter case, the parent table and the slave table are the same table, such a table is called a self-referential table, and this structure is called self-referential integrity.

- A primary key must be defined for the parent table.

- Primary keys cannot contain null values, but null values are allowed in foreign keys. In other words, as long as every non-null value in the foreign key appears in the specified primary key, the content of the foreign key is correct.

- Specify the column name or combination of column names after the table name of the parent table. This column or combination of columns must be the primary or candidate key of the primary table.

- The number of columns in the foreign key must be the same as the number of columns in the primary key of the parent table.

- The data type of the column in the foreign key must be the same as the data type of the corresponding column in the primary key of the parent table.

- The foreign key's value must be consistent with the primary key's value in the main table.

**Foreign Key Characteristics**

- Foreign key self-referencing: is when a column in a table references the primary key of the same table. This design is often used to represent hierarchical or parent-child relationships, such as organizational structures, classified directories, and so on.

- Multi-column foreign key: This type of foreign key is when two or more columns in a table jointly reference another table's primary key. In other words, these columns together define the reference to another table. They must exist in the form of a group and need to meet the foreign key constraint simultaneously.

- Multi-level foreign key: This situation usually involves three or more tables, and they have a dependency relationship. A table's foreign key can be another table's primary key, and this table's foreign key can be the primary key of a third table, forming a multi-level foreign key situation.

## **Syntax**

Foreign keys are defined in the child table, and the primary foreign key constraint syntax is as follows:

```
> CREATE TABLE child_table (
    ...,
    foreign_key_column data_type,
    FOREIGN KEY (foreign_key_column) REFERENCES parent_table (parent_key_column)
    [ON DELETE reference_option]
    [ON UPDATE reference_option]
);

reference_option:
    RESTRICT | CASCADE | SET NULL | NO ACTION
```

**Explanation**

In the above syntax structure of a foreign key constraint, the following are explanations for each parameter:

- `child_table`: The name of the child table, which contains the foreign key.
- `foreign_key_column`: The column's name in the child table references the parent table.
- `data_type`: The data type of the foreign key column.
- `parent_table`: The name of the referenced parent table.
- `parent_key_column`: The name of the primary key column in the parent table establishing the relationship.
- `[ON DELETE reference_option]`: An optional parameter used to specify actions to be taken when records in the parent table are deleted.
    + `RESTRICT`: If related foreign key data exists in the referenced table, deletion of data in the table is not allowed. This prevents accidental deletion of related data, ensuring data consistency.
    + `CASCADE`: When data in the referenced table is deleted, associated foreign key data is also deleted. This is used for cascading deletion of related data to maintain data integrity.
    + `SET NULL`: When data in the referenced table is deleted, the value of the foreign key column is set to NULL. This is used to retain foreign key data while disconnecting it from the referenced data upon deletion.
    + `NO ACTION`: Indicates no action is taken; it only checks for the existence of associated data. This is similar to `RESTRICT` but may have minor differences in some databases.
- `[ON UPDATE reference_option]`: An optional parameter used to specify actions to be taken when records in the parent table are updated. Possible values are the same as `[ON DELETE reference_option]`.

These parameters collectively define a foreign key constraint, ensuring the data integrity relationship between the child and parent tables.

## **Examples**

### Example 1

```sql
-- Create a table named t1, containing two columns: a and b. The column a is of type int and is set as the primary key, while the column b is of type varchar with a length of 5.
create table t1(a int primary key, b varchar(5));

-- Create a table named t2, containing three columns: a, b, and c. The column a is of type int, the column b is of type varchar with a length of 5. The column c is of type int, and is set as a foreign key, establishing a relationship with the column a in table t1.
create table t2(a int ,b varchar(5), c int, foreign key(c) references t1(a));

-- Insert two rows of data into table t1: (101, 'abc') and (102, 'def').
mysql> insert into t1 values(101,'abc'),(102,'def');
Query OK, 2 rows affected (0.01 sec)

-- Insert two rows of data into table t2: (1, 'zs1', 101) and (2, 'zs2', 102), where 101 and 102 are the primary keys in table t1.
mysql> insert into t2 values(1,'zs1',101),(2,'zs2',102);
Query OK, 2 rows affected (0.01 sec)

-- Insert a row of data into table t2: (3, 'xyz', null), where null means that this row of data has no associated primary key in column c (the foreign key column).
mysql> insert into t2 values(3,'xyz',null);
Query OK, 1 row affected (0.01 sec)

-- Attempt to insert a row of data into table t2: (3, 'xxa', 103). However, 103 does not exist in the primary keys of table t1, so the insertion fails due to violation of the foreign key constraint.
mysql> insert into t2 values(3,'xxa',103);
ERROR 20101 (HY000): internal error: Cannot add or update a child row: a foreign key constraint fails

```

**Example Explanation**: In the above example, column c of t2 can only refer to the value or null value of column a in t1, so the operation of inserting row 1 and row 2 of t1 can be successfully inserted, but row 3 103 in the row is not a value in column a of t1, which violates the foreign key constraint, so the insert fails.

### Example 2 - Foreign key self-reference

```sql
-- Create a table named categories to store product categorization information.
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id INT,
    FOREIGN KEY (parent_id) REFERENCES categories(id)
);

mysql> INSERT INTO categories (name) VALUES ('Electronics'),('Books');
Query OK, 2 rows affected (0.01 sec)

mysql> INSERT INTO categories (name, parent_id) VALUES ('Laptops', 1),('Smartphones', 1),('Science Fiction', 2),('Mystery', 2);
Query OK, 4 rows affected (0.01 sec)

mysql> select * from categories;
+------+-----------------+-----------+
| id   | name            | parent_id |
+------+-----------------+-----------+
|    1 | Electronics     |      NULL |
|    2 | Books           |      NULL |
|    3 | Laptops         |         1 |
|    4 | Smartphones     |         1 |
|    5 | Science Fiction |         2 |
|    6 | Mystery         |         2 |
+------+-----------------+-----------+
6 rows in set (0.01 sec)

```

**Example Explanation**:In the above code, we have created a table named `categories` to store the category information of the products and first inserted two top level categories `Electronics` and `Books`. Then, we added subcategories to each of the top-level categories, for example, `Laptops` and `Smartphones` are subcategories of `Electronics`, and `Science Fiction` and `Mystery` are subcategories of `Books`.

### Example 3 - Multi-column foreign key

```sql
-- Creating a "Student" table to store student information
CREATE TABLE Student (
    StudentID INT, -- Student ID field, integer
    Name VARCHAR(100), -- Student name field, string with a maximum length of 100
    PRIMARY KEY (StudentID) -- Setting the StudentID as the primary key of this table
);

-- Creating a "Course" table to store course information
CREATE TABLE Course (
    CourseID INT, -- Course ID field, integer
    CourseName VARCHAR(100), -- Course name field, string with a maximum length of 100
    PRIMARY KEY (CourseID) -- Setting the CourseID as the primary key of this table
);

-- Creating a "StudentCourse" table to store student course selection information
CREATE TABLE StudentCourse (
    StudentID INT, -- Student ID field, integer, corresponds to the StudentID field in the Student table.
    CourseID INT, -- Course ID field, integer, corresponds to the CourseID field in the Course table.
    PRIMARY KEY (StudentID, CourseID), -- Setting the combination of StudentID and CourseID as the primary key of this table
    FOREIGN KEY (StudentID) REFERENCES Student(StudentID), -- Setting the StudentID field as the foreign key, referencing the StudentID field in the Student table
    FOREIGN KEY (CourseID) REFERENCES Course(CourseID) -- Setting the CourseID field as the foreign key, referencing the CourseID field in the Course table
);
```

**Example Explanation**: In the above example, there are three tables: the `Student` table, the `Course` table, and the `StudentCourse` table for recording which students have chosen which courses. In this case, the `Student ID` and `Course ID` in the course selection table can serve as foreign keys, jointly referencing the primary keys of the student table and the course table.

### Example 4 - Multi-level foreign key

```sql
-- Creating a "Country" table to store country information
CREATE TABLE Country (
    CountryID INT, -- Country ID field, integer
    CountryName VARCHAR(100), -- Country name field, string with a maximum length of 100
    PRIMARY KEY (CountryID) -- Setting the CountryID as the primary key of this table
);

-- Creating a "State" table to store state/province information
CREATE TABLE State (
    StateID INT, -- State/province ID field, integer
    StateName VARCHAR(100), -- State/province name field, string with a maximum length of 100
    CountryID INT, -- Country ID field, integer, corresponds to the CountryID field in the Country table.
    PRIMARY KEY (StateID), -- Setting the StateID as the primary key of this table
    FOREIGN KEY (CountryID) REFERENCES Country(CountryID) -- Setting the CountryID field as the foreign key, referencing the CountryID field in the Country table
);

-- Creating a "City" table to store city information
CREATE TABLE City (
    CityID INT, -- City ID field, integer
    CityName VARCHAR(100), -- City name field, string with a maximum length of 100
    StateID INT, -- State/province ID field, integer, corresponds to the StateID field in the State table
    PRIMARY KEY (CityID), -- Setting the CityID as the primary key of this table
    FOREIGN KEY (StateID) REFERENCES State(StateID) -- Setting the StateID field as the foreign key, referencing the StateID field in the State table
);
```

**Example Explanation**: In the above example, there are three tables: the `Country` table, the `State` table, and the `City` table. The `State` table has a field, `CountryID`, which is the primary key of the `Country` table and is also the foreign key of the `State` table. The `City` table has a field, `StateID`, which is the `State` table's primary key and the `City` table's foreign key. This forms a multi-level foreign key situation.
