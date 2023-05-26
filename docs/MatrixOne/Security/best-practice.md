# Best Practices

The following are typical roles and recommended minimum permissions in MatrixOne for you to reference.

## **Engineer responsible for database resource (user, role, permission) management**

**Database Administrator**

+ Main job functions: manage all configuration information in the tenant, user permissions, backup and recovery, performance tuning, troubleshooting
+ Reference grant role: the default administrator role accountadmin generated when creating a tenant.
+ Refer to granting permissions: user management (`CREATE USER`, `ALTER USER`, `DROP USER`), authority management (`MANAGE GRANTS`)

## **Engineer responsible for data management**

**Data Operation and Maintenance Engineer**

+ Main job function: manage all data and metadata information in the tenant, and authorize data permissions
+ Refer to Granting Permissions: Tenant-Level Data Management (`ALL ON ACCOUNT`)

**App Developer**

+ Main job function: operate specific databases under the development environment tenant, and have read-only permission from the system tenant
+ Refer to grant permissions: database level data management (`ALL ON DATABASE`), system database read-only (`SELECT ON DATABASE`)

**Application System Management Engineer**

+ Main job function: operate specific databases under the production environment tenant
+ Refer to Granting Permissions: Data Management at the Database Level (`ALL ON DATABASE`)

**System Monitoring Engineer**

+ Main job function: monitor all system statistics and error messages under the tenant
+ Refer to grant permissions: read-only permissions for all system databases (`SELECT ON DATABASE`)
