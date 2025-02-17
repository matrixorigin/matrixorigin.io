# Summary table of functions

This document lists the functions supported in the latest version of MatrixOne.

## Aggregate function

| Function name                                                | effect                              |
| ------------------------------------------------------ | --------------------------------------- |
| [ANY_VALUE()](./Aggregate-Functions/any-value.md)      | Returns any value in the parameter range|
| [AVG()](./Aggregate-Functions/avg.md)                  | Calculate the arithmetic mean of the parameter columns.|
| [BITMAP](./Aggregate-Functions/bitmap.md)              | A set of built-in functions for working with bitmaps, mainly for calculating different values|
| [BIT_AND()](./Aggregate-Functions/bit_and.md)          | Calculated the ratio of all the bits in the column by bit to the|
| [BIT_OR()](./Aggregate-Functions/bit_or.md)            | Calculated the bitwise or of all bits in the column|
| [BIT_XOR()](./Aggregate-Functions/bit_xor.md)          | Calculated the bitwise dissimilarity of all the bits in the column|
| [COUNT()](./Aggregate-Functions/count.md)              | The number of records of the query result was calculated|
| [GROUP_CONCAT()](./Aggregate-Functions/group-concat.md)| Concatenates content specified by columns or expressions|
| [MAX()](./Aggregate-Functions/max.md)                  | Returns the maximum of a set of values |
| [MEDIAN()](./Aggregate-Functions/median.md)            | Returns the median of a set of values|
| [MIN()](./Aggregate-Functions/min.md)                  | Returns the smallest of a set of values|
| [STDDEV_POP()](./Aggregate-Functions/stddev_pop.md)    | Used to calculate the overall standard deviation|
| [SUM()](./Aggregate-Functions/sum.md)                  | Used to calculate the sum of a set of values|
| [VARIANCE()](./Aggregate-Functions/variance.md)        | Used to calculate overall variance|
| [VAR_POP()](./Aggregate-Functions/var_pop.md)          | Used to calculate overall variance|
  
## Date Time Class Function

| Function name                                                | effect                              |
| ----------------------------------------------------- | --------------------------------------- |
| [CONVERT_TZ()](./Datetime/convert-tz.md)              |Used to convert a given datetime from one time zone to another.|
| [CURDATE()](./Datetime/curdate.md)                    |Returns the current date in YYYY-MM-DD format.|
| [CURRENT_TIMESTAMP()](./Datetime/current-timestamp.md)|Returns the current date and time in YYYY-MM-DD hh:mm:ss or YYYYMMDDhhmmss format.|
| [DATE()](./Datetime/date.md)                          |Intercepts the date portion of input in DATE or DATETIME format.|
| [DATE_ADD()](./Datetime/date-add.md)                  |Used to perform date arithmetic: add a specified time interval to a specified date.|
| [DATE_FORMAT()](./Datetime/date-format.md)            |Formatting date values from format strings|
| [DATE_SUB()](./Datetime/date-sub.md)                  |Used to perform date arithmetic: subtracts a specified time interval from a specified date.|
| [DATEDIFF()](./Datetime/datediff.md)                  |Returns the number of days between two dates|
| [DAY()](./Datetime/day.md)                            | Returns a date as the first of the month.|
| [DAYOFYEAR()](./Datetime/dayofyear.md)                |Number of days in a year corresponding to the date of return|
| [EXTRACT()](./Datetime/extract.md)                    |Partial extraction from the date|
| [HOUR()](./Datetime/hour.md)                          |Hours of return time|
| [FROM_UNIXTIME()](./Datetime/from-unixtime.md)        |Converts internal UNIX timestamp values to normal format datetime values, which are displayed in YYYY-MM-DD HH:MM:SS or YYYYMMDDHHMMSS format.|
| [MINUTE()](./Datetime/minute.md)                      |Returns the minutes of the time parameter|
| [MONTH()](./Datetime/month.md)                        |Returns the month of the date parameter|
| [NOW()](./Datetime/now.md)                            |Returns the current date and time in 'YYYY-MM-DD HH:MM:SS' format.|
| [SECOND()](./Datetime/second.md)                      |Returns the number of seconds for the time parameter|
| [STR_TO_DATE()](./Datetime/str-to-date.md)            |Convert a string to a date or datetime type according to a specified date or time display format|
| [SYSDATE()](./Datetime/sysdate.md)                    |Returns the current date and time in 'YYYY-MM-DD HH:MM:SS' format.|
| [TIME()](./Datetime/time.md)                          |Extracts the time portion of a time or datetime and returns it as a string|
| [TIMEDIFF()](./Datetime/timediff.md)                  |Returns the difference between two time parameters|
| [TIMESTAMP()](./Datetime/timestamp.md)                |Returns a date or datetime parameter as a datetime value|
| [TIMESTAMPDIFF()](./Datetime/timestampdiff.md)        |Returns an integer representing the time interval between the first datetime expression and the second datetime expression in the given time units|
| [TO_DATE()](./Datetime/to-date.md)                    |Convert a string to a date or datetime type according to a specified date or time display format|
| [TO_DAYS()](./Datetime/to-days.md)                    |Used to calculate the difference in the number of days between a given date and the start date of the Gregorian calendar (January 1, 0000)|
| [TO_SECONDS()](./Datetime/to-seconds.md)              |Used to calculate the difference in seconds between a given date or datetime expr and 0 hours, 0 minutes, 0 seconds on January 1, 0 AD.|
| [UNIX_TIMESTAMP](./Datetime/unix-timestamp.md)        |Returns the number of seconds from 1970-01-01 00:00:00 UTC to the specified time.|
| [UTC_TIMESTAMP()](./Datetime/utc-timestamp.md)        |Returns the current UTC time in the format YYYY-MM-DD hh:mm:ss or YYYYMMDDhhmmss|
| [WEEK()](./Datetime/week.md)                          |Used to calculate the number of weeks for a given date|
| [WEEKDAY()](./Datetime/weekday.md)                    |Returns the weekday index of the date (0 = Monday, 1 = Tuesday, ... 6 = Sunday)|
| [YEAR()](./Datetime/year.md)                          |Returns the year of the given date|

## Mathematical class functions

| Function name                     | effect                              |
| --------------------------------- | --------------------------------------- |
| [ABS()](./Mathematical/abs.md)    | Used to find the absolute value of a parameter|
| [ACOS()](./Mathematical/acos.md)  | Used to find the cosine of a given value (expressed in radians)  |
| [ATAN()](./Mathematical/atan.md)  | Used to find the arctangent of a given value (expressed in radians)|
| [CEIL()](./Mathematical/ceil.md)  | Used to find the smallest integer that is not less than the argument.|
| [CEILING()](./Mathematical/ceiling.md)  | Used to find the smallest integer that is not less than the argument.|
| [COS()](./Mathematical/cos.md)    | Used to find the cosine of an input parameter (expressed in radians).|
| [COT()](./Mathematical/cot.md)    | Used to find the cotangent value of the input parameter (expressed in radians). |
| [CRC32()](./Mathematical/crc32.md)| Used to calculate a CRC32 checksum for a string |
| [EXP()](./Mathematical/exp.md)    | Used to find the exponent of number with the natural constant e as the base.|
| [FLOOR()](./Mathematical/floor.md)| Used to find the number of digits not greater than the corresponding digit of a number. |
| [LN()](./Mathematical/ln.md)      | The natural logarithm used to find the parameters|
| [LOG()](./Mathematical/log.md)    | The natural logarithm used to find the parameters|
| [LOG2()](./Mathematical/log2.md)  | Used to find the logarithm with 2 as the base parameter.|
| [LOG10()](./Mathematical/log10.md)| Used to find logarithms with a base argument of 10.|
| [PI()](./Mathematical/pi.md)      | Used to find the mathematical constant π (pi)|
| [POWER()](./Mathematical/power.md)| POWER(X, Y) is used to find the Yth power of X.|
| [ROUND()](./Mathematical/round.md)| Used to find the value of a number rounded to a specific number of digits.|
| [RAND()](./Mathematical/rand.md)  | Used to generate a random number of type Float64 between 0 and 1.|
| [SIN()](./Mathematical/sin.md)    | Used to find the sine of an input parameter (expressed in radians)|
| [SINH()](./Mathematical/sinh.md)  | For finding the hyperbolic sine of an input parameter (expressed in radians)|
| [TAN()](./Mathematical/tan.md)    | Used to find the tangent of the input parameter (expressed in radians).|

## String class function

