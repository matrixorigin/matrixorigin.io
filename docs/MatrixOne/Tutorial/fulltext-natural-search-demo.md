# Fulltext Natural Search Demo

## Overview

This tutorial demonstrates **Natural Language mode fulltext search** in MatrixOne Python SDK. Natural Language mode provides a user-friendly search experience similar to Google search, with automatic features like stopword removal, word stemming, and natural relevance scoring.

**Perfect For:**
- User-facing search boxes
- Content management systems
- Documentation search
- Article/blog search
- FAQ systems

**Key Features:**
- 🔍 Search like Google - no special operators needed
- 🤖 Automatic stopword removal ("the", "is", "how", "to", etc.)
- 📊 Natural relevance scoring with BM25 algorithm
- 🎯 Question-like queries ("how to...", "what is...")
- ⚡ Combine with WHERE conditions and sorting

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

Save this as `fulltext_demo.py` and run with `python3 fulltext_demo.py`:

```python
from matrixone import Client, FulltextIndex, FulltextAlgorithmType
from matrixone.config import get_connection_params
from matrixone.sqlalchemy_ext import natural_match
from matrixone.orm import declarative_base
from sqlalchemy import BigInteger, Column, String, Text, Integer, Float

print("=" * 70)
print("MatrixOne Natural Language Fulltext Search Demo")
print("=" * 70)

# Step 1: Connect to database
host, port, user, password, database = get_connection_params(database='demo')
client = Client()
client.connect(host=host, port=port, user=user, password=password, database=database)
print(f"✓ Successfully connected to database: {host}:{port}/{database}")

# Step 2: Define table structure
Base = declarative_base()

class Article(Base):
    """Article table with BM25 fulltext search"""
    __tablename__ = "natural_search_articles"
    
    id = Column(BigInteger, primary_key=True)
    title = Column(String(200))
    content = Column(Text)
    category = Column(String(100))
    author = Column(String(100))
    tags = Column(String(500))
    views = Column(Integer)
    rating = Column(Float)
    
    __table_args__ = (
        FulltextIndex("idx_article_search", ["title", "content"], 
                     algorithm=FulltextAlgorithmType.BM25),
    )

print(f"✓ Defined table with BM25 fulltext index on (title, content)")

# Step 3: Create table
client.fulltext_index.enable_fulltext()
client.execute('SET ft_relevancy_algorithm = "BM25"')
client.drop_table(Article)
client.create_table(Article)
print("✓ Table created successfully")

# Step 4: Insert sample articles
sample_articles = [
    {
        "id": 1,
        "title": "Getting Started with Machine Learning",
        "content": "Machine learning is revolutionizing technology...",
        "category": "AI",
        "author": "Alice Johnson",
        "tags": "machine-learning, AI, tutorial",
        "views": 1500,
        "rating": 4.5
    },
    # ... more articles
]

client.batch_insert(Article, sample_articles)
print(f"✓ Successfully inserted {len(sample_articles)} articles")

# Step 5: Simple keyword search
print("\nSearch: 'machine learning'")
results = client.query(Article).filter(
    natural_match(Article.title, Article.content, query="machine learning")
).execute()

for row in results.fetchall():
    print(f"  - [{row.id}] {row.title}")

# Cleanup
client.disconnect()
print("\n✅ Demo completed!")
```

## Key Concepts

### 1. Define Table with Fulltext Index

```python
from matrixone import FulltextIndex, FulltextAlgorithmType
from matrixone.orm import declarative_base

Base = declarative_base()

class Article(Base):
    __tablename__ = "articles"
    
    id = Column(BigInteger, primary_key=True)
    title = Column(String(200))
    content = Column(Text)
    
    # Define fulltext index on multiple columns
    __table_args__ = (
        FulltextIndex(
            "idx_search",           # Index name
            ["title", "content"],   # Columns to index
            algorithm=FulltextAlgorithmType.BM25  # Use BM25 algorithm
        ),
    )
```

### 2. Enable Fulltext and Set Algorithm

```python
# Enable fulltext search feature
client.fulltext_index.enable_fulltext()

# Set relevance algorithm to BM25
client.execute('SET ft_relevancy_algorithm = "BM25"')
```

### 3. Use natural_match() for Queries

```python
from matrixone.sqlalchemy_ext import natural_match

# Basic search
results = client.query(Article).filter(
    natural_match(Article.title, Article.content, query="your search terms")
).execute()
```

## Usage Examples

### Simple Keyword Search

Search for articles about "machine learning":

```python
results = client.query(Article).filter(
    natural_match(Article.title, Article.content, query="machine learning")
).execute()

for row in results.fetchall():
    print(f"{row.title} (Category: {row.category})")
```

### Multi-Word Queries

Natural Language mode finds articles matching any of the terms:

```python
# Finds articles with "web", "development", or "javascript"
results = client.query(Article).filter(
    natural_match(Article.title, Article.content, query="web development javascript")
).execute()
```

### Question-Like Queries

Stopwords are automatically handled:

