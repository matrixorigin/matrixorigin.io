# SQL Frequently Asked Questions

## Basic function related

**Is MatrixOne case sensitive to identifiers?**

MatrixOne is case-insensitive by default for identifiers and supports case-sensitive support with the lower_case_table_names parameter, which is described in more detail in [Case Sensitive Support](../Reference/Variable/system-variables/lower_case_tables_name.md)

 **What SQL statements does MatrixOne support?**

SQL statements currently supported by MatrixOne can refer [to SQL statement](../Reference/SQL-Reference/SQL-Type.md) classification.

**What data types does MatrixOne support?**

MatrixOne currently supports common integer, floating point, string, time date, boolean, enumeration, binary, JSON types, see [Data Type Overview](../Reference/Data-Types/data-types.md).

**What types of character sets does MatrixOne support?**

MatrixOne supports the UTF-8 character set by default and currently supports only UTF-8.

**What constraints and indexes does MatrixOne support?**

MatrixOne currently supports Primary Key, Unique Key, Not Null, Foreign Key, Auto Increment constraint, and Secondary Index. Secondary indexes currently only implement syntax support, not acceleration. In addition, MatrixOne provides a sort key (Cluster by) for orphaned key tables, which helps us sort the columns we need to query ahead of time and accelerate the query.

 **What query types does MatrixOne support?**

MatrixOne supports most common SQL queries:

Basic Query: Supports common grouping, deduplication, filtering, sorting, qualifying, regular expression and other basic query capabilities.

Advanced Query: Supports advanced query capabilities such as views, subqueries, joins, combinations, common table expressions (CTEs), window functions, and Prepare preprocessing.

Aggregate Functions: Supports common AVG, COUNT, MIN, MAX, SUM and other aggregate functions.

System Functions and Operators: Supports common strings, date and time, mathematical functions and common operators.

**What are the reserved keywords for MatrixOne?**

A list of reserved keywords for MatrixOne can be found in [Keywords](../Reference/Language-Structure/keywords.md).

When using the reserved keyword as an identifier, it must be wrapped in back quotation marks, otherwise an error will occur. When using non-reserved keywords as identifiers, you can use them directly without wrapping them in back quotes.

**Materialized views are not supported by the MatrixOne branch?**

MatrixOne does not currently support materialized views, and with current AP performance support, direct analysis can also result in a higher analysis experience. The materialized view feature is also already in MatrixOne's Roadmap. If you have a high rigidity need for a materialized view, feel free to mention Issue to describe your scenario:<https://github.com/matrixorigin/matrixone/issues>

 **The MatrixOne branch does not support Geometry?**

Not yet supported, will be supported later.

**Are functions and keywords in MatrixOne case sensitive?**

