# 测试文档 - 应该通过

这是一个正确的测试文档。

## 有效链接

- [MatrixOne 官网](https://www.matrixorigin.cn/)
- [GitHub](https://github.com/matrixorigin/matrixone)

## SQL 示例

创建表：

```sql
CREATE TABLE IF NOT EXISTS test_users (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    age INT
);
```

插入数据：

```sql
INSERT INTO test_users VALUES (1, 'Alice', 25);
INSERT INTO test_users VALUES (2, 'Bob', 30);
```

查询数据：

```sql
SELECT * FROM test_users WHERE age > 20;
```

清理：

```sql
DROP TABLE IF EXISTS test_users;
```
