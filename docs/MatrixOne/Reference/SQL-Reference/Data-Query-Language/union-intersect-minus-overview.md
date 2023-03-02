# Combining Queries (UNION, INTERSECT, MINUS)

The results of the two queries can be combined using the set operations `UNION`, `INTERSECT`, and `MINUS`. The syntax is as below:

```
query1 UNION [ALL] query2
query1 INTERSECT [ALL] query2
query1 MINUS [ALL] query2
```

__Tips:__ Where *query1* and *query2* are queries that can use any of the features discussed up to this point.

`UNION` effectively appends the result of *query2* to the result of *query1* (although there is no guarantee that this is the order in which the rows are returned). Furthermore, it eliminates duplicate rows from its result, in the same way as `DISTINCT`, unless `UNION ALL` is used.

`INTERSECT` returns all rows in both the result of *query1* and *query2*. Duplicate rows are eliminated unless `INTERSECT ALL` is used.

`MINUS` returns all rows in the result of *query1* but not in *query2*. (This is sometimes called the difference between two queries.) Again, duplicates are eliminated unless `MINUS ALL` is used.

To calculate the union, intersection, or difference of two queries, the two queries must be "union compatible", which means that they return the same number of columns and the corresponding columns have compatible data types.

Set operations can be combined, for example:

```
query1 UNION query2 MINUS query3
```

which is equivalent to:

```
(query1 UNION query2) MINUS query3
```

As shown here, you can use parentheses to control the order of evaluation. Without parentheses, `UNION` and `MINUS` associate left-to-right, but `INTERSECT` binds more tightly than those two operators. Thus

```
query1 UNION query2 INTERSECT query3
```

that means:

```
query1 UNION (query2 INTERSECT query3)
```

You can also surround an individual query with parentheses. This is important if the query needs to use any of the clauses discussed in the following sections, such as `LIMIT`. Without parentheses, you'll get a syntax error, or else the clause will be understood as applying to the output of the set operation rather than one of its inputs. For example:

```
SELECT a FROM b UNION SELECT x FROM y LIMIT 10
```

is accepted, but it means:

```
(SELECT a FROM b UNION SELECT x FROM y) LIMIT 10
```

not as below:

```
SELECT a FROM b UNION (SELECT x FROM y LIMIT 10)
```

## Reference

For more information on the single syntax as above, see:

- [UNION](union.md)
- [INTERSECT](intersect.md)
- [MINUS](minus.md)
