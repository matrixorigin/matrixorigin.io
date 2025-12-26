# BY RANK WITH OPTION

## Syntax Description

The `BY RANK WITH OPTION` clause is used in vector similarity search queries to control how ranking is performed when using IVF (Inverted File) indexes. This clause allows you to optimize the trade-off between query speed and result accuracy.

## Syntax Structure

<!-- validator-ignore -->
```sql
SELECT column_list
FROM table_name
ORDER BY distance_function(vector_column, query_vector) ASC
BY RANK WITH OPTION 'mode = <mode>'
LIMIT k;
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `mode` | string | Controls when the rank function is applied. Valid values: `pre`, `force`, `post` |

### Mode Values

| Mode | Description |
|------|-------------|
| `pre` | Pre-ranking mode. Uses IVF index to filter candidates before ranking. Fastest but may have lower recall. |
| `force` | Force mode. Enforces IVF index usage with strict ranking strategy. |
| `post` | Post-ranking mode. Retrieves more candidates then re-ranks with exact distance. Higher accuracy but slower. |

## Examples

### Basic Usage

```sql
-- Pre-ranking mode for fastest query
SELECT id, name, l2_distance(embedding, '[1.0, 2.0, 3.0, 4.0]') AS distance
FROM products
ORDER BY l2_distance(embedding, '[1.0, 2.0, 3.0, 4.0]') ASC
BY RANK WITH OPTION 'mode = pre'
LIMIT 10;

-- Force mode to ensure index usage
SELECT id, name, l2_distance(embedding, '[1.0, 2.0, 3.0, 4.0]') AS distance
FROM products
ORDER BY l2_distance(embedding, '[1.0, 2.0, 3.0, 4.0]') ASC
BY RANK WITH OPTION 'mode = force'
LIMIT 10;

-- Post-ranking mode for highest accuracy
SELECT id, name, l2_distance(embedding, '[1.0, 2.0, 3.0, 4.0]') AS distance
FROM products
ORDER BY l2_distance(embedding, '[1.0, 2.0, 3.0, 4.0]') ASC
BY RANK WITH OPTION 'mode = post'
LIMIT 10;
```

### Complete Example

```sql
-- Enable IVF index feature
SET GLOBAL experimental_ivf_index = 1;

-- Create table with vector column
CREATE TABLE documents (
    id BIGINT PRIMARY KEY,
    title VARCHAR(200),
    embedding VECF32(4)
);

-- Insert sample data
INSERT INTO documents VALUES (1, 'Document A', '[0.1, 0.2, 0.3, 0.4]');
INSERT INTO documents VALUES (2, 'Document B', '[0.5, 0.6, 0.7, 0.8]');
INSERT INTO documents VALUES (3, 'Document C', '[0.2, 0.3, 0.4, 0.5]');

-- Create IVF index
CREATE INDEX idx_docs_embedding 
USING IVFFLAT ON documents(embedding) 
LISTS=2 OP_TYPE "vector_l2_ops";

-- Set probe limit
SET @PROBE_LIMIT = 1;

-- Query with rank option
SELECT id, title, l2_distance(embedding, '[0.1, 0.2, 0.3, 0.4]') AS distance
FROM documents
ORDER BY l2_distance(embedding, '[0.1, 0.2, 0.3, 0.4]') ASC
BY RANK WITH OPTION 'mode = post'
LIMIT 3;
```

## Limitations

- Only works with IVF indexed vector columns
- Currently supports only `l2_distance` metric
- The mode option must be specified as a string literal

## Related Statements

- [CREATE INDEX...USING IVFFLAT](../Data-Definition-Language/create-index-ivfflat.md)
- [L2_DISTANCE()](../../Functions-and-Operators/Vector/l2_distance.md)

For detailed usage examples and best practices, see [IVF Rank Options](../../../Develop/Vector/ivf_rank_options.md).
