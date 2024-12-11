# Password complexity check

MatrixOne provides a series of system variables for configuring password complexity verification to ensure password security. These variables support dynamic modification. The core variable is validate_password. The other settings only take effect when validate_password is turned on.

- validate_password: Switch to control the password complexity verification function, value range: ON | OFF (default value: OFF).

- validate_password.changed_characters_percentage: Specifies the proportion of characters that need to be changed in the new password compared to the old password, value range: [0-100] (default value: 0).

- Password policy (validate_password.policy): used to define the global password complexity policy, supporting two modes: 0/low and 1/medium:

    <table border="1">
    <tr>
        <th>Policy</th>
        <th>Effective parameters</th>
    </tr>
    <tr>
        <td>0/LOw</td>
        <td>validate_password.length</td>
    </tr>
    <tr>
        <td rowspan="4">1/MEDIUM</td>
        <td>validate_password.length</td>
    </tr>
    <tr>
        <td>validate_password.mixed_case_count</td>
    </tr>
    <tr>
        <td>validate_password.number_count</td>
    </tr>
     <tr>
        <td>validate_password.special_char_count</td>
    </tr>
    </table>

      - validate_password.length: Specifies the minimum character length of the password, value range: >= 0 (default value: 8).

      - validate_password.mixed_case_count: The minimum number of uppercase and lowercase characters required in the password, value range: >= 0 (default value: 1).

      - validate_password.number_count: Specifies the minimum number of numeric characters that must be included in the password, value range: >= 0 (default value: 1).

      - validate_password.special_char_count: Specifies the minimum number of special characters that need to be included in the password, value range: >= 0 (default value: 1).

## Check

```sql
select @@global.validate_password;
select @@global.validate_password.changed_characters_percentage;
select @@global.validate_password.check_user_name;
select @@global.validate_password.length;
select @@global.validate_password.mixed_case_count;
select @@global.validate_password.number_count;
select @@global.validate_password.special_char_count;
```

## set up

After setting, you need to exit and reconnect to take effect.

```sql
set global validate_password=xx; --Default is 0
set global validate_password.changed_characters_percentage=xx; --Default is 0
set global validate_password.check_user_name=xx;--Default is 1
set global validate_password.policy=xx;--Default is 0
set global validate_password.length=xx;--Default is 8
set global validate_password.mixed_case_count=xx;--Default is 1
set global validate_password.number_count=xx;--Default is 1
set global validate_password.special_char_count==xx;--Default is 1
```

## Example

### validate_password

```sql
mysql> select @@global.validate_password;
+---------------------+
| @@validate_password |
+---------------------+
| 0                   |
+---------------------+
1 row in set (0.00 sec)

mysql> set global validate_password=1;
Query OK, 0 rows affected (0.02 sec)

mysql> select @@global.validate_password; --Reconnection takes effect
+---------------------+
| @@validate_password |
+---------------------+
| 1                   |
+---------------------+
1 row in set (0.00 sec)

```

### validate_password.changed_characters_percentage

```sql
mysql> select @@global.validate_password.changed_characters_percentage;
+---------------------------------------------------+
| @@validate_password.changed_characters_percentage |
+---------------------------------------------------+
| 0                                                 |
+---------------------------------------------------+
1 row in set (0.01 sec)

# Create user u1, character ratio is 0%, created successfully
mysql> create user u1 identified by '12345678';
Query OK, 0 rows affected (0.02 sec)

mysql>set global validate_password.changed_characters_percentage=80;--Set character proportion to 80%

mysql> select @@global.validate_password.changed_characters_percentage; --Reconnection takes effect
+---------------------------------------------------+
| @@validate_password.changed_characters_percentage |
+---------------------------------------------------+
| 80                                                |
+---------------------------------------------------+
1 row in set (0.00 sec)

# Create user u2, character ratio is 0%, creation failed
mysql> create user u2 identified by '12345678';
ERROR 20301 (HY000): invalid input: Password '12345678' does not contain enough changed characters

# Create user u2, characters account for 20%, creation failed
mysql> create user u2 identified by '12345678ab';
ERROR 20301 (HY000): invalid input: Password '12345678ab' does not contain enough changed characters

# Create user u2, characters account for 80%, created successfully
mysql> create user u4 identified by '12abdefhij';
Query OK, 0 rows affected (0.01 sec)
```

### validate_password.policy and its related parameters

The following parameters need to enable validate_password.policy to take effect.

```sql
mysql> select @@global.validate_password.policy;
+----------------------------+
| @@validate_password.policy |
+----------------------------+
| 0                          |
+----------------------------+
1 row in set (0.00 sec)
set global validate_password.policy=1;

mysql> select @@global.validate_password.policy;--Reconnection takes effect
+----------------------------+
| @@validate_password.policy |
+----------------------------+
| 1                          |
+----------------------------+
1 row in set (0.00 sec)
```

