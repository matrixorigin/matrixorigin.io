# 测试文档 - 包含错误

这是一个包含错误的测试文档，用于测试检测功能。

## 死链接

- [不存在的页面](https://www.matrixorigin.cn/this-page-does-not-exist-12345)
- [本地不存在的文件](./not-exist-file.md)

## SQL 语法错误

```sql
SELEC * FROM users;
```

```sql
CREATE TABL test (id INT);
```

## 正确的 SQL

```sql
SELECT 1 + 1 AS result;
```