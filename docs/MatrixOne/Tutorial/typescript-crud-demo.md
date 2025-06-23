# Basic TypeScript Example

This document will guide you on how to build a simple application using **TypeScript** and implement CRUD (Create, Read, Update, Delete) functionality.

**TypeScript** is a superset of JavaScript developed by Microsoft. It adds a static type system and some object-oriented programming features to JavaScript, aiming to make large-scale application development more reliable and maintainable.

## Prerequisites

### Software Installation

Before you begin, ensure you have downloaded and installed the following software:

- Confirm you have completed the [Standalone Deployment of MatrixOne](../Get-Started/install-standalone-matrixone.md).

- Confirm you have installed the MySQL client.

### Environment Setup

1. Create a project directory and initialize it:

    ```bash
    mkdir ts-mo-demo
    cd ts-mo-demo
    npm init -y
    ```

2. Install dependencies:

    ```bash
    npm install mysql2
    npm install --save-dev typescript @types/node ts-node
    ```

3. Initialize the TypeScript project:

    ```
    npx tsc --init
    ```

4. Create the code directory and file:

    ```bash
    mkdir src
    touch src/index.ts
    ```

## Writing TypeScript to Connect to MatrixOne

```typescript
// src/index.ts
import mysql from 'mysql2/promise';

async function main() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '111',
    port: 6001,
    database: 'example_db',
    multipleStatements: true
  });

  try {

    // 1. Create a table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100)
      )
    `);
    console.log('Table created successfully');

    // 2. Insert data
    await connection.query(`INSERT INTO users (name, email) VALUES (?, ?)`, ['Alice', 'alice@example.com']);
    await connection.query(`INSERT INTO users (name, email) VALUES (?, ?)`, ['Bob', 'bob@example.com']);
    console.log('Data inserted successfully');

    // 3. Update data
    await connection.query(`UPDATE users SET email = ? WHERE name = ?`, ['alice@newmail.com', 'Alice']);
    console.log('Data updated successfully');

    // 4. Delete data
    await connection.query(`DELETE FROM users WHERE name = ?`, ['Bob']);
    console.log('Data deleted successfully');

    // 5. Query data
    const [rows] = await connection.query(`SELECT * FROM users`);
    console.log('Query results:', rows);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
    console.log('Database connection closed');
  }
}

main();
```

## Running the Script

```bash
(base) admin@admindeMacBook-Pro ts-mysql-demo % npx ts-node src/index.ts
Table created successfully
Data inserted successfully
Data updated successfully
Data deleted successfully
Query results: [ { id: 1, name: 'Alice', email: 'alice@newmail.com' } ]
Database connection closed
```