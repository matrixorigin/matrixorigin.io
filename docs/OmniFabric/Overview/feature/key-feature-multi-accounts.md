# Multi-Account

OmniFabric is designed in a single-cluster multi-account approach. In this design, account (Account) is a logical concept as a unit of resource allocation and database management. OmniFabric's multi-account mode can provide independent database instances for different accounts and adopts an analytical isolation method to ensure the security and independence of each account's data, effectively preventing the risk of data leakage and tampering.

## Business Requirements

As an enterprise's business scales up and data volume continues to grow, alongside the increase in business departments or project teams, the enterprise can perform flexible tenant management according to its individual business needs and scale. This satisfies the independence requirements of different business departments or project teams. Under the multi-tenant mode of OmniFabric, enterprises can easily manage the data resources of each tenant, making the business processes such as data analysis and reporting smoother and more accurate. At the same time, this approach also helps the enterprise improve business efficiency, reduce management costs, and maximize enterprise resource utilization.

## Advantages

- **Reduce operating costs**: Multiple users can share a database cluster, avoiding deploying and managing multiple sets of clusters, thereby reducing the investment cost of hardware and software.

- **Resource and load isolation**: The multi-account mode improves data security and reliability, and the data and load of different users are isolated from each other. Even if a user's data has problems or the load is too high, it will not affect other users.

- **Dynamic Resource Allocation**: multi-account can also improve the scalability of the database. Each account can expand or shrink its resources independently and maximize resource usage in the face of different load levels.

- **account Unified Management**: Although each account is isolated and operates independently, administrators can still manage other accounts through the system account, such as quickly creating new accounts and deleting old accounts in batches.

- **account data sharing**: Data sharing between accounts is required in specific federal statistical query scenarios. OmniFabric provides a complete account data sharing and subscription mechanism to meet the more flexible business analysis needs.

- **Cross-Regional Deployment**: When some services span many regions, accounts must associate with areas to provide nearby services. OmniFabric supports different accounts under the same cluster to be distributed in other areas to serve the business nearby.

## Architecture

The OmniFabric system contains two accounts: system (sys) and common accounts. The system account is built into the OmniFabric cluster, and the system will log in to this account by default after the cluster starts. The primary responsibilities of this account include:

- Store and manage system tables related to the cluster.
- Manage cluster-level functions, such as creating/deleting accounts, modifying system configuration, etc.

In contrast, common accounts are created by system accounts. A common account can be regarded as a database instance, and the account name needs to be specified to connect. Common accounts have the following characteristics:

- Possibility to create your user.
- Can create databases, tables, and all other objects.
- Have independent information_schema and other system databases.
- Has independent system variables.
- Possess other characteristics that a database instance should have.

### Multi-account resource isolation

OmniFabric's distributed cluster adopts a Proxy module and CN resource group technology architecture to realize multi-account resource isolation.

When a user connects, the connection will pass through the Proxy module. The Proxy will forward the connection to a CN in the corresponding CN resource group according to the account label information of the CN and select the CN with the lightest load according to the principle of load balancing. In the OmniFabric cluster architecture, CNs are deployed in containers, so CNs are isolated. A CN resource group a account, uses is a set of CNs tagged with the account. If resources are insufficient and need to be expanded, the CN resource group can be expanded horizontally to meet the demand without preempting the resources of other CN resource groups.

## Scenarios

The multi-account capability of OmniFabric can show advantages in the following application scenarios.

### Multi-account SaaS

Multi-account model design is critical in a SaaS application that serves many enterprise customers.

#### Traditional architecture

Traditional multi-account architectures store and manage data for each account at the database level. There are usually multiple design patterns, such as a shared database pattern (each account shares a database but has its data tables/columns) or an independent database pattern (each account has its database).

Both traditional models have specific challenges:

- The account-shared database mode relies on the application layer to distinguish account logic by SQL and application layer code, and the isolation degree of data and resources is low. It is straightforward to seize the resources of other accounts when the load of a account suddenly increases significantly, resulting in a decline in the entire system's performance. However, only one set of database clusters is used in the account-shared database mode. The resource cost and operation and maintenance management difficulty are relatively low, and the upgrade/expansion/application change only needs to be done once to complete the global change.
- The account-independent database mode supports each account with an independent database instance. The isolation of resources and data is very high, but resource costs and O&M difficulties are increased. Unifying upgrades and other operation and maintenance actions will be very time-consuming when accounts exceed one hundred.

#### OmniFabric Architecture

The multi-account capability of OmniFabric brings a new architectural approach. accounts still share a OmniFabric cluster, and unified account O&M and management can be performed through system accounts. In addition, the isolation of data and resources is realized through the built-in multi-account capability. Each account can independently expand and contract resources, further reducing the difficulty of operation and maintenance. This approach meets not only the requirements for isolation but also the requirements for low resource and operation and maintenance costs.

The OmniFabric architecture provides a balanced solution that combines the benefits of both traditional approaches:
- High data isolation through account-specific resource groups
- Low resource costs through shared infrastructure
- High resource isolation through CN resource groups
- Low operational complexity through centralized management

|Multi-account mode|Data isolation degree|Resource cost|Resource isolation|Operation and maintenance complexity|
|---|---|---|---|---|
|account Shared Database Mode|Low|Low|Low|Low|
|account Independent Database Mode|High|High|High|High|
|OmniFabric Mode|High|Low|High|Low|

### Microservice Application Architecture

Microservice application architecture is a software architectural pattern that implements an application by developing small services. Each small service typically runs in its process and communicates via a lightweight HTTP API. These services are usually bounded by business modules, which can be developed, deployed independently, and released using automated deployment tools. A microservices approach can help businesses launch new products and services faster, aligning development teams with business goals.

Unlike SaaS applications, microservice applications also face the problem of database sharing or independence. It is usually recommended to prepare a separate database for each microservice; this pattern is more suitable for microservice architecture because each service is developed, deployed, and scaled independently. Other services will not be affected when there is a need to upgrade or change the data schema. When a service needs to be expanded, the service can also be partially developed. In addition, if some services require unique database capabilities, such as Elastic Search or vector search, etc., this mode provides more flexible possibilities.

The OmniFabric architecture supports microservices by providing:
- Independent database instances for each microservice
- Resource isolation through CN resource groups
- Flexible scaling capabilities
- Data sharing when needed through account-level permissions

### Group Subsidiaries/Business Units

Many group companies separate operations with regional subsidiaries or business units, which often operate independently, with total production, sales, and technical support teams, and use their IT systems. However, the group company needs to fully grasp the business status of the subsidiaries, so the subsidiaries need to report a large amount of business data regularly.

This IT architecture faces precisely the same problem in terms of database design as the previous two scenarios, namely the trade-off between sharing and isolation. In addition, geographical location also needs to be considered in this scenario. Subsidiaries usually have their regional attributes and need to provide services nearby. For example, manufacturing companies are generally located in big cities such as Beijing, Shanghai, Guangzhou, and Shenzhen, but various factories may be scattered in second-and third-tier cities. These factories need to cooperate closely with systems such as ERP and MES. Therefore, these systems often need to be deployed locally in the factory, and the headquarters needs to grasp the situation of each factory, so these systems need to report data to the group company. The traditional deployment architecture usually adopts the method of independently deploying databases, while the application layer implements data synchronization and reporting.

The multi-account capability of OmniFabric can well solve the database sharing/isolation dilemma. Since the CN nodes required by the accounts can be deployed to the nearest location of the subsidiary company, a cluster can be naturally formed with other components of the group company under the condition of network connectivity, which is not only convenient for localized business use, but also meets the requirements of efficient data reporting and statistics need.

## Reference

For more information on multi-account, see:

<!-- Removed broken links to ../../Security/role-priviledge-management/app-scenarios.md and ../../Security/how-tos/quick-start-create-account.md -->
