# Configuring Proxy for implementing SQL distribution

This document will guide you through configuring a Proxy to implement SQL distribution quickly.

After configuring Proxy, you don't need to consider the cluster architecture and the number of nodes. As a component of MatrixOne, Proxy is responsible for load balancing and SQL request distribution when calculating large amounts of data to realize the session-level SQL routing function and adapt to various scenarios.

## steps

### Local configuration

The local configuration configures and starts the Proxy service on the local environment.

All *cn.toml* configuration files in MatrixOne's local file directory *etc/launch-with-proxy* have been configured with the following parameters:

    ```
    [cn.frontend]
    proxy-enabled = true
    ```

__Note:__ MatrixOne has configured this parameter by default; you only need to start the Proxy process when starting MatrixOne; the operation is as follows:

- If all services are in the same process, you need to add the `-with-proxy` parameter when starting MatrixOne; the startup command is as follows:

   ```
   ./mo-service -launch ./etc/launch-with-proxy/launch.toml -with-proxy
   ```

- If you start each service in the cluster separately, you can directly specify the configuration file to start the Proxy process:

   ```
   ./mo-service -config ./etc/launch-with-proxy/proxy.toml
   ```
