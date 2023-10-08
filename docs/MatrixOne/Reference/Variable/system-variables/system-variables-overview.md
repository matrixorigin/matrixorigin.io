# Server System Variables

MatrixOne server system variables are variables used to control or configure the behavior of the database engine or other components in the MatrixOne server. The values of these variables can be set and changed using the `SET` statement.

System variables can be divided into two categories: **Global variables** and **Session variables**.

- **Global variables**: Global variables apply to all connected sessions of the MatrixOne server. Their values are set when the MatrixOne server starts and remain unchanged until the server is shut down. Global variables are typically used to control the behavior of the MatrixOne server, such as specifying default backup and restore locations, the default language environment, and so on.

- **Session variables**: Session variables apply only to the currently connected user's session of the MatrixOne server. Their values can be changed anytime during the user's connection and are automatically cleared when the user disconnects. Session variables are typically used to control session behavior, such as how to print the information displayed and specify transaction isolation levels.

## How to query system variables?

You can use the following SQL to query:

```sql
SHOW VARIABLES;
```

This will list all system variables and their current values. If you only want to see system variables related to a specific topic, you can use the following syntax:

```sql
SHOW VARIABLES LIKE '%theme%';
```

This will list all system variables with names containing the word `theme` and their current values.

__Note:__ The `LIKE` operator is used for fuzzy matching query strings, with % representing zero or more arbitrary characters. Therefore, the above command will match any system variables with names containing the word `theme`.

### How to query global variables?

You can use the following SQL to query:

```sql
SHOW GLOBAL VARIABLES;
```

This will list all global variables and their current values. If you only want to see global variables related to a specific topic, you can use the following syntax:

```sql
SHOW GLOBAL VARIABLES LIKE '%theme%';
```

This will list all global variables with names containing the word `theme` and their current values.

__Note:__ The `LIKE` operator is used for fuzzy matching query strings, with % representing zero or more arbitrary characters. Therefore, the above command will match any global variables with names containing the word `theme`.

### How to query session variables?

You can use the following SQL to query:

```sql
SHOW SESSION VARIABLES;
```

This will list all session variables and their current values. If you only want to see session variables related to a specific topic, you can use the following syntax:

```sql
SHOW SESSION VARIABLES LIKE '%theme%';
```

This will list all session variables with names containing the word `theme` and their current values.

__Note:__ The `LIKE` operator is used for fuzzy matching query strings, with % representing zero or more arbitrary characters. Therefore, the above command will match any session variables with names containing the word `theme`.

## System Veariable Reference

| Variable_name | Cmd-Line(Y/N) | Option File(Y/N) | Variable Type | System Var(Y/N) | Var Scope(Global/Both/Session) | Dynamic(Y/N) | Default Value | Optional value |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| auto_increment_increment | Y | N | int | Y | Both | Y | 1 | 1-65535 |
| auto_increment_offset | Y | N | int | Y | Both | Y | 1 | 1-65535 |
| autocommit | Y | N | bool | Y | Both | Y | TRUE | FALSE |
| character_set_client | Y | N | string | Y | Both | Y | "utf8mb4" |  |
| character_set_connection | Y | N | string | Y | Both | Y | "utf8mb4" |  |
| character_set_database | Y | N | string | Y | Both | Y | "utf8mb4" |  |
| character_set_results | Y | N | string | Y | Both | Y | "utf8mb4" |  |
| character_set_server | Y | N | string | Y | Both | Y | "utf8mb4" |  |
| collation_connection | Y | N | string | Y | Both | Y | "default" |  |
| collation_server | Y | N | string | Y | Both | Y | "utf8mb4_bin" |  |
| completion_type | Y | N | enum | Y | Both | Y | "NO_CHAIN" | "NO_CHAIN","CHAIN", "RELEASE" |
| host | Y | N | string | Y | Both | N | "0.0.0.0" |  |
| init_connect | Y | N | string | Y | Both | Y | "" |  |
| interactive_timeout | Y | N | int | Y | Both | Y | 28800 | 1-31536000 |
| license | Y | N | string | Y | Both | N | "APACHE" |  |
| lower_case_table_names | Y | N | int | Y | Both | N | 1 | 0-2 |
| max_allowed_packet | Y | N | int | Y | Both | Y | 16777216 | 1024-1073741824 |
| net_write_timeout | Y | N | int | Y | Both | Y | 60 | 1-31536000 |
| performance_schema | Y | N | int | Y | Both | Y | 0 | 0-1 |
| port | Y | N | int | Y | Both | N | 6001 | 0-65535 |
| profiling | Y | N | int | Y | Both | Y | 0 | 0-1 |
| query_result_maxsize | Y | N | uint | Y | Both | Y | 100 | 0-18446744073709551615 |
| query_result_timeout | Y | N | uint | Y | Both | Y | 24 | 0-18446744073709551615 |
| [save_query_result](save_query_result.md) | Y | N | bool | Y | Both | Y | FALSE | TRUE |
| [sql_mode](sql-mode.md) | Y | N | set | Y | Both | Y | "ONLY_FULL_GROUP_BY,<br>STRICT_TRANS_TABLES,<br>NO_ZERO_IN_DATE,<br>NO_ZERO_DATE,<br>ERROR_FOR_DIVISION_BY_ZERO,<br>NO_ENGINE_SUBSTITUTION" | "ANSI", "TRADITIONAL", "ALLOW_INVALID_DATES", "ANSI_QUOTES", "ERROR_FOR_DIVISION_BY_ZERO", "HIGH_NOT_PRECEDENCE", "IGNORE_SPACE", "NO_AUTO_VALUE_ON_ZERO", "NO_BACKSLASH_ESCAPES", "NO_DIR_IN_CREATE", "NO_ENGINE_SUBSTITUTION", "NO_UNSIGNED_SUBTRACTION", "NO_ZERO_DATE", "NO_ZERO_IN_DATE", "ONLY_FULL_GROUP_BY", "PAD_CHAR_TO_FULL_LENGTH", "PIPES_AS_CONCAT", "REAL_AS_FLOAT", "STRICT_ALL_TABLES", "STRICT_TRANS_TABLES", "TIME_TRUNCATE_FRACTIONAL" |
| sql_safe_updates | Y | N | int | Y | Both | Y | 0 | 0-1 |
| sql_select_limit | Y | N | uint | Y | Both | Y | 18446744073709551615 |  0-18446744073709551615 |
| system_time_zone | Y | N | string | Y | Both | N | "" |  |
| [time_zone](timezone.md) | Y | N | string | Y | Both | N | "SYSTEM" |  |
| transaction_isolation | Y | N | enum | Y | Both | Y | "REPEATABLE-READ" | "READ-UNCOMMITTED", "READ-COMMITTED", "REPEATABLE-READ","REPEATABLE-READ", "SERIALIZABLE" |
| transaction_read_only | Y | N | int | Y | Both | Y | 0 | 0-1 |
| version_comment | Y | N | string | Y | Both | N | "MatrixOne" |  |
| wait_timeout | Y | N | int | Y | Both | Y | 28800 |  1-2147483 |

## Constraints

MatrixOne is compatible with MySQL, and the SQL mode only supports the `ONLY_FULL_GROUP_BY` mode; other SQL modes are only supported by syntax and have no actual effect.
