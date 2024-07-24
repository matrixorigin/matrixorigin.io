# C# Base Example

This document will guide you through how to build a simple application using C# and implement CRUD (Create, Read, Update, Delete) functionality.

## Prepare before you start

- Finished [installing and starting](../Get-Started/install-standalone-matrixone.md) MatrixOne

- Installed [.NET Core SDK](https://dotnet.microsoft.com/zh-cn/download)

- [MySQL Client](https://dev.mysql.com/downloads/installer/) installed

## Steps

### Step one: Create a C# app

Create an app using the dotnet command. For example, create a new app called myapp:

```
dotnet new console -o myapp 
```

Then switch to the myapp directory

### Step Two: Add the MySQL Connector/NET NuGet Package

Install the MySql.Data package using the NuGet package manager:

```
dotnet add package MySql.Data 
```

### Step Three: Connect Matrixone for Action

Write code to connect to Matrixone, build a student table, and add, delete, and change lookups. Write the following code in the Program.cs file:

```
using System; 
using MySql.Data.MySqlClient;
 
class Program {

    static void ExecuteSQL(MySqlConnection connection, string query)
    {
        using (MySqlCommand command = new MySqlCommand(query, connection))
        {
            command.ExecuteNonQuery();
        }
    }
    static void Main(string[] args)
    {
        Program n =new Program();
        string connectionString = "server=127.0.0.1;user=root;database=test;port=6001;password=111";
        using (MySqlConnection connection = new MySqlConnection(connectionString))
        {
            try{
            connection.Open();
            Console.WriteLine ("Connection already established");
            // build table
            ExecuteSQL(connection,"CREATE TABLE IF NOT EXISTS Student (id INT auto_increment PRIMARY KEY, name VARCHAR(255),age int,remark VARCHAR(255) )");
            Console.WriteLine("Build table succeeded!");
            // Insert data
            ExecuteSQL (connection, "INSERT INTO Student (name,age) VALUES ('Zhang San',22), ('Li Si',25), ('Zhao Wu',30)");
            Console.WriteLine ("Data inserted successfully!");
            // Update data
            ExecuteSQL(connection,"UPDATE Student SET remark = 'Updated' WHERE id = 1");
            Console.WriteLine("Update data successfully!");
            // Delete data
            ExecuteSQL(connection,"DELETE FROM Student WHERE id = 2");
            Console.WriteLine("Data deleted successfully!");
            //query data
            MySqlCommand command = new MySqlCommand("SELECT * FROM Student", connection);
            using (MySqlDataReader reader = command.ExecuteReader())
            {
                while (reader.Read())
                {
                    Console.WriteLine ($"Name: {reader["name"]}, age: {reader["age"]}, notes: {reader["remark"]}");
                }
            }
            Console.WriteLine("Data query succeeded!");
            }
            catch (MySqlException ex)
            {
                Console.WriteLine(ex.Message);

            }
            finally
            {
                Console.WriteLine ("Ready to Disconnect");
                connection.Close();
                Console.WriteLine("Disconnect succeeded!");
            }
 
            //connection.Close();
        }
    }
} 
```

### Step Four: Run the Program

Execute the command `dotnet run` at the terminal:

```
(base) admin@admindeMacBook-Pro myapp %dotnet run 
A connection has been established. 
Successfully inserted the data! 
Successfully updated the data! 
Successfully deleted the data! 
Name: Zhao Wu, age: 30, Remarks: 
Name: Zhang San, age: 22, Remarks: Updated 
Data query succeeded! 
Ready to disconnect
Disconnect succeeded! 
```

### Step five: Check the data

Use the Mysql client connection Matrixone to query the Student table:

```sql
mysql> select * from student;
+------+-----------+------+---------+
| id   | name      | age  | remark  |
+------+-----------+------+---------+
|    3 | Zhao Wu   |   30 | NULL    |
|    1 | Zhang San |   22 | Updated |
+------+--------+------+------------+
2 rows in set (0.00 sec)
```

As you can see, the data is returned correctly.