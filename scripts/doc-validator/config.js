/**
 * Configuration for document validator
 */

export const config = {
  // 文档路径模式
  docsPattern: './docs/MatrixOne/**/*.md',
  
  // 文档根目录
  docsRoot: './docs/MatrixOne',
  
  // SQL 代码块的标识符
  sqlCodeBlockLanguages: ['sql', 'SQL'],
  
  // 支持的 MatrixOne 版本
  supportedVersions: [
    'v0.8',
    'v1.0',
    'v1.1',
    'v1.2',
    'latest'
  ],
  
  // 默认数据库配置
  defaultDbConfig: {
    host: '127.0.0.1',
    port: 6001,
    user: 'root',
    password: '111',
    database: 'test'
  },
  
  // SQL 语法检查配置
  syntaxCheck: {
    // 支持的 SQL 方言
    dialect: 'mysql',
    
    // 忽略的 SQL 模式（正则表达式）
    ignorePatterns: [
      /^\s*--/,           // 单行注释
      /^\s*\/\*/,         // 多行注释开始
      /^\s*$/             // 空行
    ],
    
    // MatrixOne 特有语法白名单
    // 这些语法在 MatrixOne 中是合法的，但 MySQL parser 不支持
    // 匹配到这些模式的 SQL 将跳过语法检查
    matrixoneWhitelist: [
      // ==================== 账户和权限管理 ====================
      // 精细验证：检查必要的参数
      /CREATE\s+ACCOUNT\s+\w+\s+ADMIN_NAME/i,  // CREATE ACCOUNT 必须有 ADMIN_NAME
      /DROP\s+ACCOUNT\s+\w+/i,
      /ALTER\s+ACCOUNT\s+\w+/i,
      /CREATE\s+ROLE\s+\w+/i,
      /DROP\s+ROLE\s+\w+/i,
      /ALTER\s+ROLE\s+\w+/i,
      /DROP\s+USER\s+\w+/i,
      /GRANT\s+.*\s+ON\s+DATABASE\s+\*/i,
      /GRANT\s+\w+.*\s+ON\s+DATABASE\s+\w+/i,
      /GRANT\s+.*\s+TO\s+\w+/i,  // GRANT 必须有 TO
      /GRANT\s+.*\s+WITH\s+GRANT\s+OPTION/i,
      /GRANT\s+.*\s+ON\s+\w+\.\*/i,  // GRANT ... ON database.*
      /GRANT\s+ALL\s+PRIVILEGES\s+ON/i,  // GRANT ALL PRIVILEGES
      
      // ==================== 快照和恢复 ====================
      // 精细验证：检查 FOR 子句
      /CREATE\s+SNAPSHOT\s+\w+\s+FOR\s+(ACCOUNT|DATABASE|TABLE|CLUSTER)/i,
      /DROP\s+SNAPSHOT\s+\w+/i,
      /SHOW\s+SNAPSHOTS/i,  // 简单语句，完全跳过
      /RESTORE\s+ACCOUNT\s+\w+\s+FROM\s+SNAPSHOT/i,
      /RESTORE\s+DATABASE\s+\w+\s+FROM\s+SNAPSHOT/i,
      /RESTORE\s+(DATABASE\s+\w+\s+)?TABLE\s+\w+\s+FROM\s+SNAPSHOT/i,
      /RESTORE\s+CLUSTER\s+FROM\s+SNAPSHOT/i,
      
      // ==================== PITR (时间点恢复) ====================
      // 精细验证：检查基本语法结构
      /CREATE\s+PITR\s+\w+\s+(FOR\s+(CLUSTER|ACCOUNT|DATABASE|TABLE)|RANGE)/i,
      /DROP\s+PITR\s+\w+/i,
      /ALTER\s+PITR\s+\w+/i,
      /SHOW\s+PITR/i,
      /RESTORE\s+(CLUSTER|ACCOUNT|DATABASE|TABLE)?\s*.*\s+FROM\s+PITR\s+\w+/i,
      /FOR\s+CLUSTER\s+RANGE\s+\d+/i,
      /FOR\s+ACCOUNT\s+\w+\s+RANGE\s+\d+/i,
      /FOR\s+DATABASE\s+\w+\s+RANGE\s+\d+/i,
      /FOR\s+TABLE\s+.*\s+RANGE\s+\d+/i,
      
      // ==================== 序列 ====================
      // 精细验证：检查基本参数
      /CREATE\s+SEQUENCE\s+\w+(\s+(START\s+WITH|INCREMENT\s+BY|MINVALUE|MAXVALUE))?/i,
      /DROP\s+SEQUENCE\s+\w+/i,
      /ALTER\s+SEQUENCE\s+\w+/i,
      /SHOW\s+SEQUENCES/i,  // 简单语句
      /\s+START\s+WITH\s+\d+/i,  // SEQUENCE 的 START WITH 必须有数字
      /INCREMENT\s+BY\s+\d+/i,
      
      // ==================== 函数和存储过程 ====================
      /CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+/i,
      /CREATE\s+FUNCTION\s+.*\s+LANGUAGE\s+(?:SQL|PYTHON)/i,
      /DROP\s+FUNCTION\s+/i,
      /SHOW\s+FUNCTION\s+STATUS/i,
      /LANGUAGE\s+PYTHON\s+AS/i,
      /RETURNS\s+\w+\s+LANGUAGE\s+/i,
      /CREATE\s+PROCEDURE\s+/i,  // 创建存储过程
      /DROP\s+PROCEDURE\s+/i,
      /DELIMITER\s+/i,  // 分隔符
      /\s+IN\s+\w+\s+\w+/i,  // IN parameter
      /\s+OUT\s+\w+\s+\w+/i,  // OUT parameter
      /\s+INOUT\s+\w+\s+\w+/i,  // INOUT parameter
      /BEGIN[\s\S]*END/i,  // BEGIN...END 块
      
      // ==================== INSERT 和 LOAD DATA 语法 ====================
      // 基于官方语法: INSERT INTO [db.]table [(c1, c2, c3)] VALUES (...)
      /INSERT\s+INTO\s+(\w+\.)?\w+(\s*\([^)]+\))?\s+VALUES/i,
      /INSERT\s+INTO\s+.*\s+SELECT/i,  // INSERT INTO ... SELECT
      // LOAD DATA 语法（复杂）
      /LOAD\s+DATA\s+(LOW_PRIORITY\s+|CONCURRENT\s+)?(LOCAL\s+)?INFILE/i,
      /LOAD\s+DATA\s+.*\s+INTO\s+TABLE/i,
      /LOAD\s+DATA\s+.*\s+REPLACE\s+INTO\s+TABLE/i,
      /LOAD\s+DATA\s+.*\s+IGNORE\s+INTO\s+TABLE/i,
      /INFILE\s+['"][^'"]+['"]\s+.*\s+INTO\s+TABLE/i,
      /INTO\s+TABLE\s+\w+\s+PARTITION\s*\(/i,
      /FIELDS\s+TERMINATED\s+BY/i,
      /FIELDS\s+ENCLOSED\s+BY/i,
      /LINES\s+TERMINATED\s+BY/i,
      /LINES\s+STARTING\s+BY/i,
      /IGNORE\s+\d+\s+(LINES|ROWS)/i,
      
      // ==================== 外部表和数据源 ====================
      /CREATE\s+EXTERNAL\s+TABLE\s+/i,
      /CREATE\s+SOURCE\s+/i,
      /DROP\s+SOURCE\s+/i,
      /INFILE\s+.*\s+URL/i,
      /LOAD\s+DATA\s+.*\s+URL/i,
      /S3OPTION\s*\{/i,
      /CREDENTIALS\s*\{/i,
      
      // ==================== 流表 ====================
      /CREATE\s+STREAM\s+/i,
      /DROP\s+STREAM\s+/i,
      
      // ==================== 发布订阅 ====================
      /CREATE\s+PUBLICATION\s+/i,
      /DROP\s+PUBLICATION\s+/i,
      /ALTER\s+PUBLICATION\s+/i,
      /CREATE\s+SUBSCRIPTION\s+/i,
      /DROP\s+SUBSCRIPTION\s+/i,
      /SHOW\s+PUBLICATIONS/i,
      /SHOW\s+SUBSCRIPTIONS/i,
      /CREATE\s+DATABASE\s+.*\s+FROM\s+.*\s+PUBLICATION/i,
      
      // ==================== Stage ====================
      /CREATE\s+STAGE\s+/i,
      /DROP\s+STAGE\s+/i,
      /ALTER\s+STAGE\s+/i,
      /SHOW\s+STAGES/i,
      
      // ==================== SELECT 语句扩展 ====================
      // 基于官方语法: SELECT ... FROM ... WHERE ... GROUP BY ... HAVING ... ORDER BY ... LIMIT ... OFFSET
      /SELECT\s+(ALL|DISTINCT)\s+/i,
      /SELECT\s+.*\s+INTO\s+(@|OUTFILE|DUMPFILE)/i,  // SELECT INTO
      /SELECT\s+.*\s+WHERE\s+.*\s+LIKE\s+/i,  // WHERE LIKE
      /SELECT\s+.*\s+WHERE\s+.*\s+IN\s*\(/i,  // WHERE IN
      /\s+GROUP\s+BY\s+.*\s+HAVING\s+/i,  // GROUP BY ... HAVING
      /\s+ORDER\s+BY\s+.*\s+(ASC|DESC)/i,  // ORDER BY ... ASC/DESC
      /\s+LIMIT\s+\d+\s+OFFSET\s+\d+/i,  // LIMIT ... OFFSET
      
      // ==================== SHOW 语句扩展 ====================
      // 基于官方语法: SHOW DATABASES/TABLES [LIKE expr | WHERE expr | FROM | IN]
      /SHOW\s+DATABASES\s+(LIKE|WHERE)/i,
      /SHOW\s+TABLES\s+(LIKE|WHERE|FROM|IN)/i,
      /SHOW\s+TABLES\s+FROM\s+\w+/i,
      /SHOW\s+TABLES\s+IN\s+\w+/i,
      /SHOW\s+BACKEND\s+SERVERS/i,
      /SHOW\s+GRANTS\s+FOR\s+.*@/i,
      /SHOW\s+GLOBAL\s+VARIABLES/i,
      /SHOW\s+SESSION\s+VARIABLES/i,
      /SHOW\s+VARIABLES\s+(LIKE|WHERE)/i,
      /SHOW\s+FUNCTION\s+STATUS\s+LIKE/i,
      /SHOW\s+TABLE_NUMBER\s+FROM/i,  // MatrixOne 统计函数
      /SHOW\s+COLUMN_NUMBER\s+FROM/i,
      /SHOW\s+TABLE_VALUES\s+FROM/i,
      /SHOW\s+TABLE_SIZE\s+FROM/i,
      /SHOW\s+SCHEMAS/i,  // SHOW DATABASES 的同义词
      
      // ==================== 向量数据类型 ====================
      /vecf32\(/i,
      /vecf64\(/i,
      /VECF32\(/i,
      /VECF64\(/i,
      /\svecf32\s/i,
      /\svecf64\s/i,
      
      // ==================== JOIN 语法 ====================
      // 基于官方语法: ... INNER JOIN ... ON ...
      /\sINNER\s+JOIN\s+\w+\s+ON\s+/i,
      /\sLEFT\s+(OUTER\s+)?JOIN\s+\w+\s+ON\s+/i,
      /\sRIGHT\s+(OUTER\s+)?JOIN\s+\w+\s+ON\s+/i,
      /\sFULL\s+(OUTER\s+)?JOIN\s+\w+\s+ON\s+/i,
      /\sCROSS\s+JOIN\s+\w+/i,
      /\sNATURAL\s+JOIN\s+\w+/i,
      
      // ==================== 特殊查询语法 ====================
      /SELECT\s+.*\s+SAMPLE\s+/i,
      /EXPLAIN\s+VERBOSE/i,
      /EXPLAIN\s+ANALYZE/i,
      /\sLIKE\s+['"][^'"]*['"]/i,  // LIKE pattern
      /\sILIKE\s+/i,  // case-insensitive LIKE
      /\sIN\s*\([^)]+\)/i,  // IN (value1, value2, ...)
      /WITH\s+RECURSIVE\s+/i,  // 递归CTE
      /PREPARE\s+\w+\s+FROM/i,  // 预处理语句
      /EXECUTE\s+\w+/i,
      /DEALLOCATE\s+PREPARE/i,
      /USE\s+\w+/i,  // USE database
      
      // ==================== 聚合函数 ====================
      // 基于官方文档的聚合函数
      /\s(AVG|COUNT|MAX|MIN|SUM)\s*\(/i,  // 基础聚合函数
      /\sBIT_AND\s*\(/i,  // 位运算聚合
      /\sBIT_OR\s*\(/i,
      /\sBIT_XOR\s*\(/i,
      /\sSTDDEV_POP\s*\(/i,  // 统计函数
      /\sVAR_POP\s*\(/i,
      /\sVARIANCE\s*\(/i,
      /\sSTDDEV\s*\(/i,
      
      // ==================== 特殊函数 ====================
      /\sCAST\s*\(/i,  // CAST(value AS datatype)
      /\sINSTR\s*\(/i,
      /\sL[0-3]_NORM\s*\(/i,  // 向量范数函数
      /\sINNER_PRODUCT\s*\(/i,
      /\sCOSINE_SIMILARITY\s*\(/i,
      /\sL2_DISTANCE\s*\(/i,
      
      // ==================== 系统设置 ====================
      /SET\s+GLOBAL\s+save_query_result/i,
      /SET\s+GLOBAL\s+\w+\s*=/i,
      /SET\s+SESSION\s+\w+\s*=/i,
      
      // ==================== CREATE/DROP TABLE 语法 ====================
      // 基于官方语法: CREATE TABLE [IF NOT EXISTS] [db.]table_name (...)
      // 必须包含列定义（括号）才跳过
      /CREATE\s+(TEMPORARY\s+)?TABLE\s+(IF\s+NOT\s+EXISTS\s+)?(\w+\.)?\w+\s*\(/i,
      /CREATE\s+TABLE\s+.*\s+PRIMARY\s+KEY\s*\(/i,  // PRIMARY KEY
      /CREATE\s+TABLE\s+.*\s+CONSTRAINT\s+\w+\s+PRIMARY\s+KEY/i,  // CONSTRAINT
      /CREATE\s+TABLE\s+.*\sAS\s+SELECT/i,  // CREATE TABLE AS SELECT
      /CREATE\s+CLUSTER\s+TABLE/i,  // 集群表
      /CREATE\s+TABLE\s+.*\s+CLONE\s+/i,  // 克隆表
      /CLONE\s+\w+\.\w+/i,  // CLONE source_db.source_table
      /TO\s+ACCOUNT\s+\w+/i,  // 克隆到指定账户
      /\)\s*CLUSTER\s+BY\s*\(/i,  // 表定义后的 CLUSTER BY
      /CLUSTER\s+BY\s*\([^)]+\)/i,  // CLUSTER BY (col1, col2)
      // DROP TABLE 语法 - 更严格
      /DROP\s+TABLE\s+IF\s+EXISTS\s+(\w+\.)?\w+\s*;/i,  // IF EXISTS 必须在表名前
      /DROP\s+TABLE\s+(\w+\.)?\w+\s*;/i,  // 简单形式
      // CREATE VIEW 语法
      /CREATE\s+(OR\s+REPLACE\s+)?VIEW\s+\w+\s+AS\s+SELECT/i,
      /CREATE\s+VIEW\s+.*\sAS\s+$/i,  // CREATE VIEW ... AS (后面没有SELECT)
      
      // ==================== CREATE/DROP DATABASE 语法 ====================
      // 基于官方语法: CREATE DATABASE [IF NOT EXISTS] <database_name> [create_option]
      // 完整匹配，确保语法正确
      /CREATE\s+DATABASE\s+(IF\s+NOT\s+EXISTS\s+)?\w+\s*;/i,  // 简单形式
      /CREATE\s+DATABASE\s+(IF\s+NOT\s+EXISTS\s+)?\w+\s+(DEFAULT\s+)?CHARACTER\s+SET\s*(=\s*)?\w+/i,
      /CREATE\s+DATABASE\s+.*\s+COLLATE\s*(=\s*)?\w+/i,
      /CREATE\s+DATABASE\s+.*\s+ENCRYPTION\s*=\s*['"][YN]['"]/i,
      /DEFAULT\s+CHARACTER\s+SET\s*(=\s*)?\w+/i,
      // DROP DATABASE 语法 - 更严格
      /DROP\s+DATABASE\s+IF\s+EXISTS\s+\w+\s*;/i,  // IF EXISTS 必须在数据库名前
      /DROP\s+DATABASE\s+\w+\s*;/i,  // 简单形式
      
      // ==================== 分区语法 ====================
      /PARTITION\s+BY\s+RANGE/i,  // RANGE 分区
      /PARTITION\s+BY\s+HASH/i,  // HASH 分区
      /PARTITION\s+BY\s+KEY/i,  // KEY 分区
      /PARTITION\s+BY\s+LINEAR\s+HASH/i,  // LINEAR HASH
      /PARTITION\s+BY\s+LINEAR\s+KEY/i,  // LINEAR KEY
      /\s+LINEAR\s+HASH\s*\(/i,
      /\s+LINEAR\s+KEY\s*\(/i,
      /ALGORITHM\s*=\s*\{?[12]\}?/i,  // ALGORITHM = 1 | 2
      /PARTITIONS\s+\d+/i,  // PARTITIONS num
      /VALUES\s+LESS\s+THAN\s+MAXVALUE/i,  // VALUES LESS THAN MAXVALUE
      /VALUES\s+LESS\s+THAN\s*\(/i,  // VALUES LESS THAN (expr)
      /VALUES\s+IN\s*\(/i,  // VALUES IN (value_list)
      /\)\s*partition\s+by/i,  // 表定义后的 partition by
      
      // ==================== CREATE/DROP INDEX 语法 ====================
      // 基于官方语法: CREATE INDEX index_name ON table_name (column_name)
      /CREATE\s+(UNIQUE\s+)?INDEX\s+\w+\s+ON\s+\w+\s*\(/i,
      /CREATE\s+FULLTEXT\s+INDEX\s+\w+\s+ON\s+\w+/i,  // 全文索引
      /DROP\s+INDEX\s+\w+\s+ON\s+\w+/i,  // DROP INDEX
      // 特殊索引类型
      /INDEX\s+.*\s+USING\s+IVFFLAT/i,
      /USING\s+IVFFLAT/i,
      /USING\s+MASTER/i,
      
      // ==================== 占位符和示例代码 ====================
      /table_name\s+column_name\s+data_type/i,  // 示例代码
      /\[\s*OR\s+REPLACE\s*\]/i,  // 文档中的可选语法表示
      /^\s*\[/,  // 以 [ 开头的语法说明
      /^CREATE\s+\[\s*OR/i,
      /\{table_name\}/i,  // {table_name} 占位符
      /\{column_name\}/i,
      /\{elements\}/i,
      /<query_name>/i,  // <query_name> 占位符
      /<name>/i,
      /\$\{[^}]+\}/,  // ${...} 占位符
      /view_name\s+AS\s+query;/i,  // 示例代码
      /column1,\s*column2,\s*\.\.\./i,  // column1, column2, ... 示例
      /^\s*See\s+chapter/i,  // 文档链接
      
      // ==================== 表格输出（不应该在SQL代码块中） ====================
      /^\s*\|.*\|\s*$/m,  // 表格行
      /^\s*\+[-+]+\+\s*$/m,  // 表格边框
      
      // ==================== PostgreSQL 命令（迁移文档） ====================
      /postgres=#/i,
      /\\c\s+/i,
      /\\d[\+\s]/i,
      /COPY\s+.*\s+TO\s+'/i,
      /COPY\s+.*\s+FROM\s+'/i,
      
      // ==================== Oracle 命令（迁移文档） ====================
      /^sqlplus/i,
      /^SQL>/i,
      
      // ==================== Shell 命令和工具 ====================
      /^SOURCE\s+'/i,
      /^\$/,
      /^mysql\s+/,
      /^pg_dump/,
      /^mysqldump/,
      /^mo-dump/,
      
      // ==================== 特殊字符和编码问题 ====================
      /​/,  // 零宽字符
      /\u200B/,  // 零宽空格
      
      // ==================== 表选项和约束 ====================
      /\)\s*START\s+TRANSACTION/i,  // table option: START TRANSACTION
      /CREATE\s+TRIGGER\s+/i,  // 触发器
      /DROP\s+TRIGGER\s+/i,
      /BEFORE\s+(?:INSERT|UPDATE|DELETE)\s+ON/i,  // 触发器时机
      /AFTER\s+(?:INSERT|UPDATE|DELETE)\s+ON/i,
      /FOR\s+EACH\s+ROW/i,  // 触发器级别
      /\s+REFERENCES\s+\w+\s*\(/i,  // 外键引用
      /ON\s+DELETE\s+(?:CASCADE|RESTRICT|SET\s+NULL|NO\s+ACTION)/i,
      /ON\s+UPDATE\s+(?:CASCADE|RESTRICT|SET\s+NULL|NO\s+ACTION)/i,
      
      // ==================== 窗口函数和保留字问题 ====================
      /\s+OVER\s*\(/i,  // 窗口函数
      /PARTITION\s+BY\s+\w+/i,  // PARTITION BY in window functions
      /\s+RANK\s*\(\s*\)\s+OVER/i,  // RANK() OVER
      /\s+ROW_NUMBER\s*\(\s*\)\s+OVER/i,  // ROW_NUMBER() OVER
      /\s+DENSE_RANK\s*\(\s*\)\s+OVER/i,  // DENSE_RANK() OVER
      /\s+as\s+rank\b/i,  // "rank" 作为别名
      /\s+as\s+dense_rank\b/i,  // "dense_rank" 作为别名
      /\s+as\s+row_number\b/i,  // "row_number" 作为别名
      
      // ==================== JSON 数据类型 ====================
      /\s+JSON\b/i,  // JSON 数据类型
      /\s+JSONB\b/i,  // JSONB 数据类型
      
      // ==================== 常见拼写错误检测（反向白名单）====================
      // 这些是常见的错误拼写，应该被检查而不是跳过
      // 注意：这些规则会被优先检查，如果匹配则不跳过
      
      // ==================== 其他已知不兼容语法 ====================
      /REPLACE\s+INTO\s+.*\s+WHERE/i,  // node-sql-parser bug
      /"SQL"\s+IS\s+A\s+RESERVED\s+WORD/i,  // 保留字问题
      /IDENTIFIED\s+BY\s+/i,  // CREATE USER ... IDENTIFIED BY
      /ADMIN_NAME\s+/i,  // CREATE ACCOUNT ... ADMIN_NAME
    ]
  },
  
  // 报告配置
  report: {
    // 是否显示详细信息
    verbose: false,
    
    // 是否显示成功的检查
    showSuccess: false
  }
}

export default config

