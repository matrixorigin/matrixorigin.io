# Fulltext Boolean Search Demo

## Overview

This tutorial demonstrates **Boolean mode fulltext search** in MatrixOne Python SDK. Boolean mode provides precise control over search logic using operators, perfect for advanced search interfaces and filtering.

**Boolean Operators:**

- ✅ **MUST (+)**: Required terms (AND logic)
- ❌ **MUST_NOT (-)**: Excluded terms (NOT logic)
- 📈 **ENCOURAGE**: Optional terms that boost relevance
- 📉 **DISCOURAGE (~)**: Terms that reduce relevance
- 🔤 **PHRASE ("")**: Exact phrase matching

**Perfect For:**

- Advanced search interfaces
- Precise query control
- Power user features
- Complex filtering logic
- Professional search tools

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

Save this as `boolean_search_demo.py` and run with `python3 boolean_search_demo.py`:

```python
from matrixone import Client, FulltextIndex, FulltextAlgorithmType
from matrixone.config import get_connection_params
from matrixone.sqlalchemy_ext import boolean_match
from matrixone.orm import declarative_base
from sqlalchemy import BigInteger, Column, String, Text, Integer, Float

print("="* 70)
print("MatrixOne Boolean Mode Fulltext Search Demo")
print("="* 70)

# Connect to database
host, port, user, password, database = get_connection_params(database='demo')
client = Client()
client.connect(host=host, port=port, user=user, password=password, database=database)
print(f"Successfully connected to database")

# Define table structure
Base = declarative_base()

class Article(Base):
    """Article table with BM25 fulltext search"""
    __tablename__ = "boolean_search_articles"

    id = Column(BigInteger, primary_key=True)
    title = Column(String(200))
    content = Column(Text)
    category = Column(String(100))
    author = Column(String(100))
    views = Column(Integer)
    rating = Column(Float)

    __table_args__ = (
        FulltextIndex("idx_article_search", ["title", "content"],
                     algorithm=FulltextAlgorithmType.BM25),
    )

# Create table
client.fulltext_index.enable_fulltext()
client.execute('SET ft_relevancy_algorithm = "BM25"')
client.drop_table(Article)
client.create_table(Article)
print("Table created with BM25 index")

# Insert sample articles
sample_articles = [
    {
        "id": 1,
        "title": "Introduction to Machine Learning",
        "content": "Machine learning is a subset of AI...",
        "category": "AI",
        "author": "Alice Johnson",
        "views": 1500,
        "rating": 4.5
    },
    # ... more articles
]

client.batch_insert(Article, sample_articles)
print(f"Inserted {len(sample_articles)} articles")

# MUST search - both terms required
print("\nMUST search: 'machine' AND 'learning'")
results = client.query(Article).filter(
    boolean_match(Article.title, Article.content).must("machine", "learning")
).execute()

for row in results.fetchall():
    print(f"- {row.title}")

# MUST_NOT search - exclude terms
print("\nMUST 'programming' but NOT 'legacy'")
results = client.query(Article).filter(
    boolean_match(Article.title, Article.content)
    .must("programming")
    .must_not("legacy")
).execute()

for row in results.fetchall():
    print(f"- {row.title}")

# Cleanup
client.disconnect()
print("\n Demo completed!")
```

## Boolean Operators Explained

### 1. MUST (+) - Required Terms

All specified terms **must** appear in the document (AND logic):

```python
# Both 'machine' AND 'learning' must be present
results = client.query(Article).filter(
    boolean_match(Article.title, Article.content).must("machine", "learning")
).execute()
```

**Equivalent to traditional syntax:** `+machine +learning`

### 2. MUST_NOT (-) - Excluded Terms

Specified terms **must not** appear in the document:

```python
# Must contain 'programming' but must NOT contain 'legacy'
results = client.query(Article).filter(
    boolean_match(Article.title, Article.content)
    .must("programming")
    .must_not("legacy")
).execute()
```

**Equivalent to traditional syntax:** `+programming -legacy`

### 3. ENCOURAGE - Boost Relevance

Optional terms that increase relevance score if present:

