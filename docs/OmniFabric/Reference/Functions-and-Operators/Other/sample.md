# SAMPLE Sampling Function

The SAMPLE sampling function feature is a key tool for handling large amounts of data analysis, primarily to quickly narrow down queries.

1. Syntax structure

```sql
SELECT SAMPLE(<column_list>, <N ROWS>/<K PERCENT>) FROM <table> [WHERE ...] [GROUP BY ...] [ORDER BY ...] [LIMIT ...] [OFFSET ...]
```

* `<column_list>`: List of selected column names.
* `<N ROWS>/<K PERCENT>`: Specifies the number (N rows) or percentage (K%) of samples returned.

2. Functional Features

* The SAMPLE function filters the table before performing sampling.
* Returns N random samples, or K% random samples, in the table.
* When N rows are specified, N is a positive integer from 1-1000.
* When K% is specified, the value of K ranges from 0.01-99.99, representing the probability that each row will be selected. The result may be different each time, and the number of rows is not fixed. For example, the table has 10,000 rows and performs SAMPLE(a, 50 PERCENT); since each row has a 50 percent probability of being selected, similar to a 10,000 coin toss, the probability of positive and negative sides is 50 percent each time, but the end result could be 350 positives and 650 negatives.
* Multiple column sampling is supported, such as SELECT SAMPLE(a,b,c,100 ROWS) FROM t1;.
* Can be used in conjunction with WHERE clause, GROUP BY clause, etc.

3. Application Examples

```sql
SELECT SAMPLE(a, 100 ROWS) FROM t1; --Returns 100 random samples 
SELECT SAMPLE(a, 0.2 PERCENT) FROM t1; --Returns about 0.2 percent of samples 
SELECT SAMPLE(a, 100 ROWS) FROM t1 WHERE a > 1; --Filters before sampling 
SELECT a, SAMPLE(b, 100 ROWS) FROM t1 GROUP BY a; --Groups after sampling
```