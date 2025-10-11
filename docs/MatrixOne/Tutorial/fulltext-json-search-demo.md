# JSON Parser Fulltext Search Demo

## Overview

This tutorial demonstrates **JSON parser capabilities for fulltext search** in MatrixOne Python SDK. The JSON parser enables fulltext search on JSON content, indexing **values** (not keys), allowing you to search structured data efficiently.

**Key Features:**
- 🔍 Search within JSON values (keys are not indexed)
- 📦 Index product specifications stored as JSON
- 👤 Search user preferences and settings
- ⚙️ Query configuration data in JSON format
- 🔗 Combine JSON search with WHERE conditions
- 📊 Perfect for semi-structured data

**Perfect For:**
- E-commerce product catalogs with varying specs
- User profiles with custom preferences
- Application configurations
- Metadata and tagging systems
- Flexible schema designs

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

Save this as `json_search_demo.py` and run with `python3 json_search_demo.py`:

```python
from matrixone import Client, FulltextIndex
from matrixone.config import get_connection_params
from matrixone.sqlalchemy_ext import boolean_match
from matrixone.orm import declarative_base
from sqlalchemy import BigInteger, Column, String, Text, Float
import json

print("=" * 70)
print("MatrixOne JSON Parser Fulltext Search Demo")
print("=" * 70)

# Connect to database
host, port, user, password, database = get_connection_params(database='demo')
client = Client()
client.connect(host=host, port=port, user=user, password=password, database=database)
print(f"✓ Connected to database")

# Define table with JSON columns
Base = declarative_base()

class Product(Base):
    __tablename__ = "json_demo_products"
    
    id = Column(BigInteger, primary_key=True)
    name = Column(String(200))
    category = Column(String(100))
    price = Column(Float)
    specifications = Column(Text)  # JSON format
    features = Column(Text)  # JSON format
    
    __table_args__ = (
        FulltextIndex("idx_specs", "specifications", parser="json"),
        FulltextIndex("idx_features", "features", parser="json"),
    )

# Create table
client.fulltext_index.enable_fulltext()
client.drop_table(Product)
client.create_table(Product)
print("✓ Table created with JSON indexes")

# Insert products with JSON data
sample_products = [
    {
        "id": 1,
        "name": "Gaming Laptop Pro",
        "category": "Electronics",
        "price": 1999.99,
        "specifications": json.dumps({
            "processor": "Intel Core i9",
            "ram": "32GB DDR5",
            "graphics": "NVIDIA RTX 4080"
        }),
        "features": json.dumps({
            "rgb_keyboard": True,
            "cooling": "liquid cooling",
            "ports": ["USB-C", "HDMI", "Thunderbolt"]
        })
    },
    # ... more products
]

client.batch_insert(Product, sample_products)
print(f"✓ Inserted {len(sample_products)} products")

# Search in JSON specifications
print("\nSearch for 'RGB' in specifications:")
results = client.query(Product).filter(
    boolean_match(Product.specifications).must("RGB")
).execute()

for row in results.fetchall():
    print(f"  - {row.name}")

# Search in JSON features
print("\nSearch for 'wireless' technology:")
results = client.query(Product).filter(
    boolean_match(Product.specifications).must("wireless")
).execute()

for row in results.fetchall():
    print(f"  - {row.name}")

# Cleanup
client.disconnect()
print("\n✅ Demo completed!")
```

## Key Concepts

### 1. Define Table with JSON Fulltext Index

The `parser="json"` parameter tells MatrixOne to parse and index JSON values:

```python
from matrixone import FulltextIndex

class Product(Base):
    __tablename__ = "products"
    
    id = Column(BigInteger, primary_key=True)
    specifications = Column(Text)  # Store JSON as TEXT
    features = Column(Text)        # Store JSON as TEXT
    
    __table_args__ = (
        # JSON parser indexes values, not keys
        FulltextIndex("idx_specs", "specifications", parser="json"),
        FulltextIndex("idx_features", "features", parser="json"),
    )
```

**Important:** Only JSON **values** are indexed, not keys!

### 2. Store JSON Data

Store JSON as text using `json.dumps()`:

```python
import json

product = {
    "id": 1,
    "name": "Laptop",
    "specifications": json.dumps({
        "processor": "Intel Core i9",
        "ram": "32GB",
        "storage": "1TB SSD"
    })
}

client.batch_insert(Product, [product])
```

### 3. Search JSON Values

Use `boolean_match()` on JSON columns:

```python
# Search for "Intel" in specifications (searches values only)
results = client.query(Product).filter(
    boolean_match(Product.specifications).must("Intel")
).execute()
```

## Detailed Examples

### Product Specifications Search

#### Search by Processor Brand

```python
# Find products with Intel processors
results = client.query(Product).filter(
    boolean_match(Product.specifications).must("Intel")
).execute()

for row in results.fetchall():
    specs = json.loads(row.specifications)
    print(f"{row.name}: {specs.get('processor', 'N/A')}")
```

#### Search by Graphics Card

```python
# Find products with NVIDIA graphics
results = client.query(Product).filter(
    boolean_match(Product.specifications).must("NVIDIA")
).execute()

for row in results.fetchall():
    specs = json.loads(row.specifications)
    print(f"{row.name}: {specs.get('graphics', 'N/A')}")
```

#### Search by Connectivity

```python
# Find wireless products
results = client.query(Product).filter(
    boolean_match(Product.specifications).must("wireless")
).execute()
```

#### Search by Color

```python
# Find black products
results = client.query(Product).filter(
    boolean_match(Product.specifications).must("black")
).execute()
```

### Product Features Search

#### Search by Feature Type

```python
# Find products with RGB features
results = client.query(Product).filter(
    boolean_match(Product.features).must("RGB")
).execute()

# Find programmable products
results = client.query(Product).filter(
    boolean_match(Product.features).must("programmable")
).execute()

# Find products with HDR support
results = client.query(Product).filter(
    boolean_match(Product.features).must("HDR")
).execute()
```

#### Search with Boolean Operators

```python
# Must have customization features
results = client.query(Product).filter(
    boolean_match(Product.features).encourage("customizable", "adjustable")
).execute()
```

### User Preferences Search

#### Search by Interest

```python
# Find users interested in gaming
results = client.query(UserProfile).filter(
    boolean_match(UserProfile.preferences).must("gaming")
).execute()

for row in results.fetchall():
    prefs = json.loads(row.preferences)
    print(f"{row.username}: {prefs['interests']}")
```

#### Search by Brand Preference

```python
# Find NVIDIA fans
results = client.query(UserProfile).filter(
    boolean_match(UserProfile.preferences).must("NVIDIA")
).execute()

# Find users who like creative tools
results = client.query(UserProfile).filter(
    boolean_match(UserProfile.preferences).encourage("design", "photography")
).execute()
```

### User Settings Search

```python
# Find dark mode users
results = client.query(UserProfile).filter(
    boolean_match(UserProfile.settings).must("dark")
).execute()

for row in results.fetchall():
    settings = json.loads(row.settings)
    print(f"{row.username}: Theme = {settings['theme']}")
```

### Configuration Data Search

#### Search by Technology Stack

```python
# Find apps using Kafka
results = client.query(Configuration).filter(
    boolean_match(Configuration.config_data).must("kafka")
).execute()

# Find apps using cloud storage
results = client.query(Configuration).filter(
    boolean_match(Configuration.config_data).encourage("cloud", "storage")
).execute()
```

#### Search by Environment

```python
# Find production configs
results = client.query(Configuration).filter(
    boolean_match(Configuration.meta_info).must("production")
).execute()

# Find scalable applications
results = client.query(Configuration).filter(
    boolean_match(Configuration.meta_info).must("scalable")
).execute()
```

### Combining JSON Search with Filters

#### Filter by Category and Price

```python
# Search 'RGB' in Electronics under $2000
results = client.query(Product).filter(
    boolean_match(Product.specifications).must("RGB")
).filter(
    Product.category == "Electronics"
).filter(
    Product.price < 2000
).execute()
```

#### Filter by Multiple Conditions

```python
# Wireless products in Accessories category under $100
results = client.query(Product).filter(
    boolean_match(Product.specifications).must("wireless")
).filter(
    Product.category == "Accessories"
).filter(
    Product.price < 100
).execute()
```

## Sample Data Structures

### Product JSON Schema

```python
{
    "specifications": {
        "processor": "Intel Core i9",
        "ram": "32GB DDR5",
        "storage": "1TB NVMe SSD",
        "graphics": "NVIDIA RTX 4080",
        "display": "17.3 inch 4K",
        "color": "black"
    },
    "features": {
        "rgb_keyboard": True,
        "cooling": "advanced liquid cooling",
        "ports": ["USB-C", "HDMI 2.1", "Thunderbolt 4"],
        "wireless": "WiFi 6E Bluetooth 5.2"
    }
}
```

### User Profile JSON Schema

```python
{
    "preferences": {
        "interests": ["gaming", "programming", "AI"],
        "favorite_brands": ["Intel", "NVIDIA", "AMD"],
        "preferred_colors": ["black", "red", "blue"],
        "budget": "high end"
    },
    "settings": {
        "theme": "dark mode",
        "notifications": "enabled",
        "language": "English",
        "privacy": "friends only"
    }
}
```

### Configuration JSON Schema

```python
{
    "config_data": {
        "database": "postgresql",
        "cache": "redis",
        "queue": "rabbitmq",
        "logging": "elasticsearch"
    },
    "meta_info": {
        "environment": "production",
        "region": "us-east-1",
        "tags": ["high-availability", "scalable"],
        "maintainer": "devops team"
    }
}
```

## Best Practices

### 1. Store JSON as TEXT Column

```python
# Correct: Use Text type for JSON storage
specifications = Column(Text)

# Not: Don't use JSON type for fulltext indexing
# specifications = Column(JSON)  # Won't work with fulltext
```

### 2. Use json.dumps() and json.loads()

```python
import json

# Inserting: Convert dict to JSON string
data = {
    "id": 1,
    "specifications": json.dumps({"cpu": "Intel i9"})
}

# Querying: Parse JSON string back to dict
row = results.fetchone()
specs = json.loads(row.specifications)
```

### 3. Index Only Searchable Fields

```python
# Good: Index fields that users will search
FulltextIndex("idx_specs", "specifications", parser="json")
FulltextIndex("idx_features", "features", parser="json")

# Avoid: Don't index IDs or timestamps in JSON
# FulltextIndex("idx_metadata", "internal_ids", parser="json")  # Not useful
```

### 4. Combine with Category Filters

```python
# Efficient: Filter by indexed category first
results = client.query(Product).filter(
    Product.category == "Electronics"  # Fast index lookup
).filter(
    boolean_match(Product.specifications).must("RGB")  # Then JSON search
).execute()
```

### 5. Normalize Common Search Terms

```python
# Good: Use consistent casing in JSON values
{"processor": "Intel Core i9"}  # lowercase keys, proper case values

# Helps searching be more predictable
```

## Use Cases

### 1. E-commerce Product Catalog

```python
# Products with varying specifications
class Product(Base):
    specifications = Column(Text)  # Different specs per category
    
    __table_args__ = (
        FulltextIndex("idx_specs", "specifications", parser="json"),
    )

# Laptops have: processor, ram, graphics
# Keyboards have: switches, layout, connectivity
# Monitors have: size, resolution, panel
```

### 2. User Personalization

```python
# User preferences vary by user
class UserProfile(Base):
    preferences = Column(Text)  # Flexible JSON preferences
    
    __table_args__ = (
        FulltextIndex("idx_prefs", "preferences", parser="json"),
    )

# Search users by interests, brands, preferences
```

### 3. Application Configuration

```python
# Config structures vary by app
class AppConfig(Base):
    config_data = Column(Text)  # JSON configuration
    
    __table_args__ = (
        FulltextIndex("idx_config", "config_data", parser="json"),
    )

# Search configs by technology, service, setting
```

### 4. Metadata and Tags

```python
# Flexible metadata storage
class Document(Base):
    metadata = Column(Text)  # JSON metadata
    tags = Column(Text)     # JSON tags
    
    __table_args__ = (
        FulltextIndex("idx_meta", "metadata", parser="json"),
        FulltextIndex("idx_tags", "tags", parser="json"),
    )
```

## Important Notes

### What Gets Indexed

**✅ Indexed (JSON Values):**
```json
{
    "processor": "Intel Core i9",  // "Intel Core i9" is indexed
    "ram": "32GB DDR5",            // "32GB DDR5" is indexed
    "storage": "1TB SSD"           // "1TB SSD" is indexed
}
```

**❌ NOT Indexed (JSON Keys):**
```json
{
    "processor": "...",  // "processor" key is NOT indexed
    "ram": "...",        // "ram" key is NOT indexed
    "storage": "..."     // "storage" key is NOT indexed
}
```

### Search Examples

```python
# ✅ This works - searching values
boolean_match(Product.specifications).must("Intel")  # Finds "Intel Core i9"

# ✅ This works - searching values
boolean_match(Product.specifications).must("32GB")   # Finds "32GB DDR5"

# ❌ This doesn't work - keys aren't indexed
boolean_match(Product.specifications).must("processor")  # Won't find the key
```

### Nested JSON

For nested JSON, values at all levels are indexed:

```python
{
    "specs": {
        "cpu": {
            "brand": "Intel",      // "Intel" is indexed
            "model": "Core i9"     // "Core i9" is indexed
        }
    }
}
```

## Advanced Examples

### Multi-Field JSON Search

Search across multiple JSON columns:

```python
# Search in both specifications AND features
results_specs = client.query(Product).filter(
    boolean_match(Product.specifications).must("wireless")
).execute()

results_features = client.query(Product).filter(
    boolean_match(Product.features).must("wireless")
).execute()

# Or search both
all_wireless = set()
for row in results_specs.fetchall():
    all_wireless.add(row.id)
for row in results_features.fetchall():
    all_wireless.add(row.id)
```

### Complex Filter Combinations

```python
# Find products:
# - With "Intel" in specs
# - In Electronics category
# - Under $2000
# - Must have RGB features

results = client.query(Product).filter(
    boolean_match(Product.specifications).must("Intel")
).filter(
    boolean_match(Product.features).must("RGB")
).filter(
    Product.category == "Electronics"
).filter(
    Product.price < 2000
).execute()
```

### Price Range Search with JSON

```python
# Affordable wireless products
results = client.query(Product).filter(
    boolean_match(Product.specifications).must("wireless")
).filter(
    Product.price.between(50, 200)
).order_by(Product.price.asc()).execute()
```

## Troubleshooting

### Issue: "Keys not being found in search"

**Solution**: Remember that only **values** are indexed, not keys

```python
# ❌ Won't work - "processor" is a key
boolean_match(Product.specifications).must("processor")

# ✅ Works - "Intel" is a value
boolean_match(Product.specifications).must("Intel")
```

### Issue: "Boolean values not searchable"

**Solution**: Boolean values (true/false) are indexed as text

```python
# JSON: {"rgb_keyboard": true}

# ✅ Search for the boolean value
boolean_match(Product.features).must("true")

# Better: Use descriptive text values
# {"rgb_keyboard": "enabled"}
boolean_match(Product.features).must("enabled")
```

### Issue: "Array values not found"

**Solution**: Array elements are indexed individually

```python
# JSON: {"ports": ["USB-C", "HDMI", "Thunderbolt"]}

# ✅ Search for any array element
boolean_match(Product.features).must("USB-C")      # Found
boolean_match(Product.features).must("HDMI")       # Found
boolean_match(Product.features).must("Thunderbolt") # Found
```

### Issue: "Numeric values not found"

**Solution**: Numbers in JSON are indexed as text

```python
# JSON: {"ram": "32GB", "storage_size": 1024}

# ✅ Search text numbers
boolean_match(Product.specifications).must("32GB")

# ✅ Search numeric values as text
boolean_match(Product.specifications).must("1024")
```

### Issue: "Case sensitivity"

**Solution**: Fulltext search is generally case-insensitive

```python
# All of these work (case-insensitive)
boolean_match(Product.specifications).must("intel")
boolean_match(Product.specifications).must("Intel")
boolean_match(Product.specifications).must("INTEL")
```

## Performance Tips

### 1. Filter by Regular Columns First

```python
# Good: Filter category first, then JSON search
results = client.query(Product).filter(
    Product.category == "Electronics"  # Indexed column - fast
).filter(
    boolean_match(Product.specifications).must("Intel")  # JSON search
).execute()
```

### 2. Use Price Ranges

```python
# Narrow search by price before JSON search
results = client.query(Product).filter(
    Product.price.between(500, 1500)
).filter(
    boolean_match(Product.specifications).must("wireless")
).execute()
```

### 3. Limit Results

```python
# Always use LIMIT for performance
results = client.query(Product).filter(
    boolean_match(Product.specifications).must("gaming")
).limit(20).execute()
```

### 4. Select Specific Columns

```python
# Don't fetch JSON if not needed
results = client.query(
    Product.id, Product.name, Product.price  # Skip JSON columns
).filter(
    boolean_match(Product.specifications).must("Intel")
).execute()
```

## Complete Sample Data

### Products

```python
sample_products = [
    {
        "id": 1,
        "name": "Gaming Laptop Pro",
        "category": "Electronics",
        "price": 1999.99,
        "specifications": json.dumps({
            "processor": "Intel Core i9",
            "ram": "32GB DDR5",
            "storage": "1TB NVMe SSD",
            "graphics": "NVIDIA RTX 4080",
            "display": "17.3 inch 4K",
            "color": "black"
        }),
        "features": json.dumps({
            "rgb_keyboard": True,
            "cooling": "advanced liquid cooling",
            "ports": ["USB-C", "HDMI 2.1", "Thunderbolt 4"],
            "wireless": "WiFi 6E Bluetooth 5.2"
        })
    },
    # 5 total products with rich JSON data
]
```

### User Profiles

```python
sample_users = [
    {
        "id": 1,
        "username": "tech_enthusiast",
        "email": "tech@example.com",
        "preferences": json.dumps({
            "interests": ["gaming", "programming", "AI"],
            "favorite_brands": ["Intel", "NVIDIA", "AMD"],
            "preferred_colors": ["black", "red", "blue"],
            "budget": "high end"
        }),
        "settings": json.dumps({
            "theme": "dark mode",
            "notifications": "enabled",
            "language": "English",
            "privacy": "friends only"
        })
    },
    # 3 total users with different preferences
]
```

### Configurations

```python
sample_configs = [
    {
        "id": 1,
        "app_name": "WebApp",
        "version": "2.5.0",
        "config_data": json.dumps({
            "database": "postgresql",
            "cache": "redis",
            "queue": "rabbitmq",
            "logging": "elasticsearch"
        }),
        "meta_info": json.dumps({
            "environment": "production",
            "region": "us-east-1",
            "tags": ["high-availability", "scalable"],
            "maintainer": "devops team"
        })
    },
    # 3 total configurations
]
```

## Comparison with Other Search Methods

| Feature | JSON Parser | Regular Fulltext | Vector Search |
|---------|-------------|------------------|---------------|
| **Data Type** | Semi-structured JSON | Plain text | Numeric vectors |
| **Use Case** | Product specs, configs | Articles, docs | Similarity, recommendations |
| **Search Method** | Keyword in values | Keyword in text | Vector distance |
| **Flexibility** | High (varying schemas) | Medium | Low (fixed dimension) |
| **Precision** | Exact keyword match | Relevance-based | Similarity-based |
| **Best For** | E-commerce, catalogs | Content search | AI/ML applications |

## Reference

- [MatrixOne Python SDK Documentation](https://matrixone.readthedocs.io/en/latest/)
- [GitHub - MatrixOne Python Client](https://github.com/matrixorigin/matrixone/tree/main/clients/python)
- [JSON Data Type](../Reference/Data-Types/json-type.md)
- [Fulltext Search Guide](../Develop/schema-design/create-secondary-index.md)

## Summary

JSON parser fulltext search in MatrixOne provides:

✅ **Flexible Schema**: Handle varying product specifications  
✅ **Value Indexing**: Search JSON values efficiently  
✅ **Combined Filters**: Mix JSON search with WHERE conditions  
✅ **Multiple Tables**: Products, users, configs with different JSON structures  
✅ **Boolean Operators**: Use MUST, MUST_NOT, ENCOURAGE in JSON  
✅ **Production Ready**: Perfect for e-commerce and SaaS applications  

**Key Insight:** Only JSON **values** are indexed, not keys. This makes it perfect for searching product attributes, user preferences, and configuration settings! 🚀