```python
# Must have 'Python', prefer articles with 'data' or 'science'
results = client.query(Article).filter(
    boolean_match(Article.title, Article.content)
    .must("Python")
    .encourage("data", "science")
).execute()
```

**Behavior:** Articles with encouraged terms rank higher, but articles without them still match.

### 4. DISCOURAGE (~) - Reduce Relevance

Terms that decrease relevance score if present:

```python
# Must have 'Python', discourage 'legacy' (but still matches)
results = client.query(Article).filter(
    boolean_match(Article.title, Article.content)
    .must("Python")
    .encourage("practices")
    .discourage("legacy")
).execute()
```

**Equivalent to traditional syntax:** `+Python practices ~legacy`

### 5. PHRASE - Exact Phrase Match

Match exact phrase (multiple words in order):

```python
# Find exact phrase "neural networks"
results = client.query(Article).filter(
    boolean_match(Article.title, Article.content).phrase("neural networks")
).execute()

# Find exact phrase "best practices"
results = client.query(Article).filter(
    boolean_match(Article.title, Article.content).phrase("best practices")
).execute()
```

**Equivalent to traditional syntax:** `"neural networks"`

## Usage Examples

### Simple MUST Searches

#### Single Required Term

```python
# Find all articles about 'Python'
results = client.query(Article).filter(
    boolean_match(Article.title, Article.content).must("Python")
).execute()
```

#### Multiple Required Terms

```python
# Must contain both 'machine' and 'learning'
results = client.query(Article).filter(
    boolean_match(Article.title, Article.content).must("machine", "learning")
).execute()
```

### Excluding Terms with MUST_NOT

#### Exclude Single Term

```python
# Contains 'learning' but excludes 'deep'
results = client.query(Article).filter(
    boolean_match(Article.title, Article.content)
    .must("learning")
    .must_not("deep")
).execute()
```

#### Exclude Multiple Terms

```python
# Contains 'programming' but excludes both 'legacy' and 'deprecated'
results = client.query(Article).filter(
    boolean_match(Article.title, Article.content)
    .must("programming")
    .must_not("legacy", "deprecated")
).execute()
```

### Boosting with ENCOURAGE

```python
# Find Python articles, boost those about data science
results = client.query(Article).filter(
    boolean_match(Article.title, Article.content)
    .must("Python")
    .encourage("data", "science")
).execute()

# Articles with 'data' or 'science' will rank higher
```

### Reducing Relevance with DISCOURAGE

```python
# Find programming articles, lower rank for legacy code
results = client.query(Article).filter(
    boolean_match(Article.title, Article.content)
    .must("programming")
    .discourage("legacy", "deprecated")
).execute()

# Legacy articles still match but appear lower in results
```

### Exact Phrase Matching

```python
# Find exact phrase
results = client.query(Article).filter(
    boolean_match(Article.title, Article.content).phrase("neural networks")
).execute()

# Only matches documents with "neural" followed by "networks"
```

### Complex Combinations

Combine multiple operators for sophisticated queries:

```python
# MUST 'learning' + ENCOURAGE 'machine'/'deep' + MUST_NOT 'legacy'
results = client.query(Article).filter(
    boolean_match(Article.title, Article.content)
    .must("learning")
    .encourage("machine", "deep")
    .must_not("legacy")
).execute()
```

### Combine with WHERE Conditions

Filter by category, author, rating, etc.:

```python
# Boolean search + category filter
results = client.query(Article).filter(
    boolean_match(Article.title, Article.content).must("learning")
).filter(
    Article.category == "AI"
).filter(
    Article.rating >= 4.5
).execute()

# Boolean search + author filter
results = client.query(Article).filter(
    boolean_match(Article.title, Article.content).must("machine")
).filter(
    Article.author == "Alice Johnson"
).execute()

# Boolean search + views filter
results = client.query(Article).filter(
    boolean_match(Article.title, Article.content).must("programming")
).filter(
    Article.views > 1000
).execute()
```

### Sorting Results

