# **GROUP_CONCAT**

## **Description**

This function returns a string result with the concatenated non-NULL values from a group. It returns NULL if there are no non-NULL values.

## **Syntax**

```
> GROUP_CONCAT(expr)
```

The full syntax is as follows:

```
GROUP_CONCAT([DISTINCT] expr [,expr ...]
             [ORDER BY {unsigned_integer | col_name | expr}
                 [ASC | DESC] [,col_name ...]]
             [SEPARATOR str_val])
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| expr  | Required. It specifies one or more columns or expressions to join. |
| DISTINCT |Optional. To eliminate duplicate values.|
| ORDER BY | Optional. To sort values in the result. To sort in reverse order, add the DESC (descending) keyword to the name of the column you are sorting by in the ORDER BY clause. The default is ascending order; this may be specified explicitly using the ASC keyword. |
| SEPARATOR | Optional.  The default separator between values in a group is comma (,).|

## **Returned Value**

The return value is a nonbinary or binary string, depending on whether the arguments are nonbinary or binary strings.

It returns NULL if there are no non-NULL values.

## **Examples**

```sql
create table t1(a int,b text,c text);
insert into t1 values(1,"a","bc"),(2,"ab","c"),(3,"aa","bb"),(3,"aa","bb");

mysql> select group_concat(distinct a,b,c separator '|') from t1;
+-----------------------------------+
| group_concat(distinct a, b, c, |) |
+-----------------------------------+
| 1abc|2abc|3aabb                   |
+-----------------------------------+
1 row in set (0.01 sec)

mysql> select group_concat(distinct b,c separator '|') from t1 group by a;
+--------------------------------+
| group_concat(distinct b, c, |) |
+--------------------------------+
| abc                            |
| abc                            |
| aabb                           |
+--------------------------------+
3 rows in set (0.01 sec)

mysql> select group_concat(distinct b,c separator '|') from t1;
+--------------------------------+
| group_concat(distinct b, c, |) |
+--------------------------------+
| abc|abc|aabb                   |
+--------------------------------+
1 row in set (0.01 sec)
```
