# MatrixOne Password Management

To protect the security of user passwords, MatrixOne supports password management capabilities:

- Password complexity strategy: Requires users to set strong passwords to prevent empty or weak passwords.

## Password Complexity Strategy

MatrixOne recommends that users set complex passwords to ensure account security.

- Suggested complexity: uppercase letters, lowercase letters, numbers, and special symbols.
- Recommended length: no less than 12 characters.

## Modify Password Permissions

- System Administrator (i.e., the root user): Has the highest authority. Can modify the password of the root user itself and the password of Accounts created by the root user.
- Accounts: Have authority second only to the system administrator. They can modify their own password and the password of ordinary users created by the Account.
- Other ordinary users: Can only modify their own passwords.

For more information about permission levels, see [Privilege Control Types](../Reference/access-control-type.md).

## Tutorial of Password Changing

### Root User Changing Password

#### Root User Changing their own Password

After starting MatrixOne and successfully logging in with the root, you can use the following command to change the password:

```sql
mysql> alter user root identified by '${your password}'
```

After the change is completed, you can go ahead and exit the current session and log into MatrixOne again for the new password to take effect.

!!! note
    Since the root account is the user with the highest authority by default, please log in with the initial account password and change the password in time.

#### Root Changing Account's Password

Refer to [ALTER ACCOUNT](../Reference/SQL-Reference/Data-Control-Language/alter-account.md)

### Other Users Changing Password

#### Account Changing their own Password

Refer to [ALTER ACCOUNT](../Reference/SQL-Reference/Data-Control-Language/alter-account.md)

#### Account Changing The Password Of Other Users They Created

Refer to [ALTER USER](../Reference/SQL-Reference/Data-Control-Language/alter-account.md)

#### Ordinary User Changing their own Password

Refer to [ALTER USER](../Reference/SQL-Reference/Data-Control-Language/alter-account.md)