#### validate_password.length

```sql
mysql> select @@global.validate_password.length;
+----------------------------+
| @@validate_password.length |
+----------------------------+
| 8                          |
+----------------------------+
1 row in set (0.00 sec)

# Create user u3, the password length is 8, the creation is successful
mysql> create user u3 identified by 'Pass123!';
Query OK, 0 rows affected (0.01 sec)

mysql> set global validate_password.length=9;
Query OK, 0 rows affected (0.01 sec)

mysql> select @@global.validate_password.length;
+----------------------------+
| @@validate_password.length |
+----------------------------+
| 9                          |
+----------------------------+
1 row in set (0.00 sec)

# Create user u4, password length is 8, creation failed
mysql> create user u4 identified by 'Pass123!';
ERROR 20301 (HY000): invalid input: Password 'Pass123!' is too short, require at least 9 characters

# Create user u4, the password length is 9, the creation is successful
mysql> create user u4 identified by 'Pass1234!';
Query OK, 0 rows affected (0.02 sec)
```

#### validate_password.mixed_case_count

```sql
mysql> select @@global.validate_password.mixed_case_count;
+--------------------------------------+
| @@validate_password.mixed_case_count |
+--------------------------------------+
| 1                                    |
+--------------------------------------+
1 row in set (0.00 sec)

--Create user u4, the password contains one uppercase letter and one lowercase letter, the creation is successful
mysql> create user u4 identified by 'Pa12345!';
Query OK, 0 rows affected (0.01 sec)

--Set validate_password.mixed_case_count to 2
mysql> set global validate_password.mixed_case_count=2;
Query OK, 0 rows affected (0.01 sec)

mysql> select @@global.validate_password.mixed_case_count; --Reconnection takes effect
+--------------------------------------+
| @@validate_password.mixed_case_count |
+--------------------------------------+
| 2                                    |
+--------------------------------------+
1 row in set (0.00 sec)

--Create user u5. The password contains one uppercase letter and one lowercase letter. The creation failed.
mysql> create user u5 identified by 'Pa12345!';
ERROR 20301 (HY000): invalid input: Password 'Pa12345!' does not meet the Lowercase requirements

--Create user u5. The password contains two uppercase letters and two lowercase letters. The creation failed.
mysql> create user u5 identified by 'PPaa123!';
Query OK, 0 rows affected (0.01 sec)
```

#### validate_password.number_count

```sql
mysql> select @@global.validate_password.number_count;
+----------------------------------+
| @@validate_password.number_count |
+----------------------------------+
| 1                                |
+----------------------------------+
1 row in set (0.00 sec)

--Create user u6, the password contains 1 number, the creation is successful
mysql> create user u6 identified by 'Password1!';
Query OK, 0 rows affected (0.01 sec)

mysql> set global validate_password.number_count=2;
Query OK, 0 rows affected (0.01 sec)

mysql> select @@global.validate_password.number_count;
+----------------------------------+
| @@validate_password.number_count |
+----------------------------------+
| 2                                |
+----------------------------------+
1 row in set (0.00 sec)

--Create user u7, the password contains a number, the creation failed
mysql> create user u7 identified by 'Password1!';
ERROR 20301 (HY000): invalid input: Password 'Password1!' does not meet the Number requirements

--Create user u7, the password contains two numbers, the creation is successful
mysql> create user u7 identified by 'Password12!';
Query OK, 0 rows affected (0.01 sec)
```

#### validate_password.special_char_count

```sql
mysql> select @@global.validate_password.special_char_count;
+----------------------------------------+
| @@validate_password.special_char_count |
+----------------------------------------+
| 1                                      |
+----------------------------------------+
1 row in set (0.00 sec)

--Create user u8, the password contains a special character, the creation is successful
mysql> create user u8 identified by 'Password123!';
Query OK, 0 rows affected (0.01 sec)

mysql> set global validate_password.special_char_count=2;
Query OK, 0 rows affected (0.01 sec)

mysql> select @@global.validate_password.special_char_count; --Effective after reconnection
+----------------------------------------+
| @@validate_password.special_char_count |
+----------------------------------------+
| 2                                      |
+----------------------------------------+
1 row in set (0.00 sec)

--Create user u9. The password contains a special character and the creation fails.
mysql> create user u9 identified by 'Password123!';
ERROR 20301 (HY000): invalid input: Password 'Password123!' does not meet the Special Char requirements

--Create user u9, the password contains two special characters, the creation is successful
mysql> create user u9 identified by 'Password123!!';
Query OK, 0 rows affected (0.01 sec)
```