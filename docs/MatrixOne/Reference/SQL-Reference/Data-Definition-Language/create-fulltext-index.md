# Create Fulltext Index

## Syntax Description

MatrixOne supports full-text indexing, allowing users to perform efficient full-text searches on textual data in tables. Full-text indexes are suitable for columns containing `char`, `varchar`, `text`, `json`, and `datalink` data types, and are particularly optimized for text data in English and CJK (Chinese, Japanese, Korean) languages.

## Syntax Structure

### Enabling Full-Text Indexing

By default, full-text indexing is disabled. You need to enable it using the following SQL command:

```sql
-- Enable full-text indexing
SET experimental_fulltext_index = 1; -- Default is 0 (disabled)
```

### Selecting the Boolean Mode Relevance Algorithm

Choose between BM25 or TF-IDF:

```sql
SET ft_relevancy_algorithm = BM25|TF-IDF; -- Default is TF-IDF for searches.
```

### Creating a Full-Text Index

```sql
CREATE FULLTEXT INDEX <index_name> 
ON <table_name> (col1, col2, ...) 
[WITH PARSER (default | ngram | json)];
```

- `index_name`: The name you wish to assign to the full-text index.
- `table_name`: The name of the table on which to create the index.
- `(col1, col2, ...)`: A list of columns to include in the full-text index.
- `WITH PARSER`: Optional. Specifies the parser to use for indexing. Available options:
    - `default`: The default parser.
    - `ngram`: A parser supporting n-gram tokenization.
    - `json`: A parser specifically for JSON data.

### Performing Full-Text Searches

```sql
MATCH (col1, col2, ...) AGAINST (expr [search_modifier]);
```

- `(col1, col2, ...)`: The columns to search.
- `expr`: The search expression or keywords.
- `search_modifier`: Optional. Specifies the search mode. Available options:
    - `IN NATURAL LANGUAGE MODE`: Performs a natural language search.
    - `IN BOOLEAN MODE`: Performs a Boolean search, allowing operators like `+`, `-`, and `*`.

## Examples

```sql
-- Enable full-text indexing
SET experimental_fulltext_index = 1;

CREATE TABLE example_table (
    id INT PRIMARY KEY,
    english_text TEXT,       -- English text
    chinese_text TEXT,       -- Chinese text
    json_data JSON           -- JSON data
);
INSERT INTO example_table (id, english_text, chinese_text, json_data) VALUES
(1, 'Hello, world!', '你好世界', '{"name": "Alice", "age": 30}'),
(2, 'This is a test.', '这是一个测试', '{"name": "Bob", "age": 25}'),
(3, 'Full-text search is powerful.', '全文搜索很强大', '{"name": "Charlie", "age": 35}');

-- Create a full-text index using the default parser
mysql> CREATE FULLTEXT INDEX idx_english_text ON example_table (english_text);
Query OK, 0 rows affected (0.03 sec)

-- Create a full-text index using the ngram parser
mysql> CREATE FULLTEXT INDEX idx_chinese_text ON example_table (chinese_text) WITH PARSER ngram;
Query OK, 0 rows affected (0.02 sec)

-- Create a full-text index using the json parser
mysql> CREATE FULLTEXT INDEX idx_json_data ON example_table (json_data) WITH PARSER json;
Query OK, 0 rows affected (0.01 sec)

mysql> SHOW CREATE TABLE example_table;
+---------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table         | Create Table                                                                                                                                                                                                                                                                                                                                               |
+---------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| example_table | CREATE TABLE `example_table` (
  `id` int NOT NULL,
  `english_text` text DEFAULT NULL,
  `chinese_text` text DEFAULT NULL,
  `json_data` json DEFAULT NULL,
  PRIMARY KEY (`id`),
 FULLTEXT `idx_english_text`(`english_text`),
 FULLTEXT `idx_chinese_text`(`chinese_text`) WITH PARSER ngram,
 FULLTEXT `idx_json_data`(`json_data`) WITH PARSER json
) |
+---------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)

-- Search for English text containing "world"
mysql> SELECT * FROM example_table WHERE MATCH(english_text) AGAINST('world');
+------+---------------+--------------+------------------------------+
| id   | english_text  | chinese_text | json_data                    |
+------+---------------+--------------+------------------------------+
|    1 | Hello, world! | 你好世界     | {"age": 30, "name": "Alice"} |
+------+---------------+--------------+------------------------------+
1 row in set (0.02 sec)

-- Search for Chinese text containing "你好"
mysql> SELECT * FROM example_table WHERE MATCH(chinese_text) AGAINST('你好');
+------+---------------+--------------+------------------------------+
| id   | english_text  | chinese_text | json_data                    |
+------+---------------+--------------+------------------------------+
|    1 | Hello, world! | 你好世界     | {"age": 30, "name": "Alice"} |
+------+---------------+--------------+------------------------------+
1 row in set (0.01 sec)

-- Search for JSON data containing "Alice"
mysql> SELECT * FROM example_table WHERE MATCH(json_data) AGAINST('Alice');
+------+---------------+--------------+------------------------------+
| id   | english_text  | chinese_text | json_data                    |
+------+---------------+--------------+------------------------------+
|    1 | Hello, world! | 你好世界     | {"age": 30, "name": "Alice"} |
+------+---------------+--------------+------------------------------+
1 row in set (0.01 sec)

-- Using Boolean mode for searches

mysql> SET ft_relevancy_algorithm = "BM25";
Query OK, 0 rows affected (0.00 sec)

-- 1. Using the "+" operator: Must include "test"
mysql> SELECT * FROM example_table WHERE MATCH(english_text) AGAINST('+test' IN BOOLEAN MODE);
+------+-----------------+--------------------+----------------------------+
| id   | english_text    | chinese_text       | json_data                  |
+------+-----------------+--------------------+----------------------------+
|    2 | This is a test. | 这是一个测试       | {"age": 25, "name": "Bob"} |
+------+-----------------+--------------------+----------------------------+
1 row in set (0.01 sec)

-- 2. Using the "-" operator: Must exclude "This"
mysql> SELECT * FROM example_table WHERE MATCH(english_text) AGAINST('+test -This' IN BOOLEAN MODE);
Empty set (0.00 sec)

-- 3. Using the "*" operator: Matches words starting with "pow"
mysql> SELECT * FROM example_table WHERE MATCH(english_text) AGAINST('pow*' IN BOOLEAN MODE);
+------+-------------------------------+-----------------------+--------------------------------+
| id   | english_text                  | chinese_text          | json_data                      |
+------+-------------------------------+-----------------------+--------------------------------+
|    3 | Full-text search is powerful. | 全文搜索很强大        | {"age": 35, "name": "Charlie"} |
+------+-------------------------------+-----------------------+--------------------------------+
1 row in set (0.01 sec)

-- 4. Using double quotes "" to match the exact phrase "search is powerful"
mysql> SELECT * FROM example_table WHERE MATCH(english_text) AGAINST('"search is powerful"' IN BOOLEAN MODE);
+------+-------------------------------+-----------------------+--------------------------------+
| id   | english_text                  | chinese_text          | json_data                      |
+------+-------------------------------+-----------------------+--------------------------------+
|    3 | Full-text search is powerful. | 全文搜索很强大        | {"age": 35, "name": "Charlie"} |
+------+-------------------------------+-----------------------+--------------------------------+
1 row in set (0.02 sec)
```