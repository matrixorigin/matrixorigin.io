# SUBVECTOR()

## Function Description

The `SUBVECTOR()` function is used to extract subvectors from vectors.

## Function syntax

\`\`\`
> SUBVECTOR(vec, pos, len) \`\`\`

## Parameter interpretation

| Parameters | Description |
|  ----  | ----  |
|vec     |	Required Parameters. The source vector from which the subvectors are extracted|
|pos     |	Required Parameters. The position at which to start the extraction. The first position in the vector is 1. If pos is positive, the function extracts from the beginning of the vector. If pos is negative, the extraction starts at the end of the vector.|
|len	 |  Optional parameters. The number of dimensions to extract. Defaults to a subvector starting at position pos and ending at the end of the vector. If len is less than 1, the empty vector is returned. |

## Examples

```sql
mysql> SELECT SUBVECTOR("[1,2,3]", 2);
+-----------------------+
| subvector([1,2,3], 2) |
+-----------------------+
| [2, 3]                |
+-----------------------+
1 row in set (0.01 sec)

mysql> SELECT SUBVECTOR("[1,2,3]",-1,1);
+---------------------------+
| subvector([1,2,3], -1, 1) |
+---------------------------+
| [3]                       |
+---------------------------+
1 row in set (0.00 sec)

mysql> SELECT SUBVECTOR("[1,2,3]",-1,0);
+---------------------------+
| subvector([1,2,3], -1, 0) |
+---------------------------+
| []                        |
+---------------------------+
1 row in set (0.00 sec)
```