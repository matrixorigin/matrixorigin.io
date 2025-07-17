# Connecting to MatrixOne with TypeScript

MatrixOne supports connections via TypeScript.

This document will guide you on how to connect to MatrixOne using TypeScript.

## Prerequisites

- You have completed the [Install and Start MatrixOne](../../Get-Started/install-standalone-matrixone.md) setup.

- You have installed the [MySQL Client](https://dev.mysql.com/downloads/installer/).

## Connecting to MatrixOne Service with TypeScript

### Step 1: Create a Project Directory and Initialize It

```bash
mkdir ts-mo-demo
cd ts-mo-demo
npm init -y
```

### Step 2: Install Dependencies

```bash
npm install mysql2
npm install --save-dev typescript @types/node ts-node
```

### Step 3: Initialize the TypeScript Project

```bash
npx tsc --init
```

### Step 4: Create the Code Directory and File

```bash
mkdir src
touch src/index.ts
```

### Step 5: Connect to MatrixOne

```ts
//src/index.ts
const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '111',
    port: 6001
  });

  try {
    console.log('Connection successful');
  } catch (e) {
    console.error('Connection failed', e);
  } finally {
    await connection.end();
  }
}

main();
```

### Step 6: Run the Program

```bash
(base) admin@admindeMacBook-Pro ts-mo-demo % npx ts-node src/index.ts                     
Connection successful
```

## Reference Documentation

For an example of building a simple CRUD application with TypeScript and MatrixOne, refer to the [TypeScript Basic Example](../../Tutorial/typescript-crud-demo.md).