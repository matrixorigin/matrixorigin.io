# IVF Index Health Check Demo

## Overview

This tutorial demonstrates **IVF (Inverted File) index health monitoring and optimization** in MatrixOne Python SDK. Regular health checks ensure optimal vector search performance and help identify when index rebuilding is needed.

!!! danger "Critical Issue: Index Creation Timing"
    **IMPORTANT:** A common problem in production is creating IVF indexes **too early**:
    
    If you create an IVF index when the table is **empty** or has **very little data**, the index will have poor centroid distribution. This leads to degraded performance that persists even after adding more data.
    
    **Solution:** Always insert a representative amount of data (1000+ vectors) **before** creating the IVF index. If you already created an index too early, use this monitoring tool to detect the issue and rebuild the index.

## ⚠️ Why Index Creation Timing Matters

### ❌ Problems with Early Index Creation

**If you create an IVF index when:**
- 📉 There is **no data** in the table
- 📉 There is **very little data** (< 100 vectors)
- 📉 Data volume is **much smaller** than expected production size

**You may experience:**
- 🔴 **Insufficient centroids**: Not enough data to properly initialize all centroids
- 🔴 **Poor distribution**: Vectors clustered unevenly across centroids
- 🔴 **Empty centroids**: Some centroids never get assigned any vectors
- 🔴 **Degraded performance**: Queries become slower as data grows
- 🔴 **Imbalanced load**: Some centroids overloaded while others are empty

### ✅ Recommended Approach

**Best Practice:**
1. ✅ Insert a representative amount of data first (at least 1000+ vectors)
2. ✅ Then create the IVF index with appropriate `lists` parameter
3. ✅ Use this health monitoring tool to evaluate index quality
4. ✅ Rebuild the index if health metrics indicate issues

**Example of Bad vs Good:**

```python
# ❌ BAD: Create index on empty table
client.create_table(VectorDocument)
client.vector_ops.create_ivf(table_name, index_name, column_name, lists=100)
# Then insert data later → Poor distribution!

# ✅ GOOD: Insert data first, then create index
client.create_table(VectorDocument)
client.batch_insert(VectorDocument, initial_data)  # Insert 10K+ vectors
client.vector_ops.create_ivf(table_name, index_name, column_name, lists=100)
# Index learns from actual data distribution → Good performance!
```

### 🔍 How This Tool Helps

This demo shows you how to:
- **Detect** poor index health using `get_ivf_stats()`
- **Evaluate** centroid distribution and balance ratio
- **Decide** when index rebuild is necessary
- **Rebuild** indexes with optimized parameters

**Why Monitor IVF Index Health?**

Even with proper initial creation, index health can degrade over time:
- ⚠️ As you insert, update, or delete vector data
- ⚠️ When data distribution changes
- ⚠️ After bulk data imports

**This Demo Covers:**
- ✅ Create IVF index with configurable parameters
- ✅ Monitor centroid distribution and load balance
- ✅ Analyze health metrics and detect issues
- ✅ Rebuild indexes when needed
- ✅ Best practices for production monitoring

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

Save this as `ivf_health_demo.py` and run with `python3 ivf_health_demo.py`:

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
print("MatrixOne IVF Index Health Check Demo")
print("=" * 70)

# Connect to database
host, port, user, password, database = get_connection_params(database='demo')
client = Client()
client.connect(host=host, port=port, user=user, password=password, database=database)
print(f"✓ Connected to database")

# Define table with 128-dimensional vectors
Base = declarative_base()

class VectorDocument(Base):
    __tablename__ = "ivf_health_demo_docs"
    id = Column(BigInteger, primary_key=True)
    title = Column(String(200))
    category = Column(String(100))
    embedding = create_vector_column(128, "f32")

# Create table and insert data
client.drop_table(VectorDocument)
client.create_table(VectorDocument)

initial_docs = [
    {
        "id": i + 1,
        "title": f"Document {i + 1}",
        "category": f"Category_{i % 5}",
        "embedding": np.random.rand(128).astype(np.float32).tolist()
    }
    for i in range(100)
]

client.batch_insert(VectorDocument, initial_docs)
print(f"✓ Inserted {len(initial_docs)} documents")

# Create IVF index
client.vector_ops.create_ivf(
    "ivf_health_demo_docs",
    "idx_embedding_ivf",
    "embedding",
    lists=10,
    op_type="vector_l2_ops"
)
print("✓ IVF index created with 10 lists")

time.sleep(1)

# Get IVF statistics
stats = client.vector_ops.get_ivf_stats("ivf_health_demo_docs", "embedding")

# Analyze distribution
distribution = stats['distribution']
centroid_counts = distribution['centroid_count']
total_centroids = len(centroid_counts)
total_vectors = sum(centroid_counts)
min_count = min(centroid_counts) if centroid_counts else 0
max_count = max(centroid_counts) if centroid_counts else 0
balance_ratio = max_count / min_count if min_count > 0 else float('inf')

print(f"\n📊 Index Health:")
print(f"  - Total centroids: {total_centroids}")
print(f"  - Total vectors: {total_vectors}")
print(f"  - Balance ratio: {balance_ratio:.2f}")

if balance_ratio > 2.0:
    print(f"  ⚠️  WARNING: Balance ratio high ({balance_ratio:.2f})")
else:
    print(f"  ✅ PASS: Good balance")

# Cleanup
client.disconnect()
print("\n✅ Demo completed!")
```

## Key Concepts

### 1. IVF Index Structure

IVF index organizes vectors into clusters (centroids):

```
IVF Index with lists=10
├── Centroid 0: [Vector 1, Vector 5, Vector 12, ...]  → 15 vectors
├── Centroid 1: [Vector 2, Vector 8, Vector 19, ...]  → 12 vectors
├── Centroid 2: [Vector 3, Vector 9, ...]             → 8 vectors
├── ...
└── Centroid 9: [Vector 4, Vector 7, ...]             → 11 vectors
```

**Ideal**: All centroids have similar number of vectors (balanced load)

### 2. Get IVF Statistics

```python
stats = client.vector_ops.get_ivf_stats(table_name, vector_column)
```

**Returns:**
```python
{
    'database': 'demo',
    'table_name': 'ivf_health_demo_docs',
    'column_name': 'embedding',
    'index_tables': {
        'centroids': '__mo_ivf_centroids_xxx',
        'index': '__mo_ivf_index_xxx'
    },
    'distribution': {
        'centroid_id': [0, 1, 2, ...],
        'centroid_count': [15, 12, 8, ...],
        'centroid_version': [1, 1, 1, ...]
    }
}
```

### 3. Health Metrics

#### Load Balance Ratio

```python
balance_ratio = max_vectors_per_centroid / min_vectors_per_centroid
```

**Health Levels:**
- 🟢 **Excellent** (< 1.5): Optimal performance
- 🟡 **Good** (1.5 - 2.0): Acceptable performance
- 🟠 **Fair** (2.0 - 3.0): Monitor closely
- 🔴 **Poor** (> 3.0): Rebuild recommended

#### Utilization

```python
utilization = total_vectors / total_centroids
```

**Guidelines:**
- 🔴 **Too Low** (< 5): Too many centroids, reduce `lists`
- 🟢 **Optimal** (10 - 100): Good efficiency
- 🟡 **High** (> 100): Consider more `lists`

## Health Check Examples

### Basic Health Check

```python
# Get statistics
stats = client.vector_ops.get_ivf_stats(table_name, vector_column)

# Extract metrics
distribution = stats['distribution']
centroid_counts = distribution['centroid_count']

# Calculate health metrics
total_vectors = sum(centroid_counts)
min_count = min(centroid_counts)
max_count = max(centroid_counts)
balance_ratio = max_count / min_count

print(f"Balance Ratio: {balance_ratio:.2f}")
if balance_ratio > 2.0:
    print("⚠️  WARNING: Index needs optimization")
else:
    print("✅ Index is healthy")
```

### Comprehensive Health Check

```python
def check_ivf_health(client, table_name, vector_column, expected_lists):
    """Comprehensive IVF index health check"""
    
    stats = client.vector_ops.get_ivf_stats(table_name, vector_column)
    distribution = stats['distribution']
    
    centroid_ids = distribution['centroid_id']
    centroid_counts = distribution['centroid_count']
    centroid_versions = distribution['centroid_version']
    
    # Metrics
    total_centroids = len(centroid_counts)
    total_vectors = sum(centroid_counts)
    min_count = min(centroid_counts) if centroid_counts else 0
    max_count = max(centroid_counts) if centroid_counts else 0
    avg_count = total_vectors / total_centroids if total_centroids > 0 else 0
    balance_ratio = max_count / min_count if min_count > 0 else float('inf')
    empty_centroids = sum(1 for c in centroid_counts if c == 0)
    
    # Health checks
    issues = []
    warnings = []
    
    # Check centroid count
    if total_centroids != expected_lists:
        issues.append(f"Centroid count mismatch: expected {expected_lists}, found {total_centroids}")
    
    # Check balance
    if balance_ratio > 3.0:
        issues.append(f"Critical imbalance: ratio {balance_ratio:.2f}")
    elif balance_ratio > 2.0:
        warnings.append(f"Moderate imbalance: ratio {balance_ratio:.2f}")
    
    # Check empty centroids
    if empty_centroids > 0:
        warnings.append(f"{empty_centroids} empty centroids found")
    
    # Check version consistency
    if len(set(centroid_versions)) > 1:
        warnings.append(f"Inconsistent versions: {set(centroid_versions)}")
    
    # Health status
    if issues:
        health = "CRITICAL"
    elif warnings:
        health = "NEEDS_ATTENTION"
    else:
        health = "HEALTHY"
    
    return {
        'health': health,
        'metrics': {
            'total_centroids': total_centroids,
            'total_vectors': total_vectors,
            'avg_count': avg_count,
            'balance_ratio': balance_ratio,
            'empty_centroids': empty_centroids
        },
        'issues': issues,
        'warnings': warnings
    }

# Usage
health_report = check_ivf_health(client, "my_table", "embedding", expected_lists=10)
print(f"Health Status: {health_report['health']}")
print(f"Balance Ratio: {health_report['metrics']['balance_ratio']:.2f}")
```

### Monitor After Data Changes

```python
# Before bulk insert
stats_before = client.vector_ops.get_ivf_stats(table_name, vector_column)
balance_before = calculate_balance_ratio(stats_before)

# Insert new data
client.batch_insert(Model, new_data)

# After bulk insert
time.sleep(1)  # Allow index to update
stats_after = client.vector_ops.get_ivf_stats(table_name, vector_column)
balance_after = calculate_balance_ratio(stats_after)

# Compare
if balance_after > balance_before * 1.2:
    print("⚠️  Balance degraded by >20%, consider rebuild")
```

## Index Rebuild Strategies

### Strategy 1: Calculate Optimal Lists

```python
# Rule of thumb: lists ≈ √(number of vectors)
total_vectors = 10000
optimal_lists = int(np.sqrt(total_vectors))  # = 100

client.vector_ops.create_ivf(
    table_name, index_name, column_name,
    lists=optimal_lists,
    op_type="vector_l2_ops"
)
```

### Strategy 2: Zero-Downtime Rebuild

```python
# Step 1: Create new index with different name
client.vector_ops.create_ivf(
    table_name,
    "idx_embedding_new",  # New name
    column_name,
    lists=new_optimal_lists,
    op_type="vector_l2_ops"
)

# Step 2: Verify new index works
pinecone_index_new = client.get_pinecone_index(table_name, column_name)
results = pinecone_index_new.query(test_vector, top_k=10)

# Step 3: Drop old index only after verification
if len(results.matches) > 0:
    client.vector_ops.drop(table_name, "idx_embedding_old")
    print("✅ Old index dropped, new index active")
```

### Strategy 3: Scheduled Maintenance

```python
import schedule

def rebuild_if_needed():
    stats = client.vector_ops.get_ivf_stats(table_name, vector_column)
    balance_ratio = calculate_balance_ratio(stats)
    
    if balance_ratio > 2.5:
        print(f"⚠️  Balance ratio {balance_ratio:.2f}, rebuilding...")
        rebuild_index(table_name, vector_column)
    else:
        print(f"✅ Health OK (ratio: {balance_ratio:.2f})")

# Run daily at 2 AM
schedule.every().day.at("02:00").do(rebuild_if_needed)
```

## Production Monitoring

### Set Up Alerts

```python
def check_and_alert(client, table_name, vector_column, threshold=2.5):
    """Check index health and send alert if needed"""
    
    stats = client.vector_ops.get_ivf_stats(table_name, vector_column)
    distribution = stats['distribution']
    counts = distribution['centroid_count']
    
    balance_ratio = max(counts) / min(counts) if min(counts) > 0 else float('inf')
    
    if balance_ratio > threshold:
        # Send alert (email, Slack, etc.)
        send_alert(
            subject=f"IVF Index Health Alert: {table_name}",
            message=f"Balance ratio {balance_ratio:.2f} exceeds threshold {threshold}"
        )
        return False
    
    return True
```

### Track Metrics Over Time

```python
import datetime

def log_health_metrics(client, table_name, vector_column):
    """Log health metrics to monitoring system"""
    
    stats = client.vector_ops.get_ivf_stats(table_name, vector_column)
    distribution = stats['distribution']
    counts = distribution['centroid_count']
    
    metrics = {
        'timestamp': datetime.datetime.now(),
        'table': table_name,
        'total_vectors': sum(counts),
        'total_centroids': len(counts),
        'balance_ratio': max(counts) / min(counts) if min(counts) > 0 else 0,
        'empty_centroids': sum(1 for c in counts if c == 0)
    }
    
    # Send to monitoring system (Prometheus, CloudWatch, etc.)
    send_to_monitoring(metrics)
    
    return metrics
```

### Dashboard Metrics

Key metrics to display in your monitoring dashboard:

```python
dashboard_metrics = {
    'balance_ratio': balance_ratio,           # Target: < 2.0
    'total_vectors': total_vectors,           # Trend over time
    'avg_vectors_per_centroid': avg_count,    # Should be stable
    'empty_centroids': empty_count,           # Target: 0
    'last_rebuild_date': last_rebuild,        # Track rebuild frequency
    'query_latency_p99': latency_p99         # Should stay low
}
```

## Optimal Lists Parameter Guide

### Formula-Based Selection

```python
def calculate_optimal_lists(vector_count):
    """Calculate optimal lists parameter based on vector count"""
    
    if vector_count < 1000:
        return 10  # Small dataset
    elif vector_count < 10000:
        return 50  # Medium dataset
    elif vector_count < 100000:
        return 100  # Large dataset
    else:
        return int(np.sqrt(vector_count))  # Very large dataset
```

### Adjustment Guidelines

| Vector Count | Recommended Lists | Reasoning |
|--------------|-------------------|-----------|
| < 1,000 | 10 - 20 | Minimize overhead |
| 1K - 10K | 20 - 50 | Balance speed and accuracy |
| 10K - 100K | 50 - 200 | Optimize query performance |
| 100K - 1M | 200 - 1,000 | Use √N formula |
| > 1M | 1,000+ | Large-scale optimization |

### Testing Different Lists Values

```python
# Test multiple configurations
for lists_value in [10, 20, 50, 100]:
    # Create index
    index_name = f"idx_test_lists_{lists_value}"
    client.vector_ops.create_ivf(
        table_name, index_name, column_name,
        lists=lists_value,
        op_type="vector_l2_ops"
    )
    
    # Measure query performance
    start_time = time.time()
    results = perform_test_queries(100)  # Run 100 test queries
    elapsed = time.time() - start_time
    
    # Check balance
    stats = client.vector_ops.get_ivf_stats(table_name, column_name)
    balance = calculate_balance_ratio(stats)
    
    print(f"Lists={lists_value}: Time={elapsed:.2f}s, Balance={balance:.2f}")
    
    # Cleanup
    client.vector_ops.drop(table_name, index_name)

# Choose configuration with best balance of speed and balance
```

## Health Check Frequency

### Recommended Schedule

```python
# After significant data changes
def after_bulk_operation():
    client.batch_insert(Model, large_dataset)
    check_ivf_health()  # Immediate check

# Daily monitoring
def daily_health_check():
    schedule.every().day.at("02:00").do(check_ivf_health)

# Weekly detailed analysis
def weekly_analysis():
    schedule.every().monday.at("03:00").do(detailed_health_analysis)

# After every N inserts
insert_count = 0
def track_inserts():
    global insert_count
    insert_count += 1
    if insert_count % 1000 == 0:  # Every 1000 inserts
        check_ivf_health()
```

## Troubleshooting

### Issue: "High balance ratio (> 3.0)"

**Cause:** Uneven vector distribution across centroids

**Solution:** Rebuild index with optimized lists parameter

```python
# Drop and rebuild
client.vector_ops.drop(table_name, old_index_name)

# Calculate optimal lists
total_vectors = get_vector_count()
optimal_lists = int(np.sqrt(total_vectors))

client.vector_ops.create_ivf(
    table_name, new_index_name, column_name,
    lists=optimal_lists,
    op_type="vector_l2_ops"
)
```

### Issue: "Empty centroids detected"

**Cause:** Too many lists for the dataset size

**Solution:** Reduce lists parameter

```python
# Current: 100 vectors with 20 lists → avg 5 per centroid (too low)
# Better: 100 vectors with 10 lists → avg 10 per centroid

client.vector_ops.create_ivf(
    table_name, index_name, column_name,
    lists=10,  # Reduced from 20
    op_type="vector_l2_ops"
)
```

### Issue: "Version inconsistency"

**Cause:** Index updates in progress or partial rebuild

**Solution:** Wait for index to stabilize or rebuild

```python
# Check versions
stats = client.vector_ops.get_ivf_stats(table_name, vector_column)
versions = set(stats['distribution']['centroid_version'])

if len(versions) > 1:
    print(f"⚠️  Multiple versions found: {versions}")
    print("Waiting for index to stabilize...")
    time.sleep(5)
    
    # Check again
    stats = client.vector_ops.get_ivf_stats(table_name, vector_column)
    versions = set(stats['distribution']['centroid_version'])
    
    if len(versions) > 1:
        print("Rebuilding index...")
        rebuild_index(table_name, vector_column)
```

### Issue: "Performance degradation after bulk insert"

**Cause:** Index not rebalanced after data growth

**Solution:** Monitor data growth and rebuild proactively

```python
# Track vector count
initial_count = 1000
current_count = get_vector_count()
growth_rate = (current_count - initial_count) / initial_count

if growth_rate > 0.2:  # 20% growth
    print(f"⚠️  Vector count grew by {growth_rate*100:.1f}%")
    print("Rebuilding index for optimal performance...")
    rebuild_index(table_name, vector_column)
```

## Best Practices

### 1. Index Creation Timing (Most Important!)

**⚠️ CRITICAL: Always create IVF indexes AFTER inserting data**

```python
# ❌ WRONG: Create index first, then insert data
client.create_table(VectorDocument)
client.vector_ops.create_ivf(table_name, index_name, column_name, lists=100)
client.batch_insert(VectorDocument, data)  # Poor distribution!

# ✅ CORRECT: Insert data first, then create index  
client.create_table(VectorDocument)
client.batch_insert(VectorDocument, data)  # Insert at least 1000+ vectors
client.vector_ops.create_ivf(table_name, index_name, column_name, lists=100)

# ✅ EVEN BETTER: Calculate optimal lists based on actual data
client.create_table(VectorDocument)
client.batch_insert(VectorDocument, data)
vector_count = len(data)
optimal_lists = int(np.sqrt(vector_count))  # e.g., √10000 = 100
client.vector_ops.create_ivf(table_name, index_name, column_name, lists=optimal_lists)
```

**Why This Matters:**

IVF index initialization uses the existing data to determine centroid positions. If you create the index on an empty or nearly-empty table:
- Centroids may be positioned poorly
- Future data won't be distributed evenly
- Performance will suffer even with millions of vectors later

**Recovery Steps if Index Created Too Early:**

```python
# Step 1: Check current health
stats = client.vector_ops.get_ivf_stats(table_name, vector_column)
balance_ratio = max(counts) / min(counts)

# Step 2: If ratio > 2.5, rebuild is needed
if balance_ratio > 2.5:
    print(f"⚠️  Index created too early! Balance ratio: {balance_ratio:.2f}")
    
    # Step 3: Drop old index
    client.vector_ops.drop(table_name, old_index_name)
    
    # Step 4: Calculate optimal lists from current data
    current_vector_count = sum(stats['distribution']['centroid_count'])
    optimal_lists = int(np.sqrt(current_vector_count))
    
    # Step 5: Rebuild with proper parameters
    client.vector_ops.create_ivf(
        table_name, new_index_name, column_name,
        lists=optimal_lists,
        op_type="vector_l2_ops"
    )
    print(f"✅ Index rebuilt with {optimal_lists} lists")
```

### 2. Regular Monitoring

```python
# Production monitoring script
def production_health_monitor():
    # Check all vector tables
    vector_tables = [
        ("products", "embedding"),
        ("users", "profile_vector"),
        ("documents", "content_embedding")
    ]
    
    for table, column in vector_tables:
        health = check_ivf_health(client, table, column, expected_lists=100)
        
        if health['health'] == 'CRITICAL':
            # Immediate rebuild
            rebuild_index(table, column)
        elif health['health'] == 'NEEDS_ATTENTION':
            # Schedule rebuild during maintenance window
            schedule_rebuild(table, column)

# Run every hour
schedule.every().hour.do(production_health_monitor)
```

### 2. Rebuild Strategy

```python
def should_rebuild_index(stats, last_rebuild_time):
    """Determine if index rebuild is needed"""
    
    distribution = stats['distribution']
    counts = distribution['centroid_count']
    balance_ratio = max(counts) / min(counts) if min(counts) > 0 else float('inf')
    
    # Rebuild conditions
    if balance_ratio > 2.5:
        return True, "High balance ratio"
    
    # Rebuild if it's been more than 7 days since last rebuild
    days_since_rebuild = (time.time() - last_rebuild_time) / 86400
    if days_since_rebuild > 7:
        return True, "Scheduled maintenance"
    
    return False, "Index healthy"
```

### 3. Maintenance Windows

```python
def rebuild_during_maintenance(client, table_name, vector_column):
    """Rebuild index during scheduled maintenance window"""
    
    # Check if in maintenance window (e.g., 2-4 AM)
    current_hour = datetime.datetime.now().hour
    if not (2 <= current_hour < 4):
        print("⏰ Outside maintenance window, skipping rebuild")
        return
    
    print("🔧 Maintenance window: Rebuilding index...")
    
    # Get current stats
    stats = client.vector_ops.get_ivf_stats(table_name, vector_column)
    total_vectors = sum(stats['distribution']['centroid_count'])
    
    # Calculate optimal lists
    optimal_lists = int(np.sqrt(total_vectors))
    
    # Rebuild
    client.vector_ops.drop(table_name, "idx_old")
    client.vector_ops.create_ivf(
        table_name, "idx_new", vector_column,
        lists=optimal_lists,
        op_type="vector_l2_ops"
    )
    
    print(f"✅ Index rebuilt with {optimal_lists} lists")
```

### 4. Performance Testing

```python
def test_query_performance(client, table_name, vector_column):
    """Measure query performance"""
    
    query_vector = np.random.rand(128).tolist()
    
    # Run multiple queries and measure time
    times = []
    for _ in range(10):
        start = time.time()
        pinecone_index = client.get_pinecone_index(table_name, vector_column)
        results = pinecone_index.query(vector=query_vector, top_k=10)
        elapsed = time.time() - start
        times.append(elapsed)
    
    avg_time = np.mean(times)
    p95_time = np.percentile(times, 95)
    
    print(f"Query Performance:")
    print(f"  Avg: {avg_time*1000:.2f}ms")
    print(f"  P95: {p95_time*1000:.2f}ms")
    
    # Alert if too slow
    if p95_time > 0.1:  # 100ms threshold
        print("⚠️  Queries too slow, check index health")
```

## Reference

- [MatrixOne Python SDK Documentation](https://matrixone.readthedocs.io/en/latest/)
- [GitHub - MatrixOne Python Client](https://github.com/matrixorigin/matrixone/tree/main/clients/python)
- [Vector Search Guide](../Develop/Vector/vector_search.md)
- [CREATE INDEX IVFFLAT](../Reference/SQL-Reference/Data-Definition-Language/create-index-ivfflat.md)

## Summary

IVF index health monitoring is essential for production vector search systems:

✅ **Monitor Regularly**: Check health after bulk operations and on schedule  
✅ **Track Balance Ratio**: Keep it < 2.0 for optimal performance  
✅ **Rebuild Proactively**: Don't wait for performance to degrade  
✅ **Use Optimal Lists**: Calculate based on √(vector_count)  
✅ **Test Performance**: Measure query latency to detect issues early  
✅ **Automate**: Set up scheduled health checks and alerts  

**Golden Rule:** Monitor balance ratio and rebuild when it exceeds 2.5! 🚀

