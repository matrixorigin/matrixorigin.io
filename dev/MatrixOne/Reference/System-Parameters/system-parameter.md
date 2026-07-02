# System Parameters Overview

In MatrixOne, various database system parameters are involved, some configured through configuration files and take effect only during startup. Such parameters are referred to as **static parameters**.

Another type is parameters that can be dynamically configured on the client and take effect immediately. These are referred to as **dynamic parameters**. Both parameters are used to configure and control the behavior of the MatrixOne server.

Dynamic parameter modifications can be done at the session and global levels.

- **Global Level Parameter Configuration:** Pertains to parameter configuration for the current tenant in MatrixOne. These parameters affect all new sessions connected to this tenant. Global parameters are persistently stored in the metadata table `mo_catalog.mo_mysql_compatbility_mode` when the MatrixOne server starts, and changes to global parameters will take effect on the next login.

- **Session Level Parameter Configuration:** Pertains to parameter configuration for an individual MatrixOne connection. These parameters only affect the behavior of that connection. When the connection is established, session parameters are read from `mo_catalog.mo_mysql_compatbility_mode` and can be configured for the current connection using client commands. The session parameter configuration will be reset to the default values when the connection is closed.

It's worth noting that MatrixOne is a multi-tenant database, and the `set global` command will only affect the current tenant.

## Reference Documentation

For documentation on static parameters, you can refer to:

- [Standalone Common Parameters Configuration](standalone-configuration-settings.md)
- [Distributed Common Parameters Configuration](distributed-configuration-settings.md)

For documentation on dynamic parameters, you can refer to:

- [System Variables Overview](../Variable/system-variables/system-variables-overview.md)
- [Custom Variables](../Variable/custom-variable.md)
