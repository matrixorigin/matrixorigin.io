# The BLOB and TEXT Type

**BLOB**

- A `BLOB` is a binary large object that can hold a variable amount of data.

- `BLOB` values are treated as binary strings (byte strings). They have the binary character set and collation, and comparison and sorting are based on the numeric values of the bytes in column values.

**TEXT**

- `TEXT` values are treated as nonbinary strings (character strings). They have a character set other than binary, and values are sorted and compared based on the collation of the character set.

**About `BLOB` and `TEXT`**

If you assign a value to a `BLOB` or `TEXT` type column that exceeds the maximum length for that column, the portion that exceeds the length will be truncated, and a warning will be generated. If a non-whitespace character is truncated, an error (rather than a warning) occurs, and insertion of the value is prohibited. For TEXT, always generate a warning when trimming excess trailing spaces in values ​​inserted into TEXT columns.
