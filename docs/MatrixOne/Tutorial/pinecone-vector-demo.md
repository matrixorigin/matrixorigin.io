# Pinecone-Compatible Vector Search Demo

## Overview

This tutorial demonstrates how to use MatrixOne Python SDK's **Pinecone-compatible API** for vector operations. You'll learn how to:

- Create a table with 16-dimensional vectors
- Build an IVF vector index for efficient similarity search
- Use the Pinecone-compatible interface for queries and operations
- Perform metadata filtering with Pinecone-style operators
- Upsert and delete vectors using familiar Pinecone methods

**Key Advantage**: MatrixOne provides a Pinecone-compatible wrapper over its native vector capabilities, allowing easy migration from Pinecone while leveraging MatrixOne's enterprise database features.

!!! note "MatrixOne Python SDK Documentation"
    For complete API reference and advanced features, please refer to:

    - [MatrixOne Python SDK Documentation](https://matrixone.readthedocs.io/en/latest/)
    - [GitHub Repository](https://github.com/matrixorigin/matrixone/tree/main/clients/python)
    - [Test Examples](https://github.com/matrixorigin/matrixone/blob/main/clients/python/tests/online/test_pinecone_filter.py)

## Before You Start

### Prerequisites

- MatrixOne database installed and running ([Installation Guide](../Get-Started/install-standalone-matrixone.md))
- Python 3.8 or higher installed
- MySQL client for verification (optional)

### Install MatrixOne Python SDK

```bash
pip3 install matrixone-python-sdk
```

## Complete Working Example

Below is a complete, runnable example demonstrating all Pinecone-compatible features:

```python
from matrixone import Client
from matrixone.config import get_connection_params
from matrixone.sqlalchemy_ext import create_vector_column
from matrixone.orm import declarative_base
from sqlalchemy import BigInteger, Column, String, Float
import numpy as np

# Set random seed for reproducible results
np.random.seed(42)

print("=" * 70)
print("MatrixOne Pinecone Index Compatibility Demo")
print("=" * 70)

# Step 1: Connect to database
print("\nStep 1: Connect to MatrixOne Database")
print("-" * 70)

host, port, user, password, database = get_connection_params(database='demo')
client = Client()
client.connect(host=host, port=port, user=user, password=password, database=database)
print(f"✓ Successfully connected to database: {host}:{port}/{database}")

# Step 2: Define table structure
print("\nStep 2: Define Table Structure (16-dimensional vectors)")
print("-" * 70)

Base = declarative_base()

class DocumentTable(Base):
    """Document table with 16-dimensional vectors"""
    __tablename__ = "pinecone_demo_docs"

    id = Column(BigInteger, primary_key=True)
    title = Column(String(200))
    category = Column(String(100))
    content = Column(String(1000))
    score = Column(Float)
    embedding = create_vector_column(16, "f32")  # 16-dimensional vector

print(f"✓ Defined table: {DocumentTable.__tablename__}")
print(f"  - Primary key: id (BigInteger)")
print(f"  - Fields: title, category, content, score")
print(f"  - Vector: embedding (16-dimensional, float32)")

# Step 3: Create table
print("\nStep 3: Create Table")
print("-" * 70)

client.drop_table(DocumentTable)  # Drop old table if exists
client.create_table(DocumentTable)
print("✓ Table created successfully")

# Step 4: Prepare and insert initial records
print("\nStep 4: Prepare 3 Initial Records")
print("-" * 70)

initial_documents = [
    {
        "id": 1,
        "title": "Python Programming Basics",
        "category": "Programming",
        "content": "Python is an easy-to-learn high-level programming language...",
        "score": 4.5,
        "embedding": np.random.rand(16).astype(np.float32).tolist()
    },
    {
        "id": 2,
        "title": "Machine Learning Fundamentals",
        "category": "AI",
        "content": "Machine learning is a core technology of artificial intelligence...",
        "score": 4.8,
        "embedding": np.random.rand(16).astype(np.float32).tolist()
    },
    {
        "id": 3,
        "title": "Database Design Principles",
        "category": "Database",
        "content": "Good database design is the foundation for building efficient applications...",
        "score": 4.2,
        "embedding": np.random.rand(16).astype(np.float32).tolist()
    }
]

client.batch_insert(DocumentTable, initial_documents)
print(f"✓ Successfully inserted {len(initial_documents)} initial records")

# Step 5: Create IVF vector index
print("\nStep 5: Enable IVF and Create Vector Index")
print("-" * 70)

client.vector_ops.create_ivf(
    "pinecone_demo_docs",  # Table name
    "idx_embedding_ivf",   # Index name
    "embedding",           # Column name
    lists=2,               # Number of IVF lists
    op_type="vector_l2_ops"  # Use L2 distance
)
print("✓ IVF index created successfully")

# Step 6: Get Pinecone-compatible index object
print("\nStep 6: Get Pinecone-Compatible Index Object")
print("-" * 70)

pinecone_index = client.get_pinecone_index("pinecone_demo_docs", "embedding")
print("✓ Successfully obtained Pinecone-compatible index object")
```

### Key Steps Explained

#### 1. **Define Table with ORM**

```python
class DocumentTable(Base):
    __tablename__ = "pinecone_demo_docs"
    id = Column(BigInteger, primary_key=True)
    title = Column(String(200))
    category = Column(String(100))
    score = Column(Float)
    embedding = create_vector_column(16, "f32")  # 16-dim vector
```

#### 2. **Create IVF Index**

```python
client.vector_ops.create_ivf(
    table_name,    # Your table name
    index_name,    # Index name
    column_name,   # Vector column name
    lists=2,       # Number of clusters (adjust based on data size)
    op_type="vector_l2_ops"  # Distance metric
)
```

#### 3. **Get Pinecone Interface**

```python
pinecone_index = client.get_pinecone_index(table_name, vector_column)
```

This returns a Pinecone-compatible object with methods like `query()`, `upsert()`, `delete()`, etc.

## Pinecone API Usage Examples

### Vector Similarity Query

Perform basic vector similarity search:

```python
# Step 7: Perform vector similarity queries
query_vector = initial_documents[0]["embedding"]

# Basic query
results = pinecone_index.query(
    vector=query_vector,
    top_k=3,
    include_metadata=True
)

print(f"✓ Query returned {len(results.matches)} results:")
for i, match in enumerate(results.matches, 1):
    print(f"  {i}. ID: {match.id}")
    print(f"     Similarity score: {match.score:.4f}")
    print(f"     Title: {match.metadata['title']}")
    print(f"     Category: {match.metadata['category']}")
```

### Query with Metadata Filters

Use Pinecone-style filters to narrow search results:

#### Simple Equality Filter

```python
# Filter documents with category 'AI'
results_ai = pinecone_index.query(
    vector=query_vector,
    top_k=10,
    include_metadata=True,
    filter={"category": "AI"}
)
print(f"✓ Found {len(results_ai.matches)} AI documents")
```

#### Range Filter

```python
# Filter documents with score >= 4.5
results_high_score = pinecone_index.query(
    vector=query_vector,
    top_k=10,
    include_metadata=True,
    filter={"score": {"$gte": 4.5}}
)
print(f"✓ Found {len(results_high_score.matches)} high-score documents")
```

#### AND Filter (Multiple Conditions)

```python
# Filter: category 'AI' AND score > 4.0
results_combined = pinecone_index.query(
    vector=query_vector,
    top_k=10,
    include_metadata=True,
    filter={
        "$and": [
            {"category": "AI"},
            {"score": {"$gt": 4.0}}
        ]
    }
)
```

#### $in Operator

```python
# Query documents with category in ['AI', 'Programming']
results_in = pinecone_index.query(
    vector=query_vector,
    top_k=10,
    include_metadata=True,
    filter={"category": {"$in": ["AI", "Programming"]}}
)
```

#### $or Operator

```python
# Query: category 'AI' OR score < 4.3
results_or = pinecone_index.query(
    vector=query_vector,
    top_k=10,
    include_metadata=True,
    filter={
        "$or": [
            {"category": "AI"},
            {"score": {"$lt": 4.3}}
        ]
    }
)
```

### Upsert Operations

Upsert (insert or update) vectors:

```python
# Prepare data for upsert
upsert_data = [
    {
        "id": 2,  # Update existing record
        "title": "Advanced Deep Learning",
        "category": "AI",
        "content": "Deep learning uses multi-layer neural networks...",
        "score": 4.9,
        "embedding": np.random.rand(16).astype(np.float32).tolist()
    },
    {
        "id": 4,  # New record
        "title": "Cloud Native Architecture",
        "category": "Architecture",
        "content": "Cloud-native leverages containers and microservices...",
        "score": 4.6,
        "embedding": np.random.rand(16).astype(np.float32).tolist()
    }
]

# Perform upsert
pinecone_index.upsert(upsert_data)
print(f"✓ Successfully upserted {len(upsert_data)} records")
```

### Delete Operations

Delete vectors by ID:

```python
# Delete document with ID 5
delete_ids = [5]
pinecone_index.delete(delete_ids)
print(f"✓ Successfully deleted document(s) with ID: {delete_ids}")
```

### Get Index Statistics

Retrieve index information:

```python
stats = pinecone_index.describe_index_stats()
print(f"✓ Index statistics:")
print(f"  - Total vector count: {stats.get('total_vector_count', 'N/A')}")
print(f"  - Dimension: {stats.get('dimension', 'N/A')}")
```

### Query with Vector Values

Include vector values in query results:

```python
results_with_values = pinecone_index.query(
    vector=query_vector,
    top_k=2,
    include_metadata=True,
    include_values=True  # Include vector values
)

for match in results_with_values.matches:
    print(f"ID: {match.id}, Title: {match.metadata['title']}")
    if match.values:
        print(f"Vector (first 5 dims): {match.values[:5]}")
```

## Full Working Script

Save this as `pinecone_demo.py` and run with `python3 pinecone_demo.py`:

```python
from matrixone import Client
from matrixone.config import get_connection_params
from matrixone.sqlalchemy_ext import create_vector_column
from matrixone.orm import declarative_base
from sqlalchemy import BigInteger, Column, String, Float
import numpy as np

np.random.seed(42)

print("=" * 70)
print("MatrixOne Pinecone Index Compatibility Demo")
print("=" * 70)

# Connect to database
host, port, user, password, database = get_connection_params()
client = Client()
client.connect(host=host, port=port, user=user, password=password, database=database)

# Define table structure
Base = declarative_base()

class DocumentTable(Base):
    __tablename__ = "pinecone_demo_docs"
    id = Column(BigInteger, primary_key=True)
    title = Column(String(200))
    category = Column(String(100))
    content = Column(String(1000))
    score = Column(Float)
    embedding = create_vector_column(16, "f32")

# Create table
client.drop_table(DocumentTable)
client.create_table(DocumentTable)

# Insert initial data
initial_documents = [
    {
        "id": 1,
        "title": "Python Programming Basics",
        "category": "Programming",
        "content": "Python is an easy-to-learn high-level programming language...",
        "score": 4.5,
        "embedding": np.random.rand(16).astype(np.float32).tolist()
    },
    {
        "id": 2,
        "title": "Machine Learning Fundamentals",
        "category": "AI",
        "content": "Machine learning is a core technology...",
        "score": 4.8,
        "embedding": np.random.rand(16).astype(np.float32).tolist()
    },
    {
        "id": 3,
        "title": "Database Design Principles",
        "category": "Database",
        "content": "Good database design is the foundation...",
        "score": 4.2,
        "embedding": np.random.rand(16).astype(np.float32).tolist()
    }
]

client.batch_insert(DocumentTable, initial_documents)

# Create IVF index
client.vector_ops.create_ivf(
    "pinecone_demo_docs",
    "idx_embedding_ivf",
    "embedding",
    lists=2,
    op_type="vector_l2_ops"
)

# Get Pinecone-compatible index
pinecone_index = client.get_pinecone_index("pinecone_demo_docs", "embedding")

# Basic query
query_vector = initial_documents[0]["embedding"]
results = pinecone_index.query(
    vector=query_vector,
    top_k=3,
    include_metadata=True
)

print(f"\n✓ Query returned {len(results.matches)} results")

# Query with filter
results_ai = pinecone_index.query(
    vector=query_vector,
    top_k=10,
    include_metadata=True,
    filter={"category": "AI"}
)

print(f"✓ Found {len(results_ai.matches)} AI documents")

# Upsert new data
upsert_data = [
    {
        "id": 4,
        "title": "Cloud Native Architecture",
        "category": "Architecture",
        "content": "Cloud-native leverages containers...",
        "score": 4.6,
        "embedding": np.random.rand(16).astype(np.float32).tolist()
    }
]

pinecone_index.upsert(upsert_data)
print(f"✓ Upserted {len(upsert_data)} records")

# Get statistics
stats = pinecone_index.describe_index_stats()
print(f"✓ Total vectors: {stats.get('total_vector_count', 'N/A')}")

# Cleanup
client.disconnect()
print("\n✅ Demo completed!")
```

## Key Features Demonstrated

### ✨ Pinecone-Compatible API Capabilities

1. **Get Pinecone Index Interface**
   ```python
   pinecone_index = client.get_pinecone_index(table_name, vector_column)
   ```
   - Wraps existing MatrixOne table with Pinecone API
   - Works with any table that has an IVF vector index
   - Supports 16-dimensional (or any dimension) float32 vectors

2. **Query with Similarity Search**
   ```python
   results = pinecone_index.query(
       vector=query_vector,
       top_k=10,
       include_metadata=True,
       include_values=False,
       filter={"category": "AI"}
   )
   ```
   - Returns `results.matches` list with `id`, `score`, `metadata`, `values`
   - Supports metadata filtering
   - Configurable result format

3. **Metadata Filtering**
   - Support for Pinecone filter operators: `$eq`, `$ne`, `$lt`, `$gt`, `$lte`, `$gte`, `$in`, `$nin`
   - Logical operators: `$and`, `$or`
   - Filter by any metadata field during query

4. **Upsert Operations**
   ```python
   pinecone_index.upsert([
       {"id": 1, "title": "...", "embedding": [...]}
   ])
   ```
   - Batch insert/update with single API call
   - Automatic conflict resolution (update if ID exists)
   - All table columns mapped to metadata

5. **Delete Operations**
   ```python
   pinecone_index.delete([1, 2, 3])
   ```
   - Delete specific vectors by ID
   - Supports batch deletion

6. **Index Statistics**
   ```python
   stats = pinecone_index.describe_index_stats()
   ```
   - Get total vector count
   - Get index dimension
   - Check index health

## Pinecone Filter Operators

MatrixOne's Pinecone API supports standard filter operators:

```python
# Equality
filter={'category': {'$eq': 'Electronics'}}

# Inequality
filter={'price': {'$ne': 0}}

# Less than / Greater than
filter={'price': {'$lt': 500}}
filter={'price': {'$gte': 100}}

# In list
filter={'category': {'$in': ['Electronics', 'Furniture']}}

# Not in list
filter={'status': {'$nin': ['discontinued']}}

# Complex AND condition
filter={
    '$and': [
        {'category': {'$eq': 'Electronics'}},
        {'price': {'$lt': 1000}}
    ]
}

# Complex OR condition
filter={
    '$or': [
        {'category': {'$eq': 'Electronics'}},
        {'price': {'$lt': 50}}
    ]
}
```

## Distance Metrics

MatrixOne supports multiple distance metrics via IVF index creation:

```python
# L2 (Euclidean) Distance
client.vector_ops.create_ivf(
    table_name, index_name, column_name,
    lists=2,
    op_type="vector_l2_ops"  # L2 distance
)

# Cosine Similarity
client.vector_ops.create_ivf(
    table_name, index_name, column_name,
    lists=2,
    op_type="vector_cosine_ops"  # Cosine similarity
)

# Inner Product
client.vector_ops.create_ivf(
    table_name, index_name, column_name,
    lists=2,
    op_type="vector_ip_ops"  # Inner product
)
```

## Best Practices

### 1. Batch Upsert for Better Performance

```python
# Good: Batch upsert multiple vectors at once
vectors = [
    {'id': f'vec-{i}', 'values': generate_embedding(), 'metadata': {...}}
    for i in range(1000)
]
index.upsert(vectors=vectors)

# Avoid: Individual upserts in loop (slower)
for i in range(1000):
    index.upsert(vectors=[{'id': f'vec-{i}', 'values': generate_embedding()}])
```

### 2. Use Filters to Reduce Search Space

```python
# Efficient: Filter before vector search
results = index.query(
    vector=query_vec,
    top_k=5,
    filter={'category': {'$eq': 'Electronics'}}  # Narrows search space
)

# Less efficient: Filter after fetching all results
all_results = index.query(vector=query_vec, top_k=100)
filtered = [r for r in all_results['matches'] if r['metadata']['category'] == 'Electronics'][:5]
```

### 3. Choose Appropriate Metric

```python
# For semantic similarity (text embeddings)
metric='cosine'  # Normalized, range [-1, 1]

# For geometric distance
metric='euclidean'  # L2 distance

# For raw similarity scores
metric='dotproduct'  # Inner product
```

### 4. Include Only Needed Data

```python
# Efficient: Don't fetch vectors if not needed
results = index.query(
    vector=query_vec,
    top_k=10,
    include_values=False,  # Saves bandwidth
    include_metadata=True
)

# Less efficient: Always fetching vectors
results = index.query(
    vector=query_vec,
    top_k=10,
    include_values=True  # Larger response size
)
```

## Troubleshooting

### Issue: "Vector dimension mismatch"

**Solution**: Ensure all vectors have the same dimension as the index

```python
# Index created with 16 dimensions
index = PineconeIndex(client=client, index_name='idx', dimension=16)

# All upserted vectors must be 16-dimensional
vector_correct = np.random.rand(16).tolist()  # ✅ Correct
vector_wrong = np.random.rand(32).tolist()    # ❌ Wrong - will error
```

### Issue: "Filter not working as expected"

**Solution**: Use correct Pinecone filter syntax

```python
# Correct: Use Pinecone operators
filter={'category': {'$eq': 'Electronics'}}  # ✅ Correct

# Wrong: Direct comparison (not supported)
filter={'category': 'Electronics'}  # ❌ Wrong
```

### Issue: "No results returned from query"

**Solution**: Check if vectors exist and filter is not too restrictive

```python
# Check index stats
stats = index.describe_index_stats()
print(f"Total vectors: {stats['total_vector_count']}")

# Try query without filter first
results = index.query(vector=query_vec, top_k=5, filter=None)

# Then add filter incrementally
results = index.query(vector=query_vec, top_k=5, filter={'category': {'$eq': 'Electronics'}})
```

### Issue: "Metadata not returned in query results"

**Solution**: Set `include_metadata=True` in query

```python
# Correct: Include metadata flag
results = index.query(
    vector=query_vec,
    top_k=5,
    include_metadata=True  # ✅ Must set to True
)

# Wrong: Default is False
results = index.query(vector=query_vec, top_k=5)  # metadata will be None
```

### Issue: "Table or index not found"

**Solution**: Ensure table and IVF index exist before getting Pinecone interface

```python
# Verify table exists
try:
    client.create_table(DocumentTable)
except:
    print("Table already exists")

# Verify IVF index exists
try:
    client.vector_ops.create_ivf(table_name, index_name, column_name, lists=2)
except:
    print("Index already exists")

# Then get Pinecone interface
pinecone_index = client.get_pinecone_index(table_name, vector_column)
```

### Issue: "IVF index required"

**Solution**: Create IVF index before using Pinecone API

```python
# Must create IVF index first
client.vector_ops.create_ivf(
    "my_table",
    "idx_embedding",
    "embedding",
    lists=2,
    op_type="vector_l2_ops"
)

# Then can use Pinecone API
pinecone_index = client.get_pinecone_index("my_table", "embedding")
```

## Reference

- [MatrixOne Python SDK Documentation](https://matrixone.readthedocs.io/en/latest/)
- [GitHub - MatrixOne Python Client](https://github.com/matrixorigin/matrixone/tree/main/clients/python)
- [Vector Type Documentation](../Develop/Vector/vector_type.md)
- [Vector Search Guide](../Develop/Vector/vector_search.md)
- [CREATE INDEX IVFFLAT](../Reference/SQL-Reference/Data-Definition-Language/create-index-ivfflat.md)

