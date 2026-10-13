# Multi-table analysis without double counting

When two child tables contain multiple rows per parent, joining both raw tables multiplies their rows. Aggregate each child to the intended grain before combining measures.

## A reproducible sales and refunds fixture

```sql
CREATE TABLE doc_orders(order_id INT PRIMARY KEY,customer_id INT,day INT);
CREATE TABLE doc_lines(line_id INT PRIMARY KEY,order_id INT,amount DOUBLE);
CREATE TABLE doc_refunds(refund_id INT PRIMARY KEY,order_id INT,amount DOUBLE);
INSERT INTO doc_orders VALUES(1,7,1),(2,7,2);
INSERT INTO doc_lines VALUES(1,1,10),(2,1,20),(3,2,40);
INSERT INTO doc_refunds VALUES(1,1,2),(2,1,3);

-- Expected-Value: 60
SELECT SUM(l.amount) inflated_gross
FROM doc_orders o
JOIN doc_lines l ON o.order_id=l.order_id
JOIN doc_refunds r ON o.order_id=r.order_id
WHERE o.order_id=1;
```

The join returns four combinations for order 1, doubling its true gross amount of 30. SUM(DISTINCT amount) is not a general repair: two legitimate line items can have the same amount.

## Aggregate children, then calculate customer history

```sql
mysql> WITH gross AS (
    SELECT order_id,SUM(amount) amount FROM doc_lines GROUP BY order_id
), refunded AS (
    SELECT order_id,SUM(amount) amount FROM doc_refunds GROUP BY order_id
), order_facts AS (
    SELECT o.order_id,o.customer_id,o.day,
           g.amount-COALESCE(r.amount,CAST(0 AS DOUBLE)) net
    FROM doc_orders o
    JOIN gross g ON o.order_id=g.order_id
    LEFT JOIN refunded r ON o.order_id=r.order_id
)
SELECT order_id,net,SUM(net) OVER(
    PARTITION BY customer_id ORDER BY day,order_id
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
) cumulative_net
FROM order_facts ORDER BY order_id;
+----------+-----+----------------+
| order_id | net | cumulative_net |
+----------+-----+----------------+
| 1        | 25  | 25             |
| 2        | 40  | 65             |
+----------+-----+----------------+
```

Expected rows: (1,25,25), (2,40,65).

Each CTE has an explicit grain: one row per order, then one result per order within customer history. Add an independent child-table total and row-count check at each stage when extending this pattern to many tables.

## Find parents with no qualifying child

```sql
-- Expected-Value: 2
SELECT o.order_id FROM doc_orders o
WHERE NOT EXISTS(
    SELECT 1 FROM doc_refunds r WHERE r.order_id=o.order_id
) ORDER BY o.order_id;

DROP TABLE doc_refunds;
DROP TABLE doc_lines;
DROP TABLE doc_orders;
```

Expected order_id: 2. NOT EXISTS expresses the missing-child condition without generating or deduplicating child combinations.

Use stable keys and explicit ORDER BY for reproducible comparisons. Check the [JOIN execution plan](../../Performance-Tuning/explain/explain-joins.md) before assuming that a longer CTE chain or a rewritten subquery is faster; compare the actual plan and full values on the same data.
