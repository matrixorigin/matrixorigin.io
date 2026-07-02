# Privilege Management Overview

MatrixOne privilege management helps you manage accounts and users' life cycles, assign users complementary roles, and control access rights to resources in MatrixOne. When there are multiple users in a database or cluster unit, privilege management ensures that users only access authorized help, and granting users the principle of least authority can reduce enterprise information security risks.
MatrixOne can also implement multi-account solutions through rights management. In MatrixOne, the data or resources owned by each account in the cluster are safely isolated, and users across cluster units cannot access the help of other cluster units. Only users authorized to access resources in the cluster have the right to access this A resource within a cluster unit.

## Privilege Management Features

MatrixOne's privilege management is designed and implemented by combining two security models: RBAC (Role-based access control) and discretionary access control (DAC, Discretionary access control). These two security models are neutral access. The control mechanism mainly revolves around role and authority authorization strategies. It not only ensures data access security but also provides flexible and convenient management methods for database operation and maintenance personnel.

- **Role-Based Access Control (RBAC)**: assign privileges to roles, and then assign roles to users.

   ![](https://github.com/matrixorigin/artwork/blob/main/docs/security/basic-concepts-1.png?raw=true)

- **Discretionary Access Control (DAC)**: Every object has an owner who can set and grant access privileges to that object.

   ![](https://github.com/matrixorigin/artwork/blob/main/docs/security/dac.png?raw=true)

## Key Concepts

### Object

In MatrixOne, the privileges are encapsulated in an entity, which is **object**to facilitate the management of multiple operation privileges.

For example, operation privileges such as `Select`, `Insert`, and `Update` is encapsulated in the Table object. For more information about object privileges, please refer to [MatrixOne Privilege Control Types](../../Reference/access-control-type.md).

#### Relationship between objects

As shown in the diagram below: from above, higher-level objects can create (or delete) lower-level objects.

![](https://github.com/matrixorigin/artwork/blob/main/docs/security/object-1.png?raw=true)

The hierarchical relationships in the above figure are all 1:n relationships; that is, multiple accounts can be created in one cluster, multiple users and roles can be created under one account, and multiple tables and views can be created in one database.

In MatrixOne, although the operation privileges in each object are independent of each other (for example, the `SHOW TABLES` privilege in the Database object is not directly related to the `SELECT` privilege in the Table object), the creation of objects still has Certain associations, for example, the `CREAT TABLE` privilege in the Database object can create Table objects, which forms a hierarchical relationship between objects,

Then, since high-level objects can create low-level objects, the higher-level objects are **object creators (Owner)**.

#### Object creators (Owner)

When an object is created, the creator is the object's owner, who has the highest authority to manage the object (that is, **Ownership authority**, which is all the authority encapsulated in the object). The owner's operation authority sets all operations on the object.

For example, the Table object has `Select`, `Insert`, `Update`, `Delete`, `Truncate`, and `Ownership` privileges; if a role has the Ownership privilege of a certain Table, then the role is equivalent to having `Select`, `Insert`, `Update`, `Delete`, `Truncate` privileges.

Due to the transitivity between privileges, roles, and users, you can understand the creator of an object (starting now referred to as the object owner) as a role.

**How to understand that the creator of an object is a role?**

A user can have multiple roles at the same time. For example, User A has three roles: Role 1, Role 2, and Role 3. Each role has different privileges, as shown in the following figure, to help you quickly understand this behavior:

![](https://github.com/matrixorigin/artwork/blob/main/docs/security/example.png?raw=true)

If *User A* is currently using *Role 1*, *User A* needs to create a new *User B*, but the current *Role 1* does not have privilege to create new users. *Role 2* has the authorization to create new users, then *User A* needs to switch to the *Role 2* role and create a new user. Then, the Owner of New *User B* is *Role 2*, and other roles, *Role 1* and *Role 3*, cannot have the ownership of *User B*.

**Owner points to the object**

- An object's Owner is a role, and the object's original Owner is the role that created it.

- There is only one Owner of an object at any time.

- A role can create multiple objects so that a role can be the Owner of multiple objects.

- A role is an object, so a role also has an Owner.

- When the Owner of an object is deleted, the Owner of the object will be automatically changed to the Owner of the deleted role.

- The owner can be transferred to another role.

__Note__: *ACCOUNTADMIN* (account administrator role, automatically generated after the account is created) is not the Owner of the objects used in the account. Still, it has the Ownership privilege of all objects.

### Cluste

The cluster is the highest-level object in MatrixOne privileges management.

__Tip__: The collection of operational privileges on cluster objects is called system privileges.

### Account

In the MatrixOne cluster, multiple accounts with completely isolated data and user authority systems can be created and managed, and these resource-isolated accounts can be managed. This multi-account function not only saves the cost of deploying and operating multiple sets of data business systems but also can take advantage of sharing hardware resources between accounts to save machine costs to the greatest extent.

#### System Account

To be compatible with the usage habits of traditional non-multi-account databases, MatrixOne will automatically create a new system default account after the cluster is created, that is, **Sys Account**. If you only have one set of data business systems that need to be managed by MatrixOne, there is no need to create more accounts, log in and access the **Sys Account** directly.

### Role

A role is also an object used to manage and grant privileges in MatrixOne.

First of all, you need to have a high-privilege account first to do some initial resource allocation; for example, create some roles and users by **Sys Account** or **Account**, grant object privileges to the role, and then grant the role to the user, at this time, the user can operate on the object. It needs to be granted to a user. In a account, the user cannot perform any operations if a user is not granted a role.

**Role** is set up to save the operation cost of granting the same authority. The three privileges p1, p2, and p3 must be granted to users u1, u2, and u3. You only need to grant p1, p2, and p3 to role r1 first, then grant role r1 to users u1, u2, and u3 simultaneously. It is easier to operate than granting each privilege to each user separately, and this advantage will become more obvious as the number of users and privileges increases. At the same time, the emergence of roles further abstracts the privilege set and its relationship, which is also very convenient for later privilege maintenance.

After the cluster and account (Account) are created, MatrixOne will automatically create some default roles and users (see the **Initialization Access** section below for details); these roles have the highest management authority and are used to manage the cluster and account at the beginning ( Account), we do not recommend that you grant these roles to users who execute SQL daily. Excessive privileges will introduce more security issues. Therefore, MatrixOne supports the creation of custom roles. You can customize roles according to the user's business needs and assign appropriate privileges to these roles.

**Highlights**

In MatrixOne, the behavior details of roles are as follows:

- A role can be granted multiple privileges.
- A role can be granted to multiple users.
- A role can pass its privileges to another role.

    + Use all the privileges of a role to another role; for example, pass all the privileges of role1 to role2, then role2 inherits the privileges of role1,

- Roles and users only take effect within their respective Account, including the Sys Account.

!!! note
    1. The privilege inheritance of roles is dynamic. If the privileges of the inherited role change, the scope of privileges inherited by the inherited role will also change dynamically.
    2. The inheritance relationship of roles cannot form a loop. For example, role1 inherits role2, role 2 inherits role3, and role3 inherits role1.
    3. The transfer of privileges between roles makes privilege management more convenient, but it also has risks. For this reason, MatrixOne only allows roles with *Manage Grants* privilege to do this kind of operation. This privilege is granted to the system default role *MOADMIN* by default or *ACCOUNTADMIN*, and it is not recommended to grant this privilege to a custom role when creating a new one.

#### Role Switching

A user is granted multiple roles to perform different types of data services.

**Main role**: The user can only use one of the roles at a particular moment; we call the currently used role **main role**.

**Secondary role**: In addition to the main role, the set of other roles owned by the user is called the **secondary role**.

By default, if a user wants to execute SQL with another role's privilege, he needs to switch roles first (Use SQL as `set role <role>`). In addition, to be compatible with the privilege behavior of classic databases, MatrixOne also supports the function of *using secondary roles*: use `set secondary role all`; after executing this SQL, the user can have the privileges of all his roles at the same time, execute `set secondary role none` to turn off this feature.

## Application scenarios

### Resource Isolation Scenarios Introduction

Company A purchased a MatrixOne cluster and completed the deployment. Since Company A has a large scale, many complex business lines, and a huge amount of data, it wants to develop an application for a certain business line, assuming it is named *BusinessApp*. Still, it needs to be isolated from the data of other business lines. So how does MatrxiOne isolate these data resources and authority resources?

After completing the deployment of the MatrixOne cluster, *Tom* of the R&D department obtained the account of the cluster administrator, and the company assigned him to complete the task of resource isolation. *Tom* needs to do this:

1. *Tom* logs into MatrixOne with the cluster administrator account.
2. *Tom* needs to create two accounts first, one is *BusinessAccount* and the other is *ElseAccount*.

    - The data resources within *BusinessAccount* are mainly used to develop the application *BusinessApp*.
    - Data resources within *ElseAccount* may be used for other business purposes.

For the specific operation of resource isolation, please refer to [Quick Start: Create accounts, Verify Resource Isolation](../how-tos/quick-start-create-account.md).

### Introduction to User Creation and Authorization Scenarios

Still using the above scenario example, *Tom* gives the account account *BusinessAccount* to the company's data administrator *Robert*, and asks *Robert* to assign new user accounts and privileges to other R&D colleagues.

R&D colleague *Joe* is the application developer of this company. A project *BusinessApp*, *Joe* has a development task, and *Joe* needs to use all the data in the database. Then *Robert* will help *Joe* open an account and authorize *Joe*:

1. *Robert* first creates a user account (i.e., user) for *Joe*, named *Joe_G*, and *Joe* uses *Joe_G* to log in to MatrixOne.
2. *Robert* creates another role for *Joe*, named *Appdeveloper*, and assigns the *Appdeveloper* role to *Joe*'s user account *Joe_G*.
3. *Robert* grants the *ALL ON DATABASE* permission to the role *Appdeveloper*.
4. *Joe* can use the account *Joe_G* to log in to MatrixOne, and has full authority to operate the database for development.

For specific user creation and authorization operations, see [Quick start: Create a new account, use the new account, creates users, create roles, and grant the privilege](../how-tos/quick-start-create-user.md).

## Initialize Access

After initializing the cluster or account, the system will automatically generate some default users and default roles:

| **Username** | **Explanation** | **Role** | **Privilege** | **Description** |
| --- | --- | --- | --- | --- |
| root | Cluster administrator | MOADMIN | Create, edit, delete accounts | Automatically generated and granted after cluster creation |
| root | System account administrator | MOADMIN | Manage all resources under the system account, including users, roles, databases/tables/views, authorization management |Automatically generated and granted after the cluster is created |
| <Customized> | account administrator | ACCOUNTADMIN | Manage all resources under common accounts, including users, roles, databases/tables/views, and authorization management | Accounts are automatically generated and granted after they are created |
| All users | Ordinary users | PUBLIC | Connect to MatrixOne | After all users are created, they are automatically granted the PUBLIC role |

## Quick Start

- [Quick Start: Create accounts, Verify Resource Isolation](../how-tos/quick-start-create-account.md)
- [Quick start: Create a new account, use the new account, creates users, create roles, and grant the privilege](../how-tos/quick-start-create-user.md)
- Typical [Application Scenarios](app-scenarios.md)
