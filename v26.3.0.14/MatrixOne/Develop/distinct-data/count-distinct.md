# Deduplication of data using COUNT(DISTINCT)

`COUNT (DISTINCT)` provides accurate deduplication results, but may be less efficient on large data sets. Use [BITMAP](bitmap.md) for large data sets.

This article explains how to dedupe small amounts of data using `COUNT (DISTINCT)`.

## Prepare before you start

Completed [standalone deployment of](../../Get-Started/install-standalone-matrixone.md) MatrixOne.

## Examples

```sql
--Create an orders table with two fields, customer_id and product_id, which represent the unique identifiers of the customer and the product, respectively.
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    product_id INT,
    order_date DATE,
    quantity INT
);

--Insert some sample data:
INSERT INTO orders (customer_id, product_id, order_date, quantity)
VALUES
    (1, 101, '2023-04-01', 2),
    (1, 102, '2023-04-02', 1),
    (2, 101, '2023-04-03', 5),
    (3, 103, '2023-04-04', 3),
    (2, 104, '2023-04-05', 1),
    (4, 101, '2023-04-06', 2),
    (4, 102, '2023-04-07', 1),
    (5, 105, '2023-04-08', 4),
    (1, 101, '2023-04-09', 2);

--Calculate the number of different customers:
mysql> SELECT COUNT(DISTINCT customer_id) AS unique_customer_count FROM orders;
+-----------------------+
| unique_customer_count |
+-----------------------+
|                     5 |
+-----------------------+
1 row in set (0.01 sec)

--Calculate the quantities of different products:
mysql> SELECT COUNT(DISTINCT product_id) AS unique_product_count FROM orders;
+----------------------+
| unique_product_count |
+----------------------+
|                    5 |
+----------------------+
1 row in set (0.01 sec)
```

The two queries return the number of unique customers and the number of unique products in the orders table, respectively. This information is useful for analyzing customer diversity and product range.

## Reference Documents

- [COUNT](../../Reference/Functions-and-Operators/Aggregate-Functions/count.md)