Case-insensitive. In MatrixOne, there is only one case where you need to be case sensitive: if you create tables and properties with names in \`\`,\`\` you need to be case sensitive. query this table name or attribute name, then the table name and attribute name also need to be included in .

Does **MatrixOne support transactions? What is the supported transaction isolation level?**

MatrixOne supports transaction capabilities of ACID (atomicity, consistency, isolation, persistence), supports pessimistic and optimistic transactions, and uses pessimistic transactions by default. Read Committed isolation levels are used when pessimistic transactions are used, and Snapshot Isolation isolation levels are used when switching to optimistic transactions.

**Are functions and keywords in MatrixOne case sensitive?**

Case-insensitive. In MatrixOne, there is only one case where you need to be case sensitive: if you create tables and properties with names in \`\`,\`\` you need to be case sensitive. query this table name or attribute name, then the table name and attribute name also need to be included in .

## Data Import/Export Related

**How do I import data into MatrixOne?**

MatrixOne supports the same [`INSERT`](../Develop/import-data/insert-data.md) data insertion statements as MySQL, real-time data writing via `INSERT`, and offline bulk import statements for [`LOAD DATA`](../Develop/import-data/bulk-load/bulk-load-overview.md).

**How do I export data from MatrixOne to a file?**

In MatrixOne, you can use the binary tool [`mo-dump`](../Develop/export-data/modump.md) to export data to SQL or csv files, or [`SELECT INTO to`](../Develop/export-data/select-into-outfile.md) export `csv` files.

 **How to export only table structure via mo-dump tool?**

You can specify not to export data by adding the -no-data parameter to the export command.

**Some fields are missing from a json object imported using load data, does the import report an error?**

An error is reported, and in import json, there are more fields than in the table, which can be imported normally, but the extra fields are ignored, and if there are fewer, they cannot be imported.

**Is it possible to write relative paths to import files while performing source import?**

Yes, but to prevent errors relative to your current path using the mysql client, or to recommend writing the full path, also note the file permissions issue.

**Is it possible to optimize when importing a large file using the load data command?**

You can turn on parallel imports by specifying PARALLEL to true when importing. For example, for a large file of 2 Gs, two threads are used to load it, and the second thread is split-positioned to the 1G position and then read back and loaded. This allows two threads to read large files simultaneously, each reading 1G of data. You can also slice the data file yourself.

 **Is there a transaction for load data import?**

All load statements are transactional.

**source Do triggers and stored procedures involved when importing sql take effect?**

Currently if there are incompatible data types, triggers, functions or stored procedures in sql, you still need to modify them manually, otherwise execution will report an error.

**Does mo-dump support batch export of multiple databases?**

Exporting a backup of a single database is currently only supported. If you have multiple databases to back up, you need to manually run mo-dump multiple times.

**Does MatrixOne support importing data from Minio?**

Yes, the load data command supports importing data from local files, S3 object storage services, and S3 compatible object storage services into matrixone, while Minio is also based on the S3 protocol, so it is also supported, see [Local Object Storage](../Deploy/import-data-from-minio-to-mo/) for details

**When MatrixOne imports and exports data, if there is an encoding problem that causes the data to be scrambled, how do we generally solve it**

Since matrixone only supports UTF8 as an encoding by default and cannot be changed, if there is a garbled code when importing data, we can't solve it by modifying the character set of the database and tables. We can try converting the data encoding to UTF8. Common conversion tools are iconv and recode, such as: Convert GBK encoded data to UTF-8 encoded: iconv -f GBK -t UTF8 t1.sql > t1_utf8.sql.

**What permissions are required when importing and exporting MatrixOne?**

If you are a tenant administrator, you can import and export directly through the default role. For normal users, you need 'insert' permission to import tables when importing; 'select' permission to export tables when exporting by select...into outfile; and *'select'* permission to all tables (table\*.) and 'show tables' permission to all libraries (database.\*) when exporting by mo-dump.

## Permission related

**Can regular users grant MOADMIN roles?**

No, MOADMIN is the highest cluster administrator privilege and only the root user has it.

## Other

**What is `sql_mode` in MatrixOne?**

  MatrixOne's default `sql_mode` is `only_full_group_by` in MySQL. So all `select` fields in the default query syntax, except those in the aggregate function, must appear in `group by` . But MatrixOne also supports modifying `sql_mode` to be compatible with the incomplete specification of `group by` syntax.

**show tables in MatrixOne cannot view temporary tables, how can I see if it was created successfully?**

Currently it can be viewed through the "show create table temporary table name" . Since temporary tables are only visible in the current session after they are created, at the end of the current session the database automatically deletes the temporary table and frees up all space, which is usually human-aware during its lifetime.

**How do I view my Query execution plan?**

To see how MatrixOne executes on a given query, you can use the [`EXPLAIN`](../Reference/SQL-Reference/Other/Explain/explain.md) statement, which prints out the query plan.

```sql
EXPLAIN SELECT col1 FROM tbl1; 
```

**How to check the table compression ratio?**

To check the table compression ratio in MatrixOne, you can use the following SQL query:

```sql
mysql> select ( sum(compress_size) + 1) / ( sum(origin_size) +1 ) from metadata_scan('db1.students', '*') m;
+---------------------------------------------------+
| (sum(compress_size) + 1) / (sum(origin_size) + 1) |
+---------------------------------------------------+
|                               0.44582681643679795 |
+---------------------------------------------------+
1 row in set (0.01 sec)
```

The compression ratio of the `students` table is approximately: 1 - 44.96% = 55.04%.

**NOTE:** During the data compression process, if the data has not yet been written from memory to disk, the compression ratio obtained from the query may not be accurate. Typically, data will be written to disk within 5 minutes, so it is recommended to wait until the data is flushed to disk before performing the query.