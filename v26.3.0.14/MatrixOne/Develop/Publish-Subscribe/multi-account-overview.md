# Multi-Account Overview

Unlike MySQL, MatrixOne is a database with built-in multi-tenancy capability. In a MatrixOne cluster, accounts can be created using the `CREATE ACCOUNT` command. Conceptually, each tenant represents a completely independent data space, with all data and operations being isolated from other accounts. When users log in with the tenant's username and password, they enter a MySQL instance where they can perform various operations such as creating databases and tables without affecting the data of other accounts.

## Introduction to accounts

The `Account` in MatrixOne is part of the permission management system. For more information on the permission management system, see [Privilege Management Overview](../../Security/role-priviledge-management/about-privilege-management.md) section.

Multi-tenancy has various use cases, including multi-tenancy design in SaaS applications, isolating accounts for subsidiaries of a corporation, and database usage for services in a microservices architecture. For more information on application scenarios, see [Multi-Account](../../Overview/feature/key-feature-multi-accounts.md) section in the MatrixOne Feature Overview.

## Creating and Using Accounts

1. For developers, creating and using accounts in MatrixOne can be done through SQL statements. For more examples, see [Create accounts, Verify Resource Isolation](../../Security/how-tos/quick-start-create-account.md) section.
2. For operations personnel working with distributed versions of MatrixOne, it is necessary to configure resource isolation and scaling for accounts, for more information on practical guidelines, see [Managing CN Groups with Proxy](../../Deploy/mgmt-cn-group-using-proxy.md) and [Scaling MatrixOne Cluster](../../Deploy/MatrixOne-cluster-Scale.md).

## Account-to-Account Publish/Subscribe

In addition to ensuring data and load isolation between accounts, MatrixOne provides a publish/subscribe capability that allows data exchange between accounts. This capability can be used to address data synchronization and large-scale data distribution scenarios. For more information, see [Publish-subscribe](pub-sub-overview.md) section.