```python
# "how", "to" are ignored, searches for "learn" and "python"
results = client.query(Article).filter(
    natural_match(Article.title, Article.content, query="how to learn python")
).execute()

# "what", "is" are ignored, searches for "machine" and "learning"  
results = client.query(Article).filter(
    natural_match(Article.title, Article.content, query="what is machine learning")
).execute()
```

### Long Natural Phrases

Works with long, natural language queries:

```python
results = client.query(Article).filter(
    natural_match(
        Article.title, 
        Article.content, 
        query="beginner tutorial for learning programming"
    )
).execute()
```

### Combine with WHERE Conditions

Filter by category, author, rating, etc.:

```python
# Search + category filter
results = client.query(Article).filter(
    natural_match(Article.title, Article.content, query="learning")
).filter(
    Article.category == "AI"
).execute()

# Search + rating filter
results = client.query(Article).filter(
    natural_match(Article.title, Article.content, query="python")
).filter(
    Article.rating >= 4.5
).execute()

# Search + multiple filters
results = client.query(Article).filter(
    natural_match(Article.title, Article.content, query="machine learning")
).filter(
    Article.category == "AI"
).filter(
    Article.rating >= 4.5
).filter(
    Article.views > 2000
).execute()
```

### Search by Author

Find articles by specific author:

```python
results = client.query(Article).filter(
    natural_match(Article.title, Article.content, query="machine")
).filter(
    Article.author == "Alice Johnson"
).execute()
```

### Sort Results

Sort by views, rating, or other fields:

```python
# Sort by views (most popular first)
results = client.query(Article).filter(
    natural_match(Article.title, Article.content, query="programming")
).order_by(Article.views.desc()).limit(10).execute()

# Sort by rating (highest rated first)
results = client.query(Article).filter(
    natural_match(Article.title, Article.content, query="learning")
).order_by(Article.rating.desc()).limit(10).execute()

# Sort by multiple fields
results = client.query(Article).filter(
    natural_match(Article.title, Article.content, query="python")
).order_by(
    Article.rating.desc(),
    Article.views.desc()
).execute()
```

### Pagination

Implement pagination for large result sets:

```python
page_size = 10
page_num = 1

results = client.query(Article).filter(
    natural_match(Article.title, Article.content, query="programming")
).limit(page_size).offset((page_num - 1) * page_size).execute()
```

## Sample Data

Here's the complete sample data used in the demo:

```python
sample_articles = [
    {
        "id": 1,
        "title": "Getting Started with Machine Learning",
        "content": "Machine learning is revolutionizing technology. This comprehensive guide covers the fundamentals of machine learning, including supervised and unsupervised learning techniques.",
        "category": "AI",
        "author": "Alice Johnson",
        "tags": "machine-learning, AI, tutorial, beginner",
        "views": 1500,
        "rating": 4.5
    },
    {
        "id": 2,
        "title": "Python Programming for Beginners",
        "content": "Python is one of the most popular programming languages. This tutorial teaches you Python basics, from variables to functions, with practical examples.",
        "category": "Programming",
        "author": "Bob Smith",
        "tags": "python, programming, beginner, tutorial",
        "views": 2300,
        "rating": 4.8
    },
    {
        "id": 3,
        "title": "Deep Learning and Neural Networks",
        "content": "Deep learning is a powerful subset of machine learning. Learn how neural networks work, including convolutional and recurrent networks.",
        "category": "AI",
        "author": "Alice Johnson",
        "tags": "deep-learning, neural-networks, AI",
        "views": 3200,
        "rating": 4.7
    },
    # ... more articles
]
```

## Natural Language vs Boolean Mode

### Natural Language Mode (This Demo)

**Advantages:**
- ✅ User-friendly - search like Google
- ✅ Automatic stopword removal
- ✅ No operators needed
- ✅ Natural relevance ranking
- ✅ Perfect for end-user search boxes

**Example:**
```python
# Just type naturally
natural_match(Article.title, Article.content, query="how to learn python")
```

### Boolean Mode (Advanced)

**Advantages:**
- ✅ Precise control with operators (+, -, *)
- ✅ Required/excluded terms
- ✅ Wildcard searches

**Example:**
```python
# Advanced operators
boolean_match(Article.title, Article.content, query="+python -beginner")
```

## Best Practices

### 1. Choose Right Columns for Indexing

```python
# Good: Index searchable content
FulltextIndex("idx_search", ["title", "content", "description"])

# Avoid: Don't index IDs, dates, numbers
# FulltextIndex("idx_bad", ["id", "created_at"])  # ❌ Not useful
```

### 2. Use BM25 Algorithm

BM25 provides better relevance than TF-IDF for most use cases:

```python
__table_args__ = (
    FulltextIndex("idx_search", ["title", "content"], 
                 algorithm=FulltextAlgorithmType.BM25),  # ✅ Recommended
)
```

### 3. Combine with Filters

Narrow down results with WHERE conditions:

```python
# Good: Filter by category first, then search
results = client.query(Article).filter(
    Article.category == "AI"  # Fast index lookup
).filter(
    natural_match(Article.title, Article.content, query="learning")
).execute()
```

### 4. Add Sorting for Better UX

```python
# Show most popular results first
results = client.query(Article).filter(
    natural_match(Article.title, Article.content, query="python")
).order_by(Article.views.desc()).limit(20).execute()
```

### 5. Implement Pagination

```python
def search_articles(query, page=1, page_size=10):
    return client.query(Article).filter(
        natural_match(Article.title, Article.content, query=query)
    ).limit(page_size).offset((page - 1) * page_size).execute()
```

## Common Use Cases

### 1. Blog/Article Search

```python
class BlogPost(Base):
    __tablename__ = "blog_posts"
    title = Column(String(200))
    content = Column(Text)
    excerpt = Column(Text)
    
    __table_args__ = (
        FulltextIndex("idx_blog_search", ["title", "content", "excerpt"],
                     algorithm=FulltextAlgorithmType.BM25),
    )
```

### 2. Product Search

```python
class Product(Base):
    __tablename__ = "products"
    name = Column(String(200))
    description = Column(Text)
    features = Column(Text)
    
    __table_args__ = (
        FulltextIndex("idx_product_search", ["name", "description", "features"],
                     algorithm=FulltextAlgorithmType.BM25),
    )
```

### 3. Documentation Search

```python
class Documentation(Base):
    __tablename__ = "docs"
    title = Column(String(200))
    content = Column(Text)
    keywords = Column(String(500))
    
    __table_args__ = (
        FulltextIndex("idx_docs_search", ["title", "content", "keywords"],
                     algorithm=FulltextAlgorithmType.BM25),
    )
```

### 4. FAQ Search

```python
class FAQ(Base):
    __tablename__ = "faqs"
    question = Column(String(500))
    answer = Column(Text)
    
    __table_args__ = (
        FulltextIndex("idx_faq_search", ["question", "answer"],
                     algorithm=FulltextAlgorithmType.BM25),
    )
```

## Troubleshooting

### Issue: "Fulltext feature not enabled"

**Solution**: Enable fulltext before creating table

```python
client.fulltext_index.enable_fulltext()
client.create_table(Article)
```

### Issue: "No results returned"

**Solution**: Check if fulltext index exists and algorithm is set

```python
# Verify algorithm is set
client.execute('SET ft_relevancy_algorithm = "BM25"')

# Check if data exists
count = client.query(Article).count()
print(f"Total articles: {count}")
```

### Issue: "Search too slow"

**Solution**: Ensure fulltext index is created and optimize queries

```python
# Good: Filter by indexed columns first
results = client.query(Article).filter(
    Article.category == "AI"  # Index lookup
).filter(
    natural_match(Article.title, Article.content, query="learning")
).execute()

# Add LIMIT to improve performance
results = client.query(Article).filter(
    natural_match(Article.title, Article.content, query="learning")
).limit(100).execute()  # Only fetch top 100
```

### Issue: "Special characters causing issues"

**Solution**: Natural Language mode handles most characters automatically

```python
# These work automatically:
# - Apostrophes: "don't", "won't"
# - Hyphens: "state-of-the-art"
# - Numbers: "Python 3.9"

# Just pass the query as-is
results = client.query(Article).filter(
    natural_match(Article.title, Article.content, 
                 query="state-of-the-art Python 3.9")
).execute()
```

## Performance Tips

### 1. Limit Result Count

```python
# Always use LIMIT for pagination
results = client.query(Article).filter(
    natural_match(Article.title, Article.content, query="python")
).limit(20).execute()
```

### 2. Select Only Needed Columns

```python
# Good: Select specific columns
results = client.query(
    Article.id, Article.title, Article.category
).filter(
    natural_match(Article.title, Article.content, query="python")
).execute()

# Avoid: SELECT * when not needed
```

### 3. Use Category/Tag Filters

```python
# Narrow search space with filters
results = client.query(Article).filter(
    Article.category.in_(["AI", "Programming"])  # Fast filter
).filter(
    natural_match(Article.title, Article.content, query="tutorial")
).execute()
```

## Reference

- [MatrixOne Python SDK Documentation](https://matrixone.readthedocs.io/en/latest/)
- [GitHub - MatrixOne Python Client](https://github.com/matrixorigin/matrixone/tree/main/clients/python)
- [Fulltext Search Guide](../Develop/schema-design/create-secondary-index.md)
- [BM25 Algorithm](https://en.wikipedia.org/wiki/Okapi_BM25)

## Summary

Natural Language fulltext search in MatrixOne provides:

✅ **User-Friendly**: Search like Google, no operators needed  
✅ **Intelligent**: Automatic stopword removal and stemming  
✅ **Flexible**: Combine with WHERE, ORDER BY, LIMIT  
✅ **Fast**: BM25 algorithm with fulltext indexing  
✅ **Powerful**: Multi-column search with relevance ranking  

Perfect for building search features in your applications! 🚀

