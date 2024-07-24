# **CROSS JOIN**

## **Grammar description**

`CROSS JOIN` is used to implement the Cartesian product of two tables, which is to generate a combination of all rows in both tables.

## **Grammar structure**

```
>SELECT column_list
FROM table1
CROSS JOIN table2;
```

## **Examples**

```sql
CREATE TABLE Colors (
    color_id INT AUTO_INCREMENT,
    color_name VARCHAR(50),
    PRIMARY KEY (color_id)
);

CREATE TABLE Fruits (
    fruit_id INT AUTO_INCREMENT,
    fruit_name VARCHAR(50),
    PRIMARY KEY (fruit_id)
);

INSERT INTO Colors (color_name) VALUES ('Red'), ('Green'), ('Blue');
INSERT INTO Fruits (fruit_name) VALUES ('Apple'), ('Banana'), ('Cherry');

mysql> SELECT c.color_name, f.fruit_name FROM Colors c CROSS JOIN Fruits f;--Generate a result set with all colors and all fruit combinations
+------------+------------+
| color_name | fruit_name |
+------------+------------+
| Red        | Apple      |
| Green      | Apple      |
| Blue       | Apple      |
| Red        | Banana     |
| Green      | Banana     |
| Blue       | Banana     |
| Red        | Cherry     |
| Green      | Cherry     |
| Blue       | Cherry     |
+------------+------------+
9 rows in set (0.00 sec)

mysql> SELECT c.color_name,f.fruit_name FROM Colors c CROSS JOIN Fruits f WHERE c.color_name = 'Red' AND f.fruit_name = 'Apple';--Filter out combinations of specific colors and specific fruits
+------------+------------+
| color_name | fruit_name |
+------------+------------+
| Red        | Apple      |
+------------+------------+
1 row in set (0.01 sec)
```
