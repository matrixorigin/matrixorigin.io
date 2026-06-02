# Data Integrity Constraints Overview

In MatrixOne, to ensure the data's correctness, integrity, and validity, restrictions are added to specific columns in the table creation statement to ensure that the information stored in the database complies with specific rules. These restrictions are called constraints. For example, if the execution result of a DML statement violates the integrity constraint, the statement will be rolled back, and an error message will be returned.

## Integrity Constraints Types

There are various constraints in MatrixOne, and different constraints have different restrictions on database behavior. Currently, supported constraints are table-level constraints:

- [NOT NULL integrity constraints](not-null-constraints.md):

   The non-null constraint means that the data in a specific column cannot have a null value (NULL), and the data that violates the constraint cannot be inserted or updated in the corresponding column. In MatrixOne, a table can have zero, one, or more not-null constraints.

- [UNIQUE KEY integrity constraints](unique-key-constraints.md)

   The unique key constraint means that in a specific column or a combination of multiple columns stored in a table, the value of this column (or column set) in the inserted or updated data row is unique. In MatrixOne, zero, one, or more unique key constraints are allowed in a table, but unlike other relational databases, the unique key constraints of MatrixOne must also be non-empty.

- [PRIMARY KEY integrity constraints](primary-key-constraints.md)

    The primary key constraint means that in a specific column or a combination of multiple columns stored in a table, each data row can be uniquely determined by a specific key value and is not empty. There can only be, at most, one primary key constraint in a table.

- [FOREIGN KEY integrity constraints](foreign-key-constraints.md)

   A foreign key constraint means that a column or columns in another table reference a column or a combination of columns stored in one table. The referenced table is usually called the parent table, and the referenced table is called the child table. The child table refers to the data of the corresponding column of the parent table, which can only be the data or null value of the parent table. This kind of constraint is called a foreign key constraint.

- [AUTO INCREMENT constraint](auto-increment-integrity.md)

   An auto-increment constraint is a feature that automatically generates a unique identifying value for a column in a table. It allows you to automatically generate an incremental unique value for a specified auto-increment column when a new row is inserted.
