# C# Connections

MatrixOne supports C# connectivity and supports the MySQL Connector/NET driver.

This document will guide you through the process of connecting to MatrixOne using C#.

## Prepare for the start

- Completed [Installation and startup of MatrixOne](../../Get-Started/install-standalone-matrixone.md).

- Installed [. NET Core SDK](https://dotnet.microsoft.com/zh-cn/download).

- Installed [MySQL Client](https://dev.mysql.com/downloads/installer/).

## Connecting Matrixone

### Step 1: Create C# Application

Use the dotnet command to create a new console application. For example, create a new application called myapp.

```
dotnet new console -o myapp
```

Then switch to the myapp directory

### Step 2:Add MySQL Connector/NET NuGet Package

Install the MySql.Data package using the NuGet package manager.

```
dotnet add package MySql.Data
```

### Step 3: Connecting Matrixone

Write the following code in the Program.cs file.

```
using System;
using MySql.Data.MySqlClient;
 
class Program
{
    static void Main(string[] args)
    {
        Program n =new Program();
        string connectionString = "server=127.0.0.1;user=root;database=test;port=6001;password=111";
        using (MySqlConnection connection = new MySqlConnection(connectionString))
        {
            try{
            connection.Open();
            Console.WriteLine("Connection successfully established");
            }
            catch (MySqlException ex)
            {
                Console.WriteLine(ex.Message);
            }
            finally
            {
                connection.Close();
            }
        }
    }
}
```

### Step 4: Run the program

Execute the command `dotnet run` in the terminal.

```
(base) admin@admindeMacBook-Pro myapp % dotnet run    
Connection successfully established
```

## reference document

For an example of using C# to build a simple CRUD with MatrixOne, see [C# Basic Examples](...). /... /Tutorial/c-net-crud-demo.md).
