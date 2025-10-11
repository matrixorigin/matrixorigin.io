# Hybrid Search Demo

## Overview

This tutorial demonstrates **advanced hybrid search** in MatrixOne Python SDK, combining:

- 🔍 **Vector similarity search** (semantic search with IVF index)
- 📝 **Fulltext search** (keyword search with BM25 algorithm)
- 🔗 **JOIN operations** (multi-table queries)
- 🎯 **Regular SQL filters** (WHERE, ORDER BY, GROUP BY)
- 📊 **CTEs and subqueries** (complex query composition)

**Why Hybrid Search?**

Real-world applications rarely use just one search method. Hybrid search combines:

- **Semantic understanding** from vector similarity
- **Keyword precision** from fulltext search
- **Structured filtering** from SQL conditions
- **Relational data** from table JOINs

All queries use **client.query() ORM-style API** for clean, maintainable code.

## 📑 Query Patterns Index

This demo covers the following hybrid search patterns:

### 🔍 Basic Hybrid Patterns

1. **[Vector + WHERE Conditions](#pattern-1-vector--where-conditions)**
   - Vector similarity + rating filter
   - Vector similarity + views filter
   - Vector similarity + category filter

2. **[Fulltext + WHERE Conditions](#pattern-2-fulltext--where-conditions)**
   - Keyword search + category filter
   - Keyword search + quality filter
   - Keyword search + author filter

3. **[Vector + Fulltext Combination](#pattern-3-vector--fulltext-combination)**
   - Semantic similarity + keyword match
   - Distance threshold + keyword presence
   - Multiple keyword requirements with similarity

### 🔗 JOIN-Based Patterns

4. **[Vector Search + JOIN](#pattern-4-vector-search--join)**
   - Vector search with category enrichment
   - Filter by joined table columns
   - Multi-table vector queries

5. **[Fulltext Search + JOIN](#pattern-5-fulltext-search--join)**
   - Keyword search with category info
   - Two-step: fulltext then JOIN
   - Filter by related table data

6. **[Triple Hybrid (Vector + Fulltext + WHERE)](#pattern-6-triple-hybrid)**
   - All three methods combined
   - Multi-condition filtering
   - Complex business logic queries

### 📊 Advanced Query Patterns

7. **[CTE (Common Table Expressions)](#using-ctes-common-table-expressions)**
   - Reusable subqueries with WITH clause
   - Multi-level query composition
   - Performance optimization

8. **[Subquery Patterns](#using-subqueries)**
   - Nested SELECT statements
   - IN clause with subqueries
   - GROUP BY + HAVING in subqueries

9. **[Multi-Step Query Composition](#multi-step-query-composition)**
   - Two-step: fulltext → vector
   - Set intersection (Python)
   - Result enrichment

10. **[Aggregation Queries](#sql-aggregation-examples)**
    - GROUP BY with vector/fulltext
    - COUNT, AVG, SUM aggregates
    - HAVING clause filters

11. **[Advanced Ranking Strategies](#advanced-ranking-strategies)**
    - Combined score (rating + distance)
    - Multi-factor weighted ranking
    - Custom scoring formulas

### 🎯 Specialized Patterns

12. **[Top N Per Group](#top-articles-per-category)**
    - Best match per category
    - Deduplication strategies
    - Window function alternatives

13. **[Intersection Queries](#intersection-queries)**
    - AND logic across search types
    - Set operations in Python
    - Multiple criteria matching

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

Save this as `hybrid_search_demo.py` and run with `python3 hybrid_search_demo.py`:

```python
from matrixone import Client, FulltextIndex, FulltextAlgorithmType
from matrixone.config import get_connection_params
from matrixone.sqlalchemy_ext import create_vector_column, boolean_match
from matrixone.orm import declarative_base
from sqlalchemy import BigInteger, Column, String, Text, Integer, Float, func, select
import numpy as np

np.random.seed(42)

# Connect
host, port, user, password, database = get_connection_params(database='demo')
client = Client()
client.connect(host=host, port=port, user=user, password=password, database=database)

# Define tables
Base = declarative_base()

class Category(Base):
    __tablename__ = "hybrid_categories"
    cat_id = Column(BigInteger, primary_key=True)
    name = Column(String(100))
    description = Column(String(500))

class Article(Base):
    __tablename__ = "hybrid_articles"

    id = Column(BigInteger, primary_key=True)
    title = Column(String(200))
    content = Column(Text)
    author = Column(String(100))
    category_id = Column(BigInteger)
    views = Column(Integer)
    rating = Column(Float)
    embedding = create_vector_column(128, "f32")

    __table_args__ = (
        FulltextIndex("idx_fulltext", ["title", "content"],
                     algorithm=FulltextAlgorithmType.BM25),
    )

# Create tables
client.fulltext_index.enable_fulltext()
client.execute('SET ft_relevancy_algorithm = "BM25"')
client.drop_table(Article)
client.drop_table(Category)
client.create_table(Category)
client.create_table(Article)

# Insert data
categories = [
    {"cat_id": 1, "name": "AI & Machine Learning", "description": "AI topics"},
    {"cat_id": 2, "name": "Programming", "description": "Programming languages"},
]
client.batch_insert(Category, categories)

articles = [
    {
        "id": 1,
        "title": "Introduction to Deep Learning",
        "content": "Deep learning uses neural networks...",
        "author": "Alice",
        "category_id": 1,
        "views": 2500,
        "rating": 4.8,
        "embedding": np.random.rand(128).astype(np.float32).tolist()
    },
    # ... more articles
]
client.batch_insert(Article, articles)

# Create IVF index
client.vector_ops.create_ivf(
    Article, "idx_embedding_ivf", "embedding",
    lists=4, op_type="vector_l2_ops"
)

query_vector = np.random.rand(128).astype(np.float32).tolist()

# Hybrid query: Vector + Fulltext + WHERE
results = client.query(
    Article.id,
    Article.title,
    Article.rating,
    Article.embedding.l2_distance(query_vector).label('distance')
).filter(
    boolean_match(Article.title, Article.content).must("learning")  # Fulltext
).filter(
    Article.rating >= 4.7  # WHERE
).order_by('distance').all()

print(f"Found {len(results)} articles (vector + fulltext + filter)")

# Join query: Vector search with category
results = client.query(
    Article.title,
    Category.name.label('category'),
    Article.embedding.l2_distance(query_vector).label('distance')
).join(
    Category, Article.category_id == Category.cat_id
).order_by('distance').limit(5).all()

print(f"Found {len(results)} articles with category info")

client.disconnect()
```

## Key Concepts

### 1. Table Design for Hybrid Search

Create tables with BOTH vector and fulltext indexes:

```python
class Article(Base):
    __tablename__ = "articles"

    # Standard columns
    id = Column(BigInteger, primary_key=True)
    title = Column(String(200))
    content = Column(Text)

    # Vector column for semantic search
    embedding = create_vector_column(128, "f32")

    # Fulltext index for keyword search
    __table_args__ = (
        FulltextIndex("idx_fulltext", ["title", "content"],
                     algorithm=FulltextAlgorithmType.BM25),
    )

# Then create IVF index on vector column (after data insertion)
client.vector_ops.create_ivf(
    Article, "idx_embedding_ivf", "embedding",
    lists=10, op_type="vector_l2_ops"
)
```

### 2. ORM-Style Query API

All queries use `client.query()` for consistency:

```python
# Basic pattern
results = client.query(
    Article.column1,
    Article.column2.some_function().label('alias')
).filter(
    conditions
).order_by(
    'column'
).limit(10).all()
```

## Hybrid Search Patterns

### Pattern 1: Vector + WHERE Conditions

Combine semantic search with structured filters.

#### Example 1.1: Vector Similarity + Rating Filter

```python
# Find similar articles with high ratings
results = client.query(
    Article.id,
    Article.title,
    Article.rating,
    Article.embedding.l2_distance(query_vector).label('distance')
).filter(
    Article.rating >= 4.7  # Quality filter
).order_by('distance').limit(10).all()
```

**Use case:** Find high-quality content similar to user's interests

#### Example 1.2: Vector Similarity + Views Filter

```python
# Find similar AND popular articles
results = client.query(
    Article.id,
    Article.title,
    Article.views,
    Article.embedding.l2_distance(query_vector).label('distance')
).filter(
    Article.views > 2000  # Popularity filter
).order_by('distance').limit(10).all()
```

**Use case:** Recommend popular content that matches user preferences

#### Example 1.3: Vector Similarity + Multiple Filters

```python
# Combine multiple WHERE conditions
results = client.query(
    Article.id,
    Article.title,
    Article.embedding.l2_distance(query_vector).label('distance')
).filter(
    Article.category_id == 1
).filter(
    Article.rating >= 4.5
).filter(
    Article.views > 1000
).order_by('distance').all()
```

**Use case:** Narrow search to specific segment with multiple criteria

---

### Pattern 2: Fulltext + WHERE Conditions

Combine keyword search with structured filters.

#### Example 2.1: Keyword Search + Category Filter

```python
# Find "learning" articles in AI category
results = client.query(
    Article.id,
    Article.title,
    Article.category_id
).filter(
    boolean_match(Article.title, Article.content).must("learning")
).filter(
    Article.category_id == 1  # AI category
).all()
```

**Use case:** Category-specific keyword search

#### Example 2.2: Keyword Search + Quality Filter

```python
# Find "Python" articles with high ratings
results = client.query(
    Article.id,
    Article.title,
    Article.rating
).filter(
    boolean_match(Article.title, Article.content).must("Python")
).filter(
    Article.rating >= 4.7
).all()
```

**Use case:** Find quality content for specific keywords

#### Example 2.3: Keyword Search + Author Filter

```python
# Find articles by specific author with keyword
results = client.query(
    Article.id,
    Article.title,
    Article.author
).filter(
    boolean_match(Article.title, Article.content).must("machine learning")
).filter(
    Article.author == "Alice Johnson"
).all()
```

**Use case:** Author-specific content discovery

---

### Pattern 3: Vector + Fulltext Combination

Combine semantic understanding with keyword precision.

#### Example 3.1: Semantic Similarity + Keyword Match

```python
# Semantically similar AND contains "Python"
results = client.query(
    Article.id,
    Article.title,
    Article.embedding.l2_distance(query_vector).label('distance')
).filter(
    boolean_match(Article.title, Article.content).must("Python")  # Keyword
).filter(
    Article.embedding.l2_distance(query_vector) < 10.0  # Similarity
).order_by('distance').all()
```

**Use case:** Find relevant content that mentions specific terms

#### Example 3.2: Multiple Keywords + Similarity

```python
# Must contain keywords AND be semantically similar
results = client.query(
    Article.id,
    Article.title,
    Article.embedding.l2_distance(query_vector).label('distance')
).filter(
    boolean_match(Article.title, Article.content)
    .must("learning")
    .encourage("neural", "deep")
).filter(
    Article.embedding.l2_distance(query_vector) < 8.0
).order_by('distance').all()
```

**Use case:** Precise topic matching with semantic relevance

---

### Pattern 4: Vector Search + JOIN

Enrich vector search results with relational data.

#### Example 4.1: Vector Search with Category Info

```python
# Vector search + JOIN to get category names
results = client.query(
    Article.id,
    Article.title,
    Category.name.label('category_name'),
    Article.embedding.l2_distance(query_vector).label('distance')
).join(
    Category, Article.category_id == Category.cat_id
).order_by('distance').limit(10).all()
```

**Use case:** Display category names in search results

#### Example 4.2: Filter by Joined Table Columns

```python
# Filter by category name (not category_id)
results = client.query(
    Article.id,
    Article.title,
    Category.name.label('category_name'),
    Article.embedding.l2_distance(query_vector).label('distance')
).join(
    Category, Article.category_id == Category.cat_id
).filter(
    Category.name == "AI & Machine Learning"  # Filter on joined table
).order_by('distance').all()
```

**Use case:** Category-based filtering with display names

#### Example 4.3: Multi-Table Vector Query

```python
# Join multiple tables
results = client.query(
    Article.title,
    Category.name.label('category'),
    Author.name.label('author'),
    Article.embedding.l2_distance(query_vector).label('distance')
).join(
    Category, Article.category_id == Category.cat_id
).join(
    Author, Article.author_id == Author.id
).order_by('distance').limit(20).all()
```

**Use case:** Rich search results with full context

---

### Pattern 5: Fulltext Search + JOIN

Combine keyword search with table relationships.

#### Example 5.1: Fulltext + Category JOIN

```python
# Two-step: fulltext search then JOIN for enrichment
# Step 1: Get IDs from fulltext search
fulltext_results = client.query(
    Article.id,
    Article.title
).filter(
    boolean_match(Article.title, Article.content).must("development")
).all()

# Step 2: JOIN with category on filtered IDs
article_ids = [r.id for r in fulltext_results]
if article_ids:
    results = client.query(
        Article.title,
        Category.name.label('category_name')
    ).join(
        Category, Article.category_id == Category.cat_id
    ).filter(
        Article.id.in_(article_ids)
    ).all()
```

**Use case:** Enrich keyword search with category context

---

### Pattern 6: Triple Hybrid

The most powerful pattern - combine all three methods.

#### Example 6.1: Vector + Fulltext + Quality Filter

```python
# All three conditions must be satisfied
results = client.query(
    Article.id,
    Article.title,
    Article.rating,
    Article.embedding.l2_distance(query_vector).label('distance')
).filter(
    boolean_match(Article.title, Article.content).must("learning")  # Fulltext
).filter(
    Article.rating >= 4.7  # Quality filter
).filter(
    Article.embedding.l2_distance(query_vector) < 10.0  # Vector similarity
).order_by('distance').all()
```

**Use case:** High-precision search with multiple quality signals

#### Example 6.2: Vector + Fulltext + JOIN + Filters (Multi-Step)

```python
# Step 1: Fulltext with quality filter
fulltext_matches = client.query(
    Article.id
).filter(
    boolean_match(Article.title, Article.content).must("Python")
).filter(
    Article.rating >= 4.5
).all()

# Step 2: Vector + JOIN on fulltext results
article_ids = [r.id for r in fulltext_matches]
if article_ids:
    results = client.query(
        Article.title,
        Category.name.label('category'),
        Article.embedding.l2_distance(query_vector).label('distance')
    ).join(
        Category, Article.category_id == Category.cat_id
    ).filter(
        Article.id.in_(article_ids)
    ).filter(
        Category.name.in_(["Programming", "Data Science"])
    ).order_by('distance').all()
```

**Use case:** Complex business logic with multiple data sources

---

## Advanced Query Techniques

### Intersection Queries

Find articles matching ALL criteria using set operations.

#### AND Logic Across Search Types

```python
# Find articles matching BOTH fulltext AND vector criteria

# Step 1: Fulltext search - get all articles containing "learning"
fulltext_ids = [r.id for r in client.query(Article.id).filter(
    boolean_match(Article.title, Article.content).must("learning")
).all()]

# Step 2: Vector search - get all articles within distance threshold
vector_results = client.query(
    Article.id,
    Article.embedding.l2_distance(query_vector).label('distance')
).filter(
    Article.embedding.l2_distance(query_vector) < 6.0
).all()
vector_ids = [r.id for r in vector_results]

# Step 3: Find intersection (articles matching BOTH)
intersection_ids = set(fulltext_ids) & set(vector_ids)

# Step 4: Get full details
if intersection_ids:
    results = client.query(
        Article.id,
        Article.title,
        Article.rating,
        Article.embedding.l2_distance(query_vector).label('distance')
    ).filter(
        Article.id.in_(list(intersection_ids))
    ).order_by('distance').all()
```

**Use case:** Strict matching - must satisfy all search criteria

#### Union Logic (OR)

```python
# Find articles matching ANY criteria
fulltext_ids = set(get_fulltext_ids())
vector_ids = set(get_vector_ids())

# Union
union_ids = fulltext_ids | vector_ids

results = client.query(Article).filter(
    Article.id.in_(list(union_ids))
).all()
```

**Use case:** Broad matching - satisfy any search criteria

---

### Top Articles Per Category

Get best match from each category.

#### Example: Closest Article in Each Category

```python
# Get all articles with distances and category info
all_results = client.query(
    Article.id,
    Article.title,
    Article.category_id,
    Category.name.label('category_name'),
    Article.rating,
    Article.embedding.l2_distance(query_vector).label('distance')
).join(
    Category, Article.category_id == Category.cat_id
).order_by('distance').all()

# Find top article per category (in Python)
category_top = {}
for row in all_results:
    if row.category_name not in category_top:
        category_top[row.category_name] = row

print("Top article in each category:")
for category_name, row in category_top.items():
    print(f"{category_name}: {row.title}")
    print(f"Distance: {row.distance:.4f}")
```

**Use case:** Diverse recommendations across categories

---

### Using CTEs (Common Table Expressions)

Create reusable subqueries with WITH clause:

```python
# Step 1: Create CTE for high-quality articles
high_quality_cte = client.query(
    Article.id,
    Article.title,
    Article.category_id,
    Article.rating,
    Article.embedding
).filter(Article.rating >= 4.7).cte('high_quality_articles')

# Step 2: Query using CTE
results = client.query(
    Article.id,
    Article.title,
    Category.name.label('category_name'),
    Article.rating,
    Article.embedding.l2_distance(query_vector).label('distance')
).with_cte(high_quality_cte).join(
    Category, Article.category_id == Category.cat_id
).filter(
    Article.rating >= 4.7  # Matches CTE filter
).order_by('distance').limit(3).all()
```

---

### Using Subqueries

Nest queries for complex logic:

```python
# Find popular categories (2+ articles)
popular_categories_subq = select(
    Article.category_id
).select_from(
    Article.__table__
).group_by(
    Article.category_id
).having(
    func.count(Article.id) >= 2
).alias('popular_categories')

# Query articles from popular categories only
results = client.query(
    Article.id,
    Article.title,
    Category.name.label('category_name'),
    Article.embedding.l2_distance(query_vector).label('distance')
).join(
    Category, Article.category_id == Category.cat_id
).filter(
    Article.category_id.in_(select(popular_categories_subq.c.category_id))
).order_by('distance').limit(5).all()
```

### Multi-Step Query Composition

Break complex queries into steps:

```python
# Step 1: Fulltext search
fulltext_ids = [r.id for r in client.query(Article.id).filter(
    boolean_match(Article.title, Article.content).must("learning")
).all()]

# Step 2: Vector search
vector_results = client.query(
    Article.id,
    Article.embedding.l2_distance(query_vector).label('distance')
).filter(
    Article.embedding.l2_distance(query_vector) < 6.0
).all()
vector_ids = [r.id for r in vector_results]

# Step 3: Intersection (Python set operations)
intersection_ids = set(fulltext_ids) & set(vector_ids)

# Step 4: Get full details
if intersection_ids:
    results = client.query(
        Article.id,
        Article.title,
        Article.embedding.l2_distance(query_vector).label('distance')
    ).filter(
        Article.id.in_(list(intersection_ids))
    ).order_by('distance').all()
```

## Advanced Ranking Strategies

### Combined Score Ranking

Create custom scores combining multiple factors:

```python
# Formula: score = (rating * 2) - distance
# Higher rating and lower distance both increase score
results = client.query(
    Article.id,
    Article.title,
    Article.rating,
    Article.embedding.l2_distance(query_vector).label('distance'),
    (Article.rating * 2 - Article.embedding.l2_distance(query_vector)).label('score')
).order_by('score desc').limit(10).all()
```

### Multi-Factor Ranking

```python
# Rank by: similarity (60%) + popularity (30%) + quality (10%)
# Normalize each factor to 0-1 range, then combine
max_views = 10000  # Your dataset maximum

results = client.query(
    Article.id,
    Article.title,
    Article.embedding.l2_distance(query_vector).label('distance'),
    Article.views,
    Article.rating,
    (
        (1.0 / (1.0 + Article.embedding.l2_distance(query_vector))) * 0.6 +  # Similarity 60%
        (Article.views / max_views) * 0.3 +  # Popularity 30%
        (Article.rating / 5.0) * 0.1  # Quality 10%
    ).label('combined_score')
).order_by('combined_score desc').limit(10).all()
```

## SQL Aggregation Examples

### Group By with Aggregates

```python
# Articles per category with statistics
results = client.query(
    Article,
    Category.name.label('category_name'),
    func.count(Article.id).label('article_count'),
    func.avg(Article.rating).label('avg_rating'),
    func.sum(Article.views).label('total_views')
).join(
    Category, Article.category_id == Category.cat_id
).group_by(Category.name).order_by(func.count(Article.id).desc()).all()

for row in results:
    print(f"{row.category_name}: {row.article_count} articles")
    print(f"Avg rating: {row.avg_rating:.2f}, Total views: {row.total_views}")
```

### HAVING Clause for Post-Aggregation Filtering

```python
# Only show categories with 2+ articles
results = client.query(
    Category.name,
    func.count(Article.id).label('count')
).join(
    Category, Article.category_id == Category.cat_id
).group_by(Category.name).having(
    func.count(Article.id) >= 2
).all()
```

## Use Cases

### 1. E-commerce Product Search

```python
class Product(Base):
    name = Column(String(200))
    description = Column(Text)
    price = Column(Float)
    brand_id = Column(BigInteger)
    embedding = create_vector_column(128, "f32")

    __table_args__ = (
        FulltextIndex("idx_ft", ["name", "description"]),
    )

# Search: similar + keyword + price range + brand
results = client.query(
    Product.name,
    Brand.name.label('brand'),
    Product.price,
    Product.embedding.l2_distance(query_vector).label('distance')
).join(
    Brand, Product.brand_id == Brand.id
).filter(
    boolean_match(Product.name, Product.description).must("laptop")
).filter(
    Product.price.between(500, 1500)
).filter(
    Brand.name.in_(["Dell", "HP", "Lenovo"])
).order_by('distance').limit(20).all()
```

### 2. Document Search System

```python
# Find similar documents + keyword match + department filter
results = client.query(
    Document.title,
    Department.name.label('dept'),
    Document.embedding.l2_distance(query_vector).label('distance')
).join(
    Department, Document.dept_id == Department.id
).filter(
    boolean_match(Document.title, Document.content).must("report")
).filter(
    Document.created_date >= "2025-01-01"
).order_by('distance').all()
```

### 3. Job Search Platform

```python
# Find jobs: similar skills + keyword + location + salary
results = client.query(
    Job.title,
    Company.name.label('company'),
    Job.salary,
    Job.embedding.l2_distance(skills_vector).label('distance')
).join(
    Company, Job.company_id == Company.id
).filter(
    boolean_match(Job.title, Job.description).must("Python", "ML")
).filter(
    Job.location.in_(["San Francisco", "New York"])
).filter(
    Job.salary >= 120000
).order_by('distance').limit(50).all()
```

## Best Practices

### 1. Order of Operations

Optimize query performance by filtering early:

```python
# Good: Filter first, then compute distance
results = client.query(
    Article.id,
    Article.embedding.l2_distance(query_vector).label('distance')
).filter(
    Article.category_id == 1  # Fast indexed filter first
).filter(
    Article.rating >= 4.5     # Then quality filter
).filter(
    Article.embedding.l2_distance(query_vector) < 10.0  # Vector filter last
).order_by('distance').all()
```

### 2. Use Two-Step Queries for Complex Logic

```python
# When combining fulltext + JOIN is problematic, use two steps:

# Step 1: Fulltext search
fulltext_ids = [r.id for r in client.query(Article.id).filter(
    boolean_match(Article.title, Article.content).must("keyword")
).all()]

# Step 2: JOIN with category on filtered IDs
if fulltext_ids:
    results = client.query(
        Article.title,
        Category.name
    ).join(
        Category, Article.category_id == Category.cat_id
    ).filter(
        Article.id.in_(fulltext_ids)
    ).all()
```

### 3. Leverage Python for Set Operations

```python
# Find articles matching ALL criteria (intersection)
fulltext_ids = set(get_fulltext_results())
vector_ids = set(get_vector_results())
high_quality_ids = set(get_quality_filtered())

# Intersection
final_ids = fulltext_ids & vector_ids & high_quality_ids

# Get full results
results = client.query(Article).filter(
    Article.id.in_(list(final_ids))
).all()
```

### 4. Use CTEs for Reusable Subqueries

```python
# Create CTE for expensive computation
expensive_cte = client.query(
    Article.id,
    Article.embedding.l2_distance(query_vector).label('distance')
).filter(
    Article.rating >= 4.5
).cte('similar_quality_articles')

# Reuse CTE in multiple queries
results1 = client.query(...).with_cte(expensive_cte).filter(...)
results2 = client.query(...).with_cte(expensive_cte).filter(...)
```

## Sample Data

Complete sample data with 8 articles across 5 categories:

```python
categories_data = [
    {"cat_id": 1, "name": "AI & Machine Learning", "description": "AI topics"},
    {"cat_id": 2, "name": "Programming", "description": "Programming languages"},
    {"cat_id": 3, "name": "Web Development", "description": "Web technologies"},
    {"cat_id": 4, "name": "Data Science", "description": "Data analysis"},
    {"cat_id": 5, "name": "DevOps", "description": "Operations"},
]

articles_data = [
    # AI articles
    {
        "id": 1,
        "title": "Introduction to Deep Learning",
        "content": "Deep learning uses neural networks with multiple layers...",
        "category_id": 1,
        "rating": 4.8,
        "embedding": np.random.rand(128).tolist()
    },
    # Programming articles
    {
        "id": 2,
        "title": "Python Programming Best Practices",
        "content": "Python best practices including PEP 8, testing...",
        "category_id": 2,
        "rating": 4.9,
        "embedding": np.random.rand(128).tolist()
    },
    # ... more articles
]
```

## Troubleshooting

### Issue: "Fulltext + JOIN in same query not working"

**Solution:** Use two-step query approach

```python
# Step 1: Fulltext search
ids = [r.id for r in client.query(Article.id).filter(
    boolean_match(Article.title, Article.content).must("keyword")
).all()]

# Step 2: JOIN on filtered IDs
results = client.query(Article, Category.name).join(...).filter(
    Article.id.in_(ids)
).all()
```

### Issue: "CTE not being used correctly"

**Solution:** Use .with_cte() and match filters

```python
# Create CTE
my_cte = client.query(...).filter(...).cte('my_cte')

# Use CTE with .with_cte()
results = client.query(...).with_cte(my_cte).filter(...).all()
```

### Issue: "Slow hybrid queries"

**Solution:** Add indexes and filter early

```python
# Good: Filter by indexed columns first
results = client.query(...).filter(
    Article.category_id == 1  # Indexed - fast
).filter(
    Article.rating >= 4.5     # Then other filters
).filter(
    vector_or_fulltext_condition
).all()
```

## Reference

- [MatrixOne Python SDK Documentation](https://matrixone.readthedocs.io/en/latest/)
- [Vector Search Guide](../Develop/Vector/vector_search.md)
- [Fulltext Search](fulltext-natural-search-demo.md)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)

## Summary

Hybrid search in MatrixOne enables powerful query combinations:

✅ **Vector + Fulltext**: Semantic and keyword search together
✅ **JOIN Operations**: Enrich results with related tables
✅ **SQL Filters**: Standard WHERE, GROUP BY, HAVING
✅ **CTEs**: Complex query composition
✅ **Custom Ranking**: Combine multiple factors
✅ **ORM-Style API**: Clean, maintainable code

**Perfect for:** E-commerce, document management, job platforms, content discovery, recommendation systems - any application needing sophisticated search! 🚀