```python
# Sort by views (descending)
results = client.query(Article).filter(
    boolean_match(Article.title, Article.content).encourage("programming", "development")
).order_by(Article.views.desc()).limit(5).execute()

# Sort by rating (descending)
results = client.query(Article).filter(
    boolean_match(Article.title, Article.content).must("learning")
).order_by(Article.rating.desc()).limit(5).execute()

# Multiple sort fields
results = client.query(Article).filter(
    boolean_match(Article.title, Article.content).must("Python")
).order_by(
    Article.rating.desc(),
    Article.views.desc()
).execute()
```

## Sample Data

Complete sample data with 8 articles covering various topics:

```python
sample_articles = [
    {
        "id": 1,
        "title": "Introduction to Machine Learning",
        "content": "Machine learning is a subset of artificial intelligence that enables computers to learn from data without explicit programming.",
        "category": "AI",
        "author": "Alice Johnson",
        "views": 1500,
        "rating": 4.5
    },
    {
        "id": 2,
        "title": "Python Programming Best Practices",
        "content": "Python is a versatile programming language. This article covers best practices for writing clean, maintainable Python code.",
        "category": "Programming",
        "author": "Bob Smith",
        "views": 2300,
        "rating": 4.8
    },
    {
        "id": 3,
        "title": "Deep Learning with Neural Networks",
        "content": "Deep learning uses multi-layer neural networks to learn complex patterns in data for tasks like image recognition.",
        "category": "AI",
        "author": "Alice Johnson",
        "views": 3200,
        "rating": 4.7
    },
    {
        "id": 4,
        "title": "Web Development with JavaScript",
        "content": "JavaScript is essential for modern web development. Learn DOM manipulation, async programming, and popular frameworks.",
        "category": "Web",
        "author": "Carol Williams",
        "views": 1800,
        "rating": 4.3
    },
    {
        "id": 5,
        "title": "Database Design Principles",
        "content": "Good database design is crucial for application performance. Covers normalization, indexing, and query optimization.",
        "category": "Database",
        "author": "David Brown",
        "views": 1200,
        "rating": 4.6
    },
    {
        "id": 6,
        "title": "Machine Learning Algorithms",
        "content": "Comprehensive guide to machine learning algorithms including supervised learning, unsupervised learning techniques.",
        "category": "AI",
        "author": "Alice Johnson",
        "views": 2800,
        "rating": 4.9
    },
    {
        "id": 7,
        "title": "Python Data Science Tools",
        "content": "Python offers powerful libraries for data science including NumPy, Pandas, Matplotlib for data analysis.",
        "category": "Data Science",
        "author": "Emma Davis",
        "views": 2100,
        "rating": 4.4
    },
    {
        "id": 8,
        "title": "Legacy Code Maintenance",
        "content": "Working with legacy code requires patience and careful refactoring to maintain functionality.",
        "category": "Programming",
        "author": "Frank Miller",
        "views": 900,
        "rating": 3.8
    },
]
```

## Boolean vs Natural Language Mode

### When to Use Boolean Mode

**Use Boolean mode when:**

- ✅ You need precise control over term inclusion/exclusion
- ✅ Building advanced search interfaces with filters
- ✅ Users are familiar with search operators
- ✅ You need exact phrase matching
- ✅ Fine-tuning relevance is important

### When to Use Natural Language Mode

**Use Natural Language mode when:**

- ✅ Building simple, user-friendly search boxes
- ✅ Users are not technical (like Google search)
- ✅ Automatic stopword removal is desired
- ✅ Question-like queries are common
- ✅ Simplicity is more important than precision

### Comparison Table

| Feature | Boolean Mode | Natural Language Mode |
|---------|--------------|----------------------|
| **Operators** | Explicit (+, -, ~, "") | None needed |
| **Control** | Precise | Automatic |
| **Stopwords** | Manual | Automatic removal |
| **Use Case** | Advanced users | General users |
| **Relevance** | Fine-tunable | Auto-optimized |
| **Example** | `+python -legacy` | `python programming` |

## Advanced Use Cases

### 1. E-commerce Product Search

```python
class Product(Base):
    __tablename__ = "products"
    name = Column(String(200))
    description = Column(Text)
    brand = Column(String(100))
    price = Column(Float)

    __table_args__ = (
        FulltextIndex("idx_product_search", ["name", "description"],
                     algorithm=FulltextAlgorithmType.BM25),
    )

# Find laptops, prefer gaming, exclude refurbished
results = client.query(Product).filter(
    boolean_match(Product.name, Product.description)
    .must("laptop")
    .encourage("gaming")
    .must_not("refurbished")
).filter(
    Product.price < 2000
).execute()
```

### 2. Job Posting Search

```python
class JobPosting(Base):
    __tablename__ = "jobs"
    title = Column(String(200))
    description = Column(Text)
    requirements = Column(Text)

    __table_args__ = (
        FulltextIndex("idx_job_search", ["title", "description", "requirements"],
                     algorithm=FulltextAlgorithmType.BM25),
    )

# Find Python jobs, prefer senior, exclude internships
results = client.query(JobPosting).filter(
    boolean_match(JobPosting.title, JobPosting.description, JobPosting.requirements)
    .must("Python")
    .encourage("senior", "lead")
    .must_not("intern", "junior")
).execute()
```

### 3. Academic Paper Search

```python
class ResearchPaper(Base):
    __tablename__ = "papers"
    title = Column(String(500))
    abstract = Column(Text)
    keywords = Column(String(500))

    __table_args__ = (
        FulltextIndex("idx_paper_search", ["title", "abstract", "keywords"],
                     algorithm=FulltextAlgorithmType.BM25),
    )

# Find ML papers, prefer deep learning, exclude surveys
results = client.query(ResearchPaper).filter(
    boolean_match(ResearchPaper.title, ResearchPaper.abstract)
    .must("machine learning")
    .encourage("deep learning", "neural")
    .must_not("survey", "review")
).execute()
```

### 4. News Article Search

```python
# Recent tech news, exclude politics
results = client.query(Article).filter(
    boolean_match(Article.title, Article.content)
    .must("technology")
    .encourage("AI", "blockchain", "cloud")
    .must_not("politics", "election")
).filter(
    Article.published_date > "2025-01-01"
).order_by(Article.published_date.desc()).execute()
```

## Best Practices

### 1. Use MUST for Required Terms

```python
# Good: Explicitly mark required terms
boolean_match(Article.title, Article.content).must("Python", "tutorial")

# Avoid: Relying only on ENCOURAGE for critical terms
boolean_match(Article.title, Article.content).encourage("Python", "tutorial")
```

### 2. Combine Operators Wisely

```python
# Good: Clear search intent
boolean_match(Article.title, Article.content)
.must("programming")        # Required
.encourage("Python", "Go")  # Prefer these languages
.must_not("deprecated")     # Exclude old content

# Avoid: Too many MUST terms (overly restrictive)
boolean_match(Article.title, Article.content)
.must("programming", "Python", "tutorial", "beginner", "guide")  # Too strict
```

### 3. Use Filters to Narrow Results

```python
# Good: Filter by category first
results = client.query(Article).filter(
    Article.category == "AI"  # Fast indexed filter
).filter(
    boolean_match(Article.title, Article.content).must("learning")
).execute()
```

### 4. Sort for Better UX

```python
# Sort by relevance + popularity
results = client.query(Article).filter(
    boolean_match(Article.title, Article.content).must("Python")
).order_by(Article.views.desc()).limit(10).execute()
```

### 5. Use PHRASE for Exact Matches

```python
# When term order matters
boolean_match(Article.title, Article.content).phrase("machine learning")

# Better than:
boolean_match(Article.title, Article.content).must("machine", "learning")
# ^ This matches "learning machine" too
```

## Operator Chaining Examples

### Example 1: Tech Blog Search

```python
# Find AI articles, prefer deep learning, exclude beginner content
results = client.query(Article).filter(
    boolean_match(Article.title, Article.content)
    .must("artificial intelligence")
    .encourage("deep learning", "neural networks")
    .must_not("beginner", "introduction")
).filter(
    Article.rating >= 4.0
).execute()
```

### Example 2: Tutorial Search

