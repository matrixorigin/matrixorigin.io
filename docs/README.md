# **MatrixOne Documentation**

Welcome to **MatrixOne** - the hyperconverged cloud & edge native database that consolidates transactional, analytical, and streaming workloads into a single system.

**🔀 Unique: Git for Data** - Clone, snapshot, and time-travel databases like Git for code. Version control for your data!

## 🌟 What is MatrixOne?

**MatrixOne** is designed for modern data infrastructure with:

- **🔄 Hyper-Converged Engine**: OLTP + OLAP + Time-Series in one database
- **☁️ Cloud-Edge Native**: Deploy anywhere - cloud, edge, or on-premises
- **⚡ Extreme Performance**: Vectorized execution with distributed transactions
- **🚀 Real-time HTAP**: Mixed workloads with real-time consistency
- **🐬 MySQL Compatible**: Easy migration with MySQL protocol support
- **🤖 AI-Ready**: Built-in vector search, fulltext search, and ML capabilities
- **🔀 Git for Data**: Snapshot, clone, branch, and time-travel for databases like Git for code

## 🚀 Quick Start

### 1️⃣ Install MatrixOne

Choose your preferred installation method:

- **[Docker Installation](MatrixOne/Get-Started/install-on-macos/install-on-macos-method3.md)** (Recommended) - Fastest way to get started
- **[Binary Package](MatrixOne/Get-Started/install-on-macos/install-on-macos-method2.md)** - Direct installation
- **[Build from Source](MatrixOne/Get-Started/install-on-macos/install-on-macos-method1.md)** - For developers

### 2️⃣ Connect and Query

After installation, connect to MatrixOne and run your first query:

```sql
-- Connect via MySQL client
mysql -h 127.0.0.1 -P 6001 -u root -p

-- Create a database
CREATE DATABASE quickstart;
USE quickstart;

-- Create a table
CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(50),
    email VARCHAR(100)
);

-- Insert data
INSERT INTO users VALUES (1, 'Alice', 'alice@example.com');

-- Query data
SELECT * FROM users;
```

### 3️⃣ Python SDK Quick Start (Recommended!)

**⭐ We recommend using the MatrixOne Python SDK** for the best experience with advanced features like ORM, vector search, fulltext search, snapshots, and cloning.

```bash
# Install Python SDK (recommended)
pip3 install matrixone-python-sdk
```

```python
from matrixone import Client

# Connect to MatrixOne
client = Client()
client.connect(host='127.0.0.1', port=6001, user='root', password='111', database='quickstart')

# Now you can use:
# - ORM for elegant data modeling
# - Vector search for AI applications
# - Fulltext search for text queries
# - Snapshots & cloning for Git-like workflows
# - And much more!
```

