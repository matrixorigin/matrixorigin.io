# Privilege Control in MatrixOne - Access Control Overview

MatrixOne's permission control is designed and implemented by combining two security models of role-based access control (RBAC, Role-based access control) and discretionary access control (DAC, Discretionary access control), which ensures the security of data access, and it provides a flexible and convenient management method for database operation and maintenance personnel.

- Role-based access control: Assign permissions to roles, and then assign roles to users.

   ![](https://github.com/matrixorigin/artwork/blob/main/docs/security/basic-concepts.png?raw=true)

- Discretionary Access Control: Every object has an owner who can set and grant access to that object.

## Basic concepts

### Object

An object is an entity that encapsulates permissions in MatrixOne, and these entities have a certain hierarchical structure. For example, a **Cluster** contains multiple **Account** (Account), and a **Account** contains multiple **User**, **Role** , **Database**, and a **Database** contains multiple **Table**, **View**, etc. This hierarchical structure is shown in the following figure:

![](https://github.com/matrixorigin/artwork/blob/main/docs/security/object.png?raw=true)

- Each object has one and only one **Owner**; otherwise, the **Owner** has the **Ownership** permission of the object.

   !!! note
        - Owner is for a specific object rather than a class of objects. For example, Role_1 is the Owner of db1, Role_2 is the Owner of db2, and Role_1 and db2 do not have a necessary permission relationship.
        - The Owner of an upper-level object does not necessarily have access rights to the lower-level object. For example, if Role_1 is the Owner of db1, and Role_2 created db1.table1, then Role_2 is the Owner of db1.table1, and Role_1 cannot view its data.

- The initial Owner of an object is its creator, and the Owner identity can be transferred by the Owner itself or an owner with advanced control.
- If the object owner is deleted, the object's owner is automatically changed to the owner of the deleted object.
- The ACCOUNTADMIN role has Ownership permissions on all objects by default.
- The set of access permissions for each object is different. For more information, please refer to [Access Control Permissions](access-control.md).

### Cluster Administrator

After the MatrixOne cluster is deployed, the system will generate a user with the highest authority to manage the cluster by default, that is, the cluster administrator (also called *root* or *dump*) and the role corresponding to this authority is **MOADMIN**. It can create, delete and manage other accounts but cannot manage other resources under a different account.

### Account

MatrixOne version 0.6 introduces the multi-accounts function. Multiple accounts can be created in a MatrixOne cluster. Objects between accounts are entirely independent; that is, users in account A cannot access data in account B.

Accounts are also called **Accounts** in MatrixOne. After the cluster is initialized, the system administrator will create a default system account.

To achieve cluster isolation, you can use the cluster administrator to create an account to manage each cluster separately. When creating a new account, you need to specify a new account administrator account and password for the new account.

__Tip__: The command format of the login account: `mysql -h IP -P PORT -uAccountName:Username -p`

Accounts in the cluster share the cluster's resources, and resources will be isolated when they are used. MatrixOne ensures that the resources used by the account are completely isolated and will not affect other account use.

### Role

A role is an entity with access rights. Any database user who wants to access an object must first be granted a role that has access rights to the object. The roles of MatrixOne are divided into system roles and user-defined roles. When the system is first started, or a new account is created, some system default roles will be initialized. They are often the highest administrator roles and users and cannot be modified or deleted. Use them to create more custom roles to manage the database as needed.

- A role can be granted multiple access rights to an object.
- A role can be granted access to multiple objects.
- Permissions can be passed between roles, usually there are two methods of **Grant** and **Inheritance**.

   + Grant: The grant of permission has the characteristic of granting a permanent effect. For example, role 1 has permissions a, b, c, and role 2 has permission d. At this time, if the permissions of role 1 are granted to role 2, then role 2 has permissions a, b, c, and d. When role 1 is deleted, role 2 Still have permissions a, b, c, d.
   + Inheritance: Inheritance of permissions has the characteristics of dynamic transfer. For example, role 1 has permissions a, b, c, role 3 has permissions e, f, you can specify role 3 to inherit role 1, then role 3 has permissions a, b, c, e, f, when role 1 is deleted, role 3 Only have permissions e, f.

     !!! note
          1.Manipulating granted and inherited roles requires Ownership permission on the object or one of the advanced grant permissions.
          2.The inheritance relationship of roles cannot be looped.

- MatrixOne implements permission isolation among account. That is, roles and users in an Account take effect only in the Account and are not transferred to other accounts. Authorization between roles is also limited to the Account.

### Switching Role

When a user wants to gain access to an object, he must first grant permission to a role and then grant the role to the user. A user can have multiple roles, but at the same time, the user can only use one role to access the database, we call this role the **primary role**, and the rest of the roles are **secondary roles**. When a user executes a specific SQL, the system will determine whether the primary role has the permissions required to execute the SQL and then decide whether to execute the SQL.

In some scenarios (for example, administrators do not have a well-established role system), SQL needs to be executed in combination with the permissions of multiple roles. MatrixOne provides the function of using secondary roles to help such users complete queries:

```sql
use secondary role { all | none }
```

The default parameter is `all`. If you choose to use `all`, the permissions of all secondary roles can be provided to the user; if you choose to use `none`, only the permissions of the primary role can be used.

### Deleting Object

When deleting a account, you need to close or suspend the account first, that is, you need to execute the SQL statement `close` or `suspend`.
When deleting a role, it will force all authorized role revoke users, that is, you need to execute the SQL statement `revoke`.
When deleting a user, the deletion of the user fails if the user currently has a session.

## Initialize access control

For the convenience of management, after the cluster or account is created, the system will automatically generate some **default users** and **default roles**.

#### Default users

|	Username| Description|
|---|---|
|root|After the cluster is created, it is automatically created and granted the MOADMIN role, which cannot be modified or deleted.|
|admin|Account is automatically created after creation and is granted the ACCOUNTADMIN role, which cannot be modified or deleted.|

#### Default roles

|	Username| Description|
|---|---|
|MOADMIN|The super administrator role is created automatically after the cluster is initialized and cannot be modified or deleted.|
|ACCOUNTADMIN|Account is created automatically after initialization and is the super administrator role of the ACCOUNT|
|PUBLIC|After the Account is created, it is automatically created. All users under the Account will be added to the PUBLIC role when they are created, and users cannot be removed. The initial permission of the PUBLIC role is CONNECT.|
