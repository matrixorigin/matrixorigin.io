# HNSW Vector Index Demo

## Overview

This tutorial demonstrates **HNSW (Hierarchical Navigable Small World)** vector indexing in MatrixOne Python SDK. HNSW is a graph-based approximate nearest neighbor search algorithm that provides excellent search performance with high recall rates.

**HNSW Advantages:**
- ⚡ **Very Fast Search**: Superior query performance
- 🎯 **High Recall**: >99% accuracy for nearest neighbor search
- 🚀 **No Training Required**: Unlike IVF, no clustering training needed
- 📊 **Predictable Performance**: Consistent query latency

**HNSW Characteristics:**
- 🔒 **Read-Only (Current Limitation)**: Cannot insert/update/delete after index creation
- 🔑 **BigInteger Primary Key Required**: Must use `BigInteger` type
- 💾 **Higher Memory Usage**: Graph structure requires more memory than IVF

!!! info "Future Enhancement: Incremental Updates Coming Soon"
    **Good News:** MatrixOne will soon support **incremental updates** for HNSW indexes!
    
    - 🔄 **Async Index Updates**: New vectors will be added to the index asynchronously
    - ➕ **Insert Support**: You'll be able to insert new vectors after index creation
    - 🔧 **Update Support**: Modify existing vectors without rebuilding the entire index
    - 🗑️ **Delete Support**: Remove vectors from the index
    
    **Current Status:** This feature is under development and not yet available. For now, HNSW indexes remain read-only after creation. Once the index is created, you cannot insert or modify data without dropping and rebuilding the index.
    
    **Workaround for Now:** Use IVF index if you need dynamic updates, or plan to rebuild HNSW index periodically.

!!! note "MatrixOne Python SDK Documentation"
    For complete API reference, see [MatrixOne Python SDK Documentation](https://matrixone.readthedocs.io/en/latest/)

## Before You Start

### Prerequisites

- MatrixOne database installed and running
- Python 3.7 or higher
- MatrixOne Python SDK installed

### Install SDK

```bash
pip3 install matrixone-python-sdk
```

## Complete Working Example

Save this as `hnsw_demo.py` and run with `python3 hnsw_demo.py`:

```python
from matrixone import Client
from matrixone.config import get_connection_params
from matrixone.sqlalchemy_ext import create_vector_column
from matrixone.orm import declarative_base
from sqlalchemy import BigInteger, Column, String
import numpy as np
import time

np.random.seed(42)

print("=" * 70)
print("MatrixOne HNSW Vector Index Demo")
print("=" * 70)

# Connect to database
host, port, user, password, database = get_connection_params(database='demo')
client = Client()
client.connect(host=host, port=port, user=user, password=password, database=database)
print(f"✓ Connected to database")

# Define table with BigInteger primary key (HNSW requirement!)
Base = declarative_base()

class Document(Base):
    __tablename__ = "hnsw_demo_docs"
    
    id = Column(BigInteger, primary_key=True)  # Must be BigInteger!
    title = Column(String(200))
    category = Column(String(100))
    embedding = create_vector_column(64, "f32")

print(f"✓ Defined table with BigInteger primary key (HNSW requirement)")

# Create table
client.drop_table(Document)
client.create_table(Document)

# IMPORTANT: Insert data BEFORE creating HNSW index
documents = [
    {
        "id": i + 1,
        "title": f"Document {i + 1}",
        "category": f"Category_{i % 5}",
        "embedding": np.random.rand(64).astype(np.float32).tolist()
    }
    for i in range(200)
]

client.batch_insert(Document, documents)
print(f"✓ Inserted {len(documents)} documents (BEFORE creating index)")

# Enable HNSW and create index
client.vector_ops.enable_hnsw()

client.vector_ops.create_hnsw(
    Document,  # Using model
    "idx_embedding_hnsw",
    "embedding",
    m=16,
    ef_construction=200,
    ef_search=50,
    op_type="vector_l2_ops"
)
print("✓ HNSW index created")

# Search with ORM-style query
query_vector = np.random.rand(64).astype(np.float32).tolist()
results = client.query(
    Document.id,
    Document.title,
    Document.embedding.l2_distance(query_vector).label('distance')
).order_by('distance').limit(5).all()

print(f"\n✓ Found {len(results)} similar documents:")
for i, row in enumerate(results, 1):
    print(f"  {i}. ID: {row.id}, Distance: {row.distance:.4f}")

# Cleanup
client.disconnect()
print("\n✅ Demo completed!")
```

## Key Concepts

### 1. HNSW Requirements

#### BigInteger Primary Key (Required!)

```python
class Document(Base):
    id = Column(BigInteger, primary_key=True)  # ✅ Must be BigInteger
    # id = Column(Integer, primary_key=True)  # ❌ Won't work with HNSW!
```

**Why?** HNSW algorithm requires 64-bit integer IDs for graph node references.

#### Read-Only After Creation (Current Limitation)

!!! warning "Current Limitation: Read-Only Index"
    **IMPORTANT:** In the current version, once an HNSW index is created, the table becomes read-only for that indexed column. You cannot insert, update, or delete vectors.
    
    **Future Update:** Incremental update support with async index updates is coming soon!

```python
# ✅ Correct workflow (Current Version):
client.create_table(Document)
client.batch_insert(Document, all_data)  # Insert ALL data first
client.vector_ops.create_hnsw(...)       # Then create index
# Now table is READ-ONLY!

# ❌ After index creation, CANNOT (until incremental update is released):
# - Insert new vectors
# - Update existing vectors  
# - Delete vectors

# ✅ To modify data (Current Workaround):
# 1. Drop HNSW index
# 2. Modify data (insert/update/delete)
# 3. Recreate HNSW index
```

**Current Workaround:**

```python
def update_data_with_hnsw(client, Model, new_data):
    """Update data when using HNSW index (current version)"""
    
    # Step 1: Drop existing HNSW index
    client.vector_ops.drop(table_name, "idx_hnsw")
    print("✓ Dropped HNSW index")
    
    # Step 2: Now you can modify data
    client.batch_insert(Model, new_data)
    print("✓ Inserted new data")
    
    # Step 3: Recreate HNSW index
    client.vector_ops.create_hnsw(
        Model, "idx_hnsw_v2", "embedding",
        m=16, ef_construction=200, ef_search=50,
        op_type="vector_l2_ops"
    )
    print("✓ HNSW index recreated")

# Future (when incremental update is available):
# Just insert data directly, index will update asynchronously!
# client.batch_insert(Model, new_data)  # Will work!
```

### 2. Create HNSW Index

```python
client.vector_ops.enable_hnsw()  # Enable HNSW first

client.vector_ops.create_hnsw(
    Model,              # Table model or table name string
    index_name,         # Index name
    vector_column,      # Vector column name
    m=16,              # Number of connections (default: 16)
    ef_construction=200,  # Construction parameter (default: 200)
    ef_search=50,      # Search parameter (default: 50)
    op_type="vector_l2_ops"  # Distance metric
)
```

### 3. HNSW Parameters

#### m (Number of Connections)

- **What it does**: Number of bi-directional links per node in the graph
- **Impact**: Higher m = better recall, slower construction, more memory

| m Value | Recall | Construction Speed | Memory | Use Case |
|---------|--------|-------------------|--------|----------|
| 4-8 | ~95% | Fast | Low | Fast approximate search |
| 16 | ~99% | Medium | Medium | **Recommended default** |
| 32-64 | ~99.5%+ | Slow | High | High-precision search |

#### ef_construction (Index Quality)

- **What it does**: Dynamic candidate list size during index construction
- **Impact**: Higher value = better quality index, slower construction

| ef_construction | Quality | Construction Speed | Recommendation |
|-----------------|---------|-------------------|----------------|
| 100-200 | Good | Fast | Quick setup |
| 200-500 | Better | Medium | **Recommended (200)** |
| 500+ | Best | Slow | High-precision needs |

#### ef_search (Search Quality)

- **What it does**: Dynamic candidate list size during search
- **Impact**: Higher value = better recall, slower search

| ef_search | Recall | Search Speed | Use Case |
|-----------|--------|--------------|----------|
| 10-50 | Good | Fast | Speed-critical |
| 50-100 | Better | Medium | **Balanced (default 50)** |
| 100+ | Best | Slower | Precision-critical |

## Query Methods

### Method 1: vector_ops.similarity_search()

Low-level API for direct vector similarity search:

```python
results = client.vector_ops.similarity_search(
    Document,           # Model or table name
    vector_column="embedding",
    query_vector=query_vector,
    limit=10,
    distance_type="l2"  # or "cosine", "ip"
)

# Returns list of tuples: (id, title, category, ..., distance)
for row in results:
    id, title, category, distance = row[0], row[1], row[2], row[-1]
    print(f"ID: {id}, Distance: {distance:.4f}")
```

### Method 2: client.query() with ORM

SQLAlchemy-style ORM query (more flexible):

```python
results = client.query(
    Document.id,
    Document.title,
    Document.embedding.l2_distance(query_vector).label('distance')
).order_by('distance').limit(10).all()

# Returns list of row objects with attributes
for row in results:
    print(f"ID: {row.id}, Distance: {row.distance:.4f}")
```

**Advantages of ORM Method:**
- ✅ Support filters (`.filter(Document.category == "Tech")`)
- ✅ Easy sorting and pagination
- ✅ Type-safe attribute access
- ✅ Combine with WHERE conditions

## Usage Examples

### Basic Similarity Search

```python
# Generate query vector
query_vector = np.random.rand(64).astype(np.float32).tolist()

# Search top 10 similar documents
results = client.query(
    Document.id,
    Document.title,
    Document.embedding.l2_distance(query_vector).label('distance')
).order_by('distance').limit(10).all()

for i, row in enumerate(results, 1):
    print(f"{i}. {row.title} - Distance: {row.distance:.4f}")
```

### Search with Category Filter

```python
# Find similar documents in "Technology" category only
results = client.query(
    Document.id,
    Document.title,
    Document.category,
    Document.embedding.l2_distance(query_vector).label('distance')
).filter(
    Document.category == "Technology"
).order_by('distance').limit(10).all()
```

### Search with Multiple Filters

```python
# Combine multiple conditions
results = client.query(
    Document.id,
    Document.title,
    Document.embedding.l2_distance(query_vector).label('distance')
).filter(
    Document.category == "Science"
).filter(
    Document.doc_type == "Research"
).order_by('distance').limit(5).all()
```

### Search with Distance Threshold

```python
# Only return documents within distance 8.0
results = client.query(
    Document.id,
    Document.title,
    Document.embedding.l2_distance(query_vector).label('distance')
).filter(
    Document.embedding.l2_distance(query_vector) < 8.0
).order_by('distance').all()
```

## Distance Metrics

### L2 (Euclidean) Distance

General purpose distance metric:

```python
results = client.query(
    Document.id,
    Document.embedding.l2_distance(query_vector).label('distance')
).order_by('distance').limit(10).all()
```

**Use when:** General vector similarity, absolute differences matter

### Cosine Distance

Measures angular distance (direction similarity):

```python
# Normalize query vector first
norm = np.linalg.norm(query_vector)
normalized_query = (np.array(query_vector) / norm).tolist()

results = client.query(
    Document.id,
    Document.embedding.cosine_distance(normalized_query).label('distance')
).order_by('distance').limit(10).all()
```

**Use when:** Semantic similarity, magnitude doesn't matter (e.g., text embeddings)

### Inner Product

Dot product distance:

```python
results = client.query(
    Document.id,
    Document.embedding.inner_product(query_vector).label('distance')
).order_by('distance').limit(10).all()
```

**Use when:** Need both magnitude and direction information

## Performance Benchmarking

### Compare Query Methods

```python
import time

# Benchmark vector_ops method
times_vector_ops = []
for _ in range(10):
    test_vector = np.random.rand(64).astype(np.float32).tolist()
    start = time.time()
    results = client.vector_ops.similarity_search(
        Document, vector_column="embedding",
        query_vector=test_vector, limit=10
    )
    times_vector_ops.append((time.time() - start) * 1000)

print(f"vector_ops avg: {np.mean(times_vector_ops):.2f}ms")

# Benchmark ORM method
times_orm = []
for _ in range(10):
    test_vector = np.random.rand(64).astype(np.float32).tolist()
    start = time.time()
    results = client.query(
        Document.id,
        Document.embedding.l2_distance(test_vector).label('distance')
    ).order_by('distance').limit(10).all()
    times_orm.append((time.time() - start) * 1000)

print(f"ORM query avg: {np.mean(times_orm):.2f}ms")
```

### Test Different K Values

```python
for k in [5, 10, 20, 50]:
    start = time.time()
    results = client.query(
        Document.id,
        Document.embedding.l2_distance(query_vector).label('distance')
    ).order_by('distance').limit(k).all()
    elapsed = (time.time() - start) * 1000
    
    print(f"K={k}: {elapsed:.2f}ms")
```

## HNSW vs IVF Comparison

| Feature | HNSW | IVF |
|---------|------|-----|
| **Index Type** | Graph-based | Clustering-based |
| **Training Required** | No | Yes (k-means clustering) |
| **Primary Key** | BigInteger required | Any type |
| **Insert After Index** | ❌ No (coming soon!) | ✅ Yes |
| **Update/Delete** | ❌ No (coming soon!) | ✅ Yes |
| **Update Method** | 🔄 Async (future) | Immediate |
| **Search Speed** | ⚡ Very Fast | Fast |
| **Recall Quality** | 🎯 Excellent (>99%) | Good (>95%) |
| **Memory Usage** | Higher | Lower |
| **Construction Time** | Medium | Fast |
| **Best For** | Static datasets | Dynamic datasets |
| **Current Status** | Read-only | Fully dynamic |

### When to Use HNSW

✅ **Use HNSW when:**
- Static or infrequently updated datasets
- High recall requirements (>99%)
- Fast search is critical
- High-dimensional vectors (>128 dims)
- You can rebuild index when data changes

### When to Use IVF

✅ **Use IVF when:**
- Frequently updated datasets
- Need insert/update/delete operations
- Large datasets with memory constraints
- Acceptable recall (95-98%)
- Dynamic, growing datasets

## HNSW Parameter Tuning

### Parameter Selection Guide

```python
def get_hnsw_parameters(vector_count, use_case):
    """Get recommended HNSW parameters based on use case"""
    
    if use_case == "fast":
        # Optimize for speed
        return {"m": 8, "ef_construction": 100, "ef_search": 20}
    
    elif use_case == "balanced":
        # Balance speed and recall (recommended)
        return {"m": 16, "ef_construction": 200, "ef_search": 50}
    
    elif use_case == "high_recall":
        # Optimize for accuracy
        return {"m": 32, "ef_construction": 400, "ef_search": 100}
    
    else:
        # Default
        return {"m": 16, "ef_construction": 200, "ef_search": 50}

# Usage
params = get_hnsw_parameters(10000, "balanced")
client.vector_ops.create_hnsw(
    Model, index_name, column_name,
    m=params["m"],
    ef_construction=params["ef_construction"],
    ef_search=params["ef_search"]
)
```

### m Parameter Guide

**m = Number of connections per node**

- **m = 4-8**: Fast search, lower recall (~95%)
  - Construction: Very fast
  - Search: Very fast
  - Memory: Low
  - Use: Approximate search OK

- **m = 16**: Balanced (default, ~99% recall)
  - Construction: Medium
  - Search: Fast  
  - Memory: Medium
  - Use: **Recommended for most cases**

- **m = 32-64**: High recall (~99.5%+)
  - Construction: Slow
  - Search: Medium
  - Memory: High
  - Use: Precision-critical applications

### ef_construction Parameter Guide

**ef_construction = Candidate list size during construction**

- **100-200**: Fast construction, good quality
- **200-400**: Better quality (default 200)
- **400+**: Best quality, slow construction

**Rule of thumb:** Higher ef_construction improves index quality but increases build time linearly.

### ef_search Parameter Guide  

**ef_search = Candidate list size during search**

- **10-50**: Fast search, lower recall
- **50-100**: Balanced (default 50)
- **100+**: High recall, slower search

**Important:** You can adjust `ef_search` at query time without rebuilding the index (if API supports).

## Best Practices

### 1. Data Preparation (Critical!)

```python
# ✅ CORRECT: Insert ALL data first
client.create_table(Document)
client.batch_insert(Document, all_data)  # Insert 100% of data
client.vector_ops.create_hnsw(...)       # Then create index

# ❌ WRONG: Create index on empty/partial data
client.create_table(Document)
client.vector_ops.create_hnsw(...)       # Index on empty table
client.batch_insert(Document, data)       # Insert later - WON'T WORK!
```

### 2. Use BigInteger Primary Key

```python
# ✅ CORRECT
id = Column(BigInteger, primary_key=True)

# ❌ WRONG - HNSW won't work
id = Column(Integer, primary_key=True)
id = Column(String(50), primary_key=True)
```

### 3. Start with Default Parameters

```python
# Start with defaults, then tune if needed
client.vector_ops.create_hnsw(
    Model, index_name, column_name,
    m=16,               # Good default
    ef_construction=200,  # Good default
    ef_search=50,       # Good default
    op_type="vector_l2_ops"
)
```

### 4. Choose Appropriate Distance Metric

```python
# For text embeddings (semantic similarity)
op_type="vector_cosine_ops"  # Cosine similarity

# For general vectors (absolute distance)
op_type="vector_l2_ops"  # Euclidean distance

# For special cases
op_type="vector_ip_ops"  # Inner product
```

### 5. Plan for Data Updates (Current Limitation)

!!! warning "Read-Only Index in Current Version"
    **Current Limitation:** HNSW indexes are read-only. Once created, you cannot insert, update, or delete vectors without dropping the index.
    
    **Coming Soon:** Incremental update support with asynchronous index updates will be available in a future release!

**Current Workaround:** Drop, modify, rebuild

```python
def update_hnsw_index(client, Model, new_data):
    """Update HNSW index with new data (current version workaround)"""
    
    # 1. Drop existing HNSW index
    client.vector_ops.drop(table_name, "idx_hnsw")
    print("✓ Dropped HNSW index (now table is writable)")
    
    # 2. Insert/update/delete data
    client.batch_insert(Model, new_data)
    print("✓ Modified data")
    
    # 3. Recreate HNSW index
    client.vector_ops.create_hnsw(
        Model, "idx_hnsw_v2", "embedding",
        m=16, ef_construction=200, ef_search=50,
        op_type="vector_l2_ops"
    )
    print("✅ HNSW index rebuilt with new data")

# Future (when incremental update is released):
def update_hnsw_index_future(client, Model, new_data):
    """Future: Direct insert with async index update"""
    # Just insert - index will update asynchronously!
    client.batch_insert(Model, new_data)
    print("✅ Data inserted, index updating in background")
```

**Interim Solution:** If you need frequent updates, consider:
- Using **IVF index** instead (supports dynamic updates)
- Scheduling periodic HNSW rebuilds (e.g., nightly)
- Maintaining a separate "pending" table for new data, merge periodically

## Advanced Examples

### Multi-Metric Comparison

Compare all three distance metrics:

```python
metrics = [
    ("L2", lambda v: Document.embedding.l2_distance(v)),
    ("Cosine", lambda v: Document.embedding.cosine_distance(v)),
    ("Inner Product", lambda v: Document.embedding.inner_product(v))
]

for metric_name, metric_func in metrics:
    results = client.query(
        Document.id,
        metric_func(query_vector).label('distance')
    ).order_by('distance').limit(5).all()
    
    print(f"\n{metric_name} Distance:")
    for i, row in enumerate(results[:3], 1):
        print(f"  {i}. ID: {row.id}, Distance: {row.distance:.4f}")
```

### Combined Filters

```python
# Complex query: similarity + category + distance threshold
results = client.query(
    Document.id,
    Document.title,
    Document.category,
    Document.embedding.l2_distance(query_vector).label('distance')
).filter(
    Document.category.in_(["Technology", "Science"])
).filter(
    Document.embedding.l2_distance(query_vector) < 10.0
).order_by('distance').limit(20).all()
```

### Pagination

```python
page_size = 10
page_num = 2  # Second page

results = client.query(
    Document.id,
    Document.title,
    Document.embedding.l2_distance(query_vector).label('distance')
).order_by('distance').limit(page_size).offset((page_num - 1) * page_size).all()
```

## Troubleshooting

### Issue: "BigInteger primary key required"

**Cause:** Using wrong primary key type

**Solution:** Change to BigInteger

```python
# ❌ Wrong
class Doc(Base):
    id = Column(Integer, primary_key=True)

# ✅ Correct
class Doc(Base):
    id = Column(BigInteger, primary_key=True)
```

### Issue: "Cannot insert after creating HNSW index"

**Cause:** HNSW is read-only in current version

**Solution:** Insert all data before creating index, or use workaround

```python
# ✅ Solution 1: Correct workflow (Insert data first)
client.create_table(Document)
client.batch_insert(Document, all_data)  # ALL data
client.vector_ops.create_hnsw(...)       # Then index
# Now can only query

# ✅ Solution 2: Drop and rebuild to add data
client.vector_ops.drop(table_name, "idx_hnsw")  # Drop index
client.batch_insert(Document, new_data)         # Add data
client.vector_ops.create_hnsw(...)              # Rebuild index

# ✅ Solution 3: Use IVF if frequent updates needed
client.vector_ops.create_ivf(...)  # IVF supports updates
```

**Note:** Incremental update support (async) is coming in a future release, which will allow direct inserts after index creation!

### Issue: "Low recall / poor results"

**Cause:** Parameters too aggressive for speed

**Solution:** Increase ef_search or m

```python
# Try higher parameters
client.vector_ops.create_hnsw(
    Model, index_name, column_name,
    m=32,               # Increased from 16
    ef_construction=400,  # Increased from 200
    ef_search=100,      # Increased from 50
    op_type="vector_l2_ops"
)
```

### Issue: "Index creation too slow"

**Cause:** Parameters too high for large dataset

**Solution:** Reduce ef_construction

```python
# Faster construction
client.vector_ops.create_hnsw(
    Model, index_name, column_name,
    m=16,
    ef_construction=100,  # Reduced from 200
    ef_search=50,
    op_type="vector_l2_ops"
)
```

### Issue: "High memory usage"

**Cause:** High m value creates more connections

**Solution:** Reduce m or use IVF instead

```python
# Lower memory usage
client.vector_ops.create_hnsw(
    Model, index_name, column_name,
    m=8,  # Reduced from 16
    ef_construction=200,
    ef_search=50,
    op_type="vector_l2_ops"
)

# Or consider IVF for large datasets
client.vector_ops.create_ivf(
    table_name, index_name, column_name,
    lists=100,
    op_type="vector_l2_ops"
)
```

## Performance Tips

### 1. Normalize Vectors for Cosine Similarity

```python
def normalize_vector(vec):
    """Normalize vector for cosine similarity"""
    norm = np.linalg.norm(vec)
    return (np.array(vec) / norm).tolist() if norm > 0 else vec

# Use normalized vectors
query_normalized = normalize_vector(query_vector)
results = client.query(
    Document.id,
    Document.embedding.cosine_distance(query_normalized).label('distance')
).order_by('distance').limit(10).all()
```

### 2. Batch Process Queries

```python
# Process multiple queries efficiently
query_vectors = [np.random.rand(64).tolist() for _ in range(100)]

all_results = []
start = time.time()
for qv in query_vectors:
    results = client.query(
        Document.id,
        Document.embedding.l2_distance(qv).label('distance')
    ).order_by('distance').limit(10).all()
    all_results.append(results)

total_time = time.time() - start
print(f"Processed {len(query_vectors)} queries in {total_time:.2f}s")
print(f"Average: {(total_time/len(query_vectors))*1000:.2f}ms per query")
```

### 3. Use Filters to Reduce Search Space

```python
# Efficient: Filter by category first
results = client.query(
    Document.id,
    Document.embedding.l2_distance(query_vector).label('distance')
).filter(
    Document.category == "Technology"  # Indexed column - fast filter
).order_by('distance').limit(10).all()
```

## Reference

- [MatrixOne Python SDK Documentation](https://matrixone.readthedocs.io/en/latest/)
- [GitHub - MatrixOne Python Client](https://github.com/matrixorigin/matrixone/tree/main/clients/python)
- [Vector Search Guide](../Develop/Vector/vector_search.md)
- [CREATE INDEX HNSW](../Reference/SQL-Reference/Data-Definition-Language/create-index-hnsw.md)
- [HNSW Algorithm Paper](https://arxiv.org/abs/1603.09320)

## Summary

HNSW vector indexing in MatrixOne provides:

✅ **Superior Performance**: Fastest vector search with >99% recall  
✅ **No Training Required**: Direct index construction, no clustering  
✅ **Predictable Latency**: Consistent query performance  
✅ **High Quality Results**: Excellent accuracy for nearest neighbor search  
⚠️ **Read-Only (Current)**: Insert data before creating index  
⚠️ **BigInteger Primary Key**: Required for HNSW to work  
🔄 **Future: Incremental Updates**: Async update support coming soon!

**Current Best Use Cases:**
- Static datasets (catalogs, knowledge bases)
- Infrequently updated data (nightly/weekly refreshes)
- High-performance read-heavy workloads

**After Incremental Update Release:**
- Dynamic datasets with async updates
- Real-time data ingestion with background indexing
- Continuous data growth scenarios

**Perfect for:** Product catalogs, document search, image similarity, semantic search, and any high-recall vector search applications! 🚀

---

**Development Roadmap:** Once incremental update support is released, HNSW will combine the best of both worlds - superior search performance of HNSW with the flexibility of dynamic updates!