```python
# Find Python tutorials, prefer advanced, exclude legacy
results = client.query(Article).filter(
    boolean_match(Article.title, Article.content)
    .must("Python", "tutorial")
    .encourage("advanced", "expert")
    .must_not("legacy", "deprecated", "Python 2")
).execute()
```

### Example 3: Research Papers

```python
# Find ML research, prefer transformers, exclude surveys
results = client.query(Article).filter(
    boolean_match(Article.title, Article.content)
    .must("machine learning")
    .encourage("transformer", "attention", "BERT")
    .must_not("survey", "review paper")
).order_by(Article.views.desc()).execute()
```

### Example 4: Product Reviews

```python
# Find product reviews, must be positive, exclude negative terms
results = client.query(Article).filter(
    boolean_match(Article.title, Article.content)
    .must("review")
    .encourage("excellent", "amazing", "great")
    .must_not("terrible", "awful", "broken")
).filter(
    Article.rating >= 4.0
).execute()
```

## Troubleshooting

### Issue: "No results with MUST operator"

**Solution**: Terms might be too restrictive, try ENCOURAGE instead

```python
# Too restrictive - might return 0 results
boolean_match(Article.title, Article.content).must("machine", "learning", "deep", "neural")

# Better: Use MUST for key terms, ENCOURAGE for optional
boolean_match(Article.title, Article.content)
.must("machine", "learning")
.encourage("deep", "neural")
```

### Issue: "Phrase search not working"

**Solution**: Ensure exact phrase exists in content

```python
# Check if phrase exists
results = client.query(Article).filter(
    Article.content.like("%neural networks%")
).execute()

# Then try phrase search
results = client.query(Article).filter(
    boolean_match(Article.title, Article.content).phrase("neural networks")
).execute()
```

### Issue: "ENCOURAGE not affecting ranking"

**Solution**: Ensure BM25 algorithm is set

```python
# Set BM25 for proper relevance scoring
client.execute('SET ft_relevancy_algorithm = "BM25"')

# Verify it's set
result = client.execute("SHOW VARIABLES LIKE 'ft_relevancy_algorithm'")
```

### Issue: "Search ignoring MUST_NOT"

**Solution**: Verify filter syntax is correct

```python
# Correct: Use must_not() method
boolean_match(Article.title, Article.content)
.must("Python")
.must_not("legacy")  # ✅ Correct

# Wrong: Trying to use negative operator in string
boolean_match(Article.title, Article.content, query="+Python -legacy")  # ❌ Wrong
```

## Performance Optimization

### 1. Add Category Filters

```python
# Fast: Filter by category first
results = client.query(Article).filter(
    Article.category.in_(["AI", "Programming"])
).filter(
    boolean_match(Article.title, Article.content).must("learning")
).execute()
```

### 2. Use LIMIT

```python
# Always limit results for pagination
results = client.query(Article).filter(
    boolean_match(Article.title, Article.content).must("Python")
).limit(20).execute()
```

### 3. Select Specific Columns

```python
# Don't fetch all columns if not needed
results = client.query(
    Article.id, Article.title, Article.category
).filter(
    boolean_match(Article.title, Article.content).must("Python")
).execute()
```

## Reference

- [MatrixOne Python SDK Documentation](https://matrixone.readthedocs.io/en/latest/)
- [GitHub - MatrixOne Python Client](https://github.com/matrixorigin/matrixone/tree/main/clients/python)
- [Fulltext Search Guide](../Develop/schema-design/create-secondary-index.md)
- [BM25 Algorithm](https://en.wikipedia.org/wiki/Okapi_BM25)
- [Natural Language Search Demo](fulltext-natural-search-demo.md) - Simpler alternative

## Summary

Boolean mode fulltext search provides:

✅ **Precise Control**: Use +, -, ~ operators for exact logic
✅ **Complex Queries**: Combine multiple operators
✅ **Phrase Matching**: Exact phrase search with ""
✅ **Relevance Tuning**: ENCOURAGE/DISCOURAGE for ranking
✅ **Professional**: Perfect for advanced search interfaces

**Comparison:**

- **Natural Language Mode**: User-friendly, automatic (like Google)
- **Boolean Mode**: Powerful, precise (like advanced search)

Choose based on your users' needs! 🚀