| Function name                     | effect                              |
| ---------------------------------------------- | --------------------------------------- |
| [BIN()](./String/bin.md)                       |  Converts arguments to binary string form.|
| [BIT_LENGTH()](./String/bit-length.md)         | Returns the length of the string str in bits.|
| [CHAR_LENGTH()](./String/char-length.md)       | Returns the length of the string str in characters.|
| [CONCAT()](./String/concat.md)                 | Concatenate multiple strings (or strings containing only one character) into a single string|
| [CONCAT_WS()](./String/concat-ws.md)           | Represents Concatenate With Separator, a special form of CONCAT().|
| [EMPTY()](./String/empty.md)                   | Determines whether the input string is empty. |
| [ENDSWITH()](./String/endswith.md)             | Checks if it ends with the specified suffix.|
| [FIELD()](./String/field.md)                   | Returns the position of the first string str in the list of strings (str1,str2,str3,...). in the list of strings (str1,str2,str3...) |
| [FIND_IN_SET()](./String/find-in-set.md)       | Finds the location of the specified string in a comma-separated list of strings.|
| [FORMAT()](./String/format.md)                 | Used to format numbers to the "#,###,###. ###" format and round to one decimal place.|
| [FROM_BASE64()](./String/from_base64.md)       | Used to convert Base64 encoded strings back to raw binary data (or text data).|
| [HEX()](./String/hex.md)                       | Returns the hexadecimal string form of the argument|
| [INSTR()](./String/instr.md)                   | Returns the position of the first occurrence of the substring in the given string.|
| [LCASE()](./String/lcase.md)                   | Used to convert the given string to lowercase form.|
| [LEFT()](./String/left.md)                     | Returns the leftmost length character of the str string.|
| [LENGTH()](./String/length.md)                 | Returns the length of the string.|
| [LOCATE()](./String/locate.md)                 | Function for finding the location of a substring in a string.|
| [LOWER()](./String/lower.md)                   | Used to convert the given string to lowercase form.|
| [LPAD()](./String/lpad.md)                     | Used to fill in the left side of the string.|
| [LTRIM()](./String/ltrim.md)                   | Removes leading spaces from the input string and returns the processed characters.|
| [MD5()](./String/md5.md)                       | Generates a 32-character hexadecimal MD5 hash of the input string.|
| [OCT()](./String/oct.md)                       | Returns a string of the octal value of the argument|
| [REPEAT()](./String/repeat.md)                 | Repeats the input string n times and returns a new string.|
| [REVERSE()](./String/reverse.md)               | Flips the order of the characters in the str string and outputs them.|
| [RPAD()](./String/rpad.md)                     | Used to fill in the right side of a string|
| [RTRIM()](./String/rtrim.md)                   | Remove trailing spaces from the input string.|
| [SHA1()/SHA()](./String/sha1.md)               | Used to compute and return the SHA-1 hash of a given string.|
| [SHA2()](./String/sha2.md)                     | Returns the SHA2 hash of the input string.|
| [SPACE()](./String/space.md)                   | Returns a string of N spaces.|
| [SPLIT_PART()](./String/split_part.md)         | Used to break a string into multiple parts based on a given separator character|
| [STARTSWITH()](./String/startswith.md)         | The string returns 1 if it starts with the specified prefix, 0 otherwise.|
| [SUBSTRING()](./String/substring.md)           | Returns a substring starting at the specified position|
| [SUBSTRING_INDEX()](./String/substring-index.md)| Get characters with different index bits, indexed by the separator.|
| [TO_BASE64()](./String/to_base64.md)           | Used to convert strings to Base64 encoded strings|
| [TRIM()](./String/trim.md)                     | Returns a string, removing unwanted characters.|
| [UCASE()](./String/ucase.md)                   | Used to convert the given string to uppercase form.|
| [UNHEX()](./String/unhex.md)                   | Used to convert a hexadecimal string to the corresponding binary string.|
| [UPPER()](./String/upper.md)                   | Used to convert the given string to uppercase. |

## Regular Expressions

| Function name                     | effect                              |
| ------------------------------------------------------------------ | -------------------------------------- |
| [NOT REGEXP()](./String/Regular-Expressions/not-regexp.md)         | Used to test if a string does not match a specified regular expression|
| [REGEXP_INSTR()](./String/Regular-Expressions/regexp-instr.md)     | Returns the starting position in the string of the matched regular expression pattern.|
| [REGEXP_LIKE()](./String/Regular-Expressions/regexp-like.md)       | Used to determine if the specified string matches the provided regular expression pattern|
| [REGEXP_REPLACE()](./String/Regular-Expressions/regexp-replace.md) | Used to replace a string matching a given regular expression pattern with a specified new string|
| [REGEXP_SUBSTR()](./String/Regular-Expressions/regexp-substr.md)   | Used to return a substring of a string argument that matches a regular expression argument.|

## Vector class functions

| Function name                     | effect                              |
| ---------------------------------------------------- | --------------------------------------- |
| [基本操作符](./Vector/arithmetic.md)                   | Addition (+), subtraction (-), multiplication (*) and division (/) of vectors.|
| [SQRT()](./Vector/misc.md)                           | Used to calculate the square root of each element in a vector|
| [ABS()](./Vector/misc.md)                            | Used to calculate the absolute value of a vector|
| [CAST()](./Vector/misc.md)                           | Used to explicitly convert a vector from one vector type to another vector type|
| [SUMMATION()](./Vector/misc.md)                      | Returns the sum of all elements in the vector|
| [INNER_PRODUCT()](./Vector/inner_product.md)         | Used to compute the inner product/dot product between two vectors|
| [CLUSTER_CENTERS()](./Vector/cluster_centers.md)       | K clustering centers for determining vector columns |
| [COSINE_DISTANCE()](./Vector/cosine_distance.md)     | Used to compute the cosine distance of two vectors.|
| [COSINE_SIMILARITY()](./Vector/cosine_similarity.md) | A measure of the cosine of the angle between two vectors, indicating their similarity by their proximity in a multidimensional space|
| [L2_DISTANCE()](./Vector/l2_distance.md)             |Used to compute the Euclidean distance between two vectors|
| [L1_NORM()](./Vector/l1_norm.md)                     | Used to compute l1/Manhattan/TaxiCab norms|
| [L2_NORM()](./Vector/l2_norm.md)                     | For calculating l2/Euclidean paradigms|
| [NORMALIZE_L2()](./Vector/normalize_l2.md)           | For performing Euclidean normalization|
| [SUBVECTOR()](./Vector/subvector.md)                 | For extracting subvectors from vectors|
| [VECTOR_DIMS()](./Vector/vector_dims.md)             | Used to determine the dimension of the vector|

## Table function

| Function name                     | effect                              |
| -------------------------------- | --------------------------------------- |
| [GENERATE_SERIES()](./Table/generate_series.md)    | Used to form a sequence from start value to end value|
| [UNNEST()](./Table/unnest.md)    | Used to expand an array of columns or parameters within JSON-type data into a table.|

## Window function

| Function name                                       | effect                              |
| --------------------------------------------------- | --------------------------------------- |
| [DENSE_RANK()](./Window-Functions/dense_rank.md)    | Provide a unique ranking for each row in the dataset|
| [RANK()](./Window-Functions/rank.md)                | Provide a unique ranking for each row in the dataset|
| [ROW_UNMBER()](./Window-Functions/row_number.md)    | Provide a unique serial number for each row in the data set|

## JSON function

| Function name                                  | effect|
|------------------------------------------------| -------------------------------------|
| [JQ()](./Json/jq.md)                           | Used to parse and transform JSON data based on jq expressions |
| [JSON_EXTRACT()](./Json/json_extract.md)       | Return data from a JSON document |
| [JSON_EXTRACT_FLOAT64()](./Json/json_extract_float64.md) | Extract the value of the specified path from JSON data |
| [JSON_EXTRACT_STRING()](./Json/json_extract_string.md)   | Extract the value of a string with a specified path from JSON data |
| [JSON_QUOTE()](./Json/json_quote.md)            | Quote JSON document |
| [JSON_ROW()](./Json/json_row.md)                | Used to convert each row into a json array |
| [JSON_SET()](./Json/json_set.md)               | Used to set or update the value of a key in a JSON document |
| [JSON_UNQUOTE()](./Json/json_unquote.md)        | Unquote a JSON document |
| [TRY_JQ()](./Json/try_jq.md)                    | Used to parse and convert JSON data based on jq expressions, and provide a fault-tolerant mechanism |

## system operation and maintenance function

| Function name                     | effect                              |
| ----------------------------------------------------------- | --------------------------------------- |
| [CURRENT_ROLE_NAME()](./system-ops/current_role_name.md)    | Used to query the name of the role owned by the currently logged in user.|
| [CURRENT_ROLE()](./system-ops/current_role.md)              | Returns the role of the current session.|
| [CURRENT_USER_NAME()](./system-ops/current_user_name.md)    | Used to look up the name of the user you are currently logged in as.|
| [CURRENT_USER()](./system-ops/current_user.md)              | Returns the current user account|
| [PURGE_LOG()](./system-ops/purge_log.md)                    | Used to delete logs recorded in MatrixOne database system tables.|

## Other functions

| Function name | effect |
| ----------------------------------| --------------------------------------------|
| [LOAD_FILE()](./Other/load_file.md) | Used to read the contents of the file pointed to by the datalink type. |
| [SAVE_FILE()](./Other/save_file.md) | Used to save the content of the file pointed to by the datalink type. |
| [SAMPLE()](./Other/sample.md) | Mainly used to quickly reduce the query scope |
| [SERIAL_EXTRACT()](./Other/serial_extract.md) | Used to extract individual elements in a sequence/tuple value |
| [SLEEP()](./Other/sleep.md) | Pause (sleep) the current query for the specified number of seconds |
| [STAGE_LIST()](./Other/stage_list.md) | Used to view directories and files in stage. |
| [UUID()](./Other/uuid.md) | Returns an internationally unique identifier generated according to RFC 4122 |