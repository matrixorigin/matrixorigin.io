# IVF Vector Query with Rank Options

## Overview

When performing vector similarity search using IVF (Inverted File) indexes, MatrixOne provides the `BY RANK WITH OPTION` clause to control how the rank function is applied during query execution. This feature allows you to optimize query performance and accuracy based on your specific use case.

## Syntax

```sql
SELECT ...
FROM table_name
ORDER BY distance_function(vector_column, query_vector) ASC
BY RANK WITH OPTION 'mode = <mode>'
LIMIT k;
```

### Parameters

| Parameter | Description |
|-----------|-------------|
| `mode` | Controls when the rank function is applied. Valid values: `pre`, `force`, `post` |

## Mode Options

### `mode = pre` (Pre-ranking Mode)

In pre-ranking mode, the IVF index is used to filter candidate vectors **before** applying the rank function. This mode:

- **Behavior**: First uses IVF index to select candidate centroids, then applies ranking within those candidates
- **Performance**: Fastest execution, as ranking is applied only to a subset of data
- **Accuracy**: May miss some relevant results if they are in centroids not selected by the probe limit

**Use Case**: High-throughput scenarios where query speed is prioritized over perfect recall.

```sql
-- Example: Pre-ranking mode
SELECT id, content, l2_distance(embedding, '[1.0, 2.0, 3.0, ...]') AS distance
FROM documents
ORDER BY l2_distance(embedding, '[1.0, 2.0, 3.0, ...]') ASC
BY RANK WITH OPTION 'mode = pre'
LIMIT 10;
```

### `mode = force` (Force Mode)

In force mode, the system **forces** the use of the IVF index for ranking, regardless of the query optimizer's default decision. This mode:

- **Behavior**: Explicitly enforces index usage and applies a strict ranking strategy
- **Performance**: Optimized for scenarios where index usage is guaranteed to be beneficial
- **Accuracy**: Balanced between speed and accuracy based on probe limit settings

**Use Case**: When you know the IVF index is well-suited for your query pattern and want to ensure it is used.

```sql
-- Example: Force mode
SELECT id, content, l2_distance(embedding, '[1.0, 2.0, 3.0, ...]') AS distance
FROM documents
ORDER BY l2_distance(embedding, '[1.0, 2.0, 3.0, ...]') ASC
BY RANK WITH OPTION 'mode = force'
LIMIT 10;
```

### `mode = post` (Post-ranking Mode)

In post-ranking mode, the rank function is applied **after** the IVF index has retrieved an expanded set of candidates. This mode:

- **Behavior**: Retrieves more candidates from the IVF index, then re-ranks them using the exact distance computation
- **Performance**: Slower than pre-ranking, but faster than full table scan
- **Accuracy**: Higher accuracy, as the final ranking is based on exact distance calculations

**Use Case**: Scenarios requiring high recall where exact ranking is important.

```sql
-- Example: Post-ranking mode
SELECT id, content, l2_distance(embedding, '[1.0, 2.0, 3.0, ...]') AS distance
FROM documents
ORDER BY l2_distance(embedding, '[1.0, 2.0, 3.0, ...]') ASC
BY RANK WITH OPTION 'mode = post'
LIMIT 10;
```

## Comparison of Modes

| Mode | Index Usage | Ranking Strategy | Speed | Accuracy | Best For |
|------|-------------|-----------------|-------|----------|----------|
| `pre` | Uses IVF to filter first | Rank within IVF candidates | ⚡ Fastest | Lower | High-throughput, latency-sensitive |
| `force` | Forces IVF index usage | Strict index-based ranking | 🚀 Fast | Medium | Predictable index usage |
| `post` | Uses IVF for candidates | Re-ranks with exact distance | 🐢 Slower | ⭐ Highest | High-recall requirements |

## Complete Example

### Setup

```sql
-- Enable IVF index feature
SET GLOBAL experimental_ivf_index = 1;

-- Create table with vector column
CREATE TABLE products (
    id BIGINT PRIMARY KEY,
    name VARCHAR(200),
    description TEXT,
    embedding VECF32(128)
);

-- Insert data (example with 10000 products)
INSERT INTO products VALUES 
    (1, 'Product A', 'Description A', '[0.1, 0.2, ...]'),
    (2, 'Product B', 'Description B', '[0.3, 0.4, ...]'),
    -- ... more data
;

-- Create IVF index
CREATE INDEX idx_products_embedding 
USING IVFFLAT ON products(embedding) 
LISTS=100 OP_TYPE "vector_l2_ops";

-- Set probe limit for query
SET @PROBE_LIMIT = 10;
```

### Query Examples

```sql
-- Fast approximate search (pre-ranking)
SELECT id, name, l2_distance(embedding, @query_vector) AS distance
FROM products
ORDER BY l2_distance(embedding, @query_vector) ASC
BY RANK WITH OPTION 'mode = pre'
LIMIT 20;

-- Guaranteed index usage (force mode)
SELECT id, name, l2_distance(embedding, @query_vector) AS distance
FROM products
ORDER BY l2_distance(embedding, @query_vector) ASC
BY RANK WITH OPTION 'mode = force'
LIMIT 20;

-- High-accuracy search (post-ranking)
SELECT id, name, l2_distance(embedding, @query_vector) AS distance
FROM products
ORDER BY l2_distance(embedding, @query_vector) ASC
BY RANK WITH OPTION 'mode = post'
LIMIT 20;
```

## Best Practices

### Choosing the Right Mode

1. **For real-time applications** (e.g., search-as-you-type): Use `mode = pre`
2. **For batch processing** where accuracy matters: Use `mode = post`
3. **When query optimizer makes suboptimal decisions**: Use `mode = force`

### Combining with Probe Limit

The `@PROBE_LIMIT` variable controls how many centroids are scanned. Combine it with rank options for optimal results:

```sql
-- High accuracy configuration
SET @PROBE_LIMIT = 50;  -- Scan more centroids

SELECT * FROM products
ORDER BY l2_distance(embedding, @query_vector) ASC
BY RANK WITH OPTION 'mode = post'
LIMIT 10;
```

```sql
-- High speed configuration
SET @PROBE_LIMIT = 5;  -- Scan fewer centroids

SELECT * FROM products
ORDER BY l2_distance(embedding, @query_vector) ASC
BY RANK WITH OPTION 'mode = pre'
LIMIT 10;
```

### Performance Tuning

- **Start with `mode = pre`** for most use cases
- **Monitor recall rate** and switch to `mode = post` if accuracy is insufficient
- **Use `mode = force`** when you observe the query optimizer not using the index

## Limitations

- `BY RANK WITH OPTION` only works with IVF indexed vector columns
- Currently supports only `l2_distance` metric
- The mode option must be specified as a string literal

## Related Documentation

- [Create IVF Index](../../Reference/SQL-Reference/Data-Definition-Language/create-index-ivfflat.md)
- [Vector Search](./vector_search.md)
- [Vector Data Type](../../Reference/Data-Types/vector-type.md)
- [L2_DISTANCE()](../../Reference/Functions-and-Operators/Vector/l2_distance.md)