**📖 [Full SDK Documentation](https://matrixone.readthedocs.io/en/latest/)**

**💡 Why Python SDK?**
- 🎯 **All-in-One**: ORM + Vector + Fulltext + Snapshots in one package
- 🚀 **Modern API**: Pythonic interface for all MatrixOne features
- 📚 **Rich Features**: Access advanced capabilities not available in MySQL protocol
- 🔧 **Type Safety**: Better IDE support with type hints

### 4️⃣ Try Git for Data (Unique Feature!)

Experience database version control like Git:

```python
# Create a snapshot (like git commit)
client.snapshots.create(name="before_upgrade", level="database", database="quickstart")

# Clone database instantly (like git clone) - 1TB in 5 seconds!
client.clone.clone_database(target_db="quickstart_dev", source_db="quickstart")

# Time-travel to historical data (like git checkout)
client.clone.clone_database_with_snapshot(
    target_db="quickstart_yesterday",
    source_db="quickstart",
    snapshot_name="before_upgrade"
)

# Rollback if something goes wrong (like git reset)
client.restore.restore_database(
    snapshot_name="before_upgrade",
    account_name="sys",
    database_name="quickstart"
)
```

**Why This Matters:**
- ⚡ **Instant Operations**: Clone 1TB database in < 5 seconds
- 💰 **Zero Storage Overhead**: Copy-on-Write means 1TB stays 1TB, not 2TB
- 🛡️ **Zero Risk**: Test changes safely, rollback instantly if needed
- 🔀 **Team Productivity**: Each developer gets their own full database copy

## 📚 Hands-On Tutorials

### 🎯 Getting Started Tutorials

Perfect for beginners:

- **[PyMySQL CRUD Demo](MatrixOne/Tutorial/develop-python-crud-demo.md)** - Basic database operations with Python
- **[Java CRUD Demo](MatrixOne/Tutorial/develop-java-crud-demo.md)** - Java application development
- **[Golang CRUD Demo](MatrixOne/Tutorial/develop-golang-crud-demo.md)** - Go application development

### 🚀 Advanced Features Tutorials

Explore MatrixOne's unique capabilities:

#### 🤖 AI & Search Capabilities

- **[Vector Search (Pinecone-Compatible)](MatrixOne/Tutorial/pinecone-vector-demo.md)** - AI-powered similarity search
- **[IVF Vector Index](MatrixOne/Tutorial/ivf-index-health-demo.md)** - Efficient vector indexing and health monitoring
- **[HNSW Vector Index](MatrixOne/Tutorial/hnsw-vector-demo.md)** - High-performance graph-based vector search
- **[Fulltext Natural Search](MatrixOne/Tutorial/fulltext-natural-search-demo.md)** - Natural language text search
- **[Fulltext Boolean Search](MatrixOne/Tutorial/fulltext-boolean-search-demo.md)** - Precise boolean text queries
- **[Fulltext JSON Search](MatrixOne/Tutorial/fulltext-json-search-demo.md)** - Search within JSON data
- **[Hybrid Search](MatrixOne/Tutorial/hybrid-search-demo.md)** - Combine vector, fulltext, and SQL queries
- **[RAG Application](MatrixOne/Tutorial/rag-demo.md)** - Build Retrieval-Augmented Generation apps

#### ⚡ Performance & Scalability

- **[HTAP Application](MatrixOne/Tutorial/htap-demo.md)** - Real-time transactional and analytical workloads
- **[Instant Clone for Multi-Team Development](MatrixOne/Tutorial/efficient-clone-demo.md)** - ⚡ Clone 1TB in 5 seconds with zero storage overhead
- **[Safe Production Upgrade with Instant Rollback](MatrixOne/Tutorial/snapshot-rollback-demo.md)** - Zero-risk deployments with snapshots


---

## 📖 Documentation Guide

Choose your path based on your role and goals:

### 🆕 New to MatrixOne?

Start with **Overview** to learn about basic concepts, key features, and architecture:

- [MatrixOne Introduction](MatrixOne/Overview/matrixone-introduction.md) - What is MatrixOne and why use it
- [MatrixOne Architecture](MatrixOne/Overview/architecture/matrixone-architecture-design.md) - System design and components

### 🚀 Want to Get Started Quickly?

Jump to **Getting Started** to build a standalone MatrixOne and learn basic SQL:

- [Install MatrixOne](MatrixOne/Get-Started/install-standalone-matrixone.md) - Step-by-step installation
- [Basic SQL](MatrixOne/Get-Started/basic-sql.md) - Essential SQL commands

### 👨‍💻 Building Applications?

Select **Developing Guide** for tutorials and development guides:

- [Java CRUD Demo](MatrixOne/Tutorial/develop-java-crud-demo.md) - Java application development
- [Python CRUD Demo](MatrixOne/Tutorial/develop-python-crud-demo.md) - Python application development
- [See all tutorials above](#-hands-on-tutorials) - Including vector search, HTAP, and more

### 📚 Looking for Technical Reference?

Go to **Reference** for SQL statements, data types, functions, and catalog:

- [SQL Reference](MatrixOne/Reference/SQL-Reference/Data-Definition-Language/create-database.md) - Complete SQL syntax
- [Data Types](MatrixOne/Reference/Data-Types/data-types.md) - Supported data types

### 🎯 Quick Navigation Table

|  Overview   | Get Started  | Developing Guide | Reference   |
|  ---------- | ------------ |  --------------- | ----------- |
| [MatrixOne Introduction](MatrixOne/Overview/matrixone-introduction.md)  | [Install MatrixOne](MatrixOne/Get-Started/install-standalone-matrixone.md) | [Java CRUD demo](MatrixOne/Tutorial/develop-java-crud-demo.md) | [SQL Reference](MatrixOne/Reference/SQL-Reference/Data-Definition-Language/create-database.md) |
| [MatrixOne Architecture](MatrixOne/Overview/architecture/matrixone-architecture-design.md)  | [Basic SQL](MatrixOne/Get-Started/basic-sql.md) | [Python CRUD demo](MatrixOne/Tutorial/develop-python-crud-demo.md) | [Data Types](MatrixOne/Reference/Data-Types/data-types.md) |

## **Continuous Improvement**

Whether you're seeking fundamental concepts, step-by-step procedures, curated guides, or handy references, we're crafting content to accommodate your needs.

We warmly welcome contributions to MatrixOne documentation from everyone. Our community aims to streamline the contribution process, making it simple. Additionally, we'll provide updates every month.

You'll find an **Edit** button at the top of each page. Click on it to access a landing page with instructions for suggesting published document changes. These resources are yours for you to use. Your participation is not only encouraged but also crucial!

If you encounter any documentation issues, please feel free to create an Issue to inform us or directly submit a Pull Request to help us fix or update the content.

!!! note
    For how to make contributions to documentation, see [Contributing to MatrixOne Documentation](MatrixOne/Contribution-Guide/How-to-Contribute/contribute-documentation.md).

## **Join us!**

The MatrixOne community on [GitHub](https://github.com/matrixorigin/matrixone) is dynamic, enthusiastic, and well-informed. Engage in discussions, express your viewpoints, propose features, and delve into the code.

A similarly passionate community awaits you in the [MatrixOne Slack](https://matrixoneworkspace.slack.com/) and [MatrixOne](https://www.matrixorigin.cn/tutorials) channel.
