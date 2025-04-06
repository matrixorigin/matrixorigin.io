# Data Transmission Encryption

This document will introduce MatrixOne's support for data transmission encryption and how to enable encrypted transmission.

## Overview

MatrixOne uses non-encrypted transmission by default and supports encrypted transmission based on TLS protocol. Encrypted transmission can reduce the risk of leakage of sensitive information in the database. Encrypted transmission is the process of encrypting and decrypting information using keys, which can effectively protect data security.

Transport Layer Security (TLS) is a widely adopted security protocol. The protocol versions supported by MatrixOne include TLS 1.0, TLS 1.1, and TLS 1.2.

- Do not enable TLS encrypted transmission (default): Use the username and password to connect to MatrixOne directly.
- Use encrypted transmission: It is necessary to enable encrypted transmission support on the MatrixOne server and specify the use of encrypted transmission on the client side. You can follow the instructions in this article to enable TLS secure connections.

## How to Use

**Main steps of TLS secure connection configuration**:

1. First, enable TLS in MatrixOne.

2. Then, configure the MySQL client security connection parameters.

After completing the configuration of these two main steps, a TLS secure connection can be established.

### Step 1: Enable MatrixOne's TLS support

1. Generate certificate and key: MatrixOne does not yet support loading a private key protected by a password, so a private key file without a password must be provided. Certificates and keys can be issued and generated using OpenSSL. It is recommended to use the tool `mysql_ssl_rsa_setup` that comes with MySQL to generate quickly:

    ```
    #Check your local MySQL client installation directory
    ps -ef|grep mysql
    #Go to the installation directory of your local MySQL client
    cd /usr/local/mysql/bin
    #Generate certificate and key
    ./mysql_ssl_rsa_setup --datadir=<yourpath>
    #Check your generated pem file
    ls <yourpath>
    ├── ca-key.pem
    ├── ca.pem
    ├── client-cert.pem
    ├── client-key.pem
    ├── private_key.pem
    ├── public_key.pem
    ├── server-cert.pem
    └── server-key.pem
    ```

    __Note__:  `<yourpath>` in the above code is the local directory path where you need to store the generated certificate and key files.

2. Enter the *cn.toml* configuration file in your local MatrixOne file directory path *matrixone/etc/launch-tae-CN-tae-TN/*:

    You can also use the vim command to open the cn. toml file directly in the terminal

    ```
    vim $matrixone/etc/launch-tae-CN-tae-TN/cn.toml
    ```

    Copy and paste the code below into the configuration file:

    ```
    [cn.frontend]
    #default is false. With true. Server will support tls
    enableTls = true

    #default is ''. Path of file that contains X509 certificate in PEM format for client
    tlsCertFile = "<yourpath>/server-cert.pem"

    #default is ''. Path of file that contains X509 key in PEM format for client
    tlsKeyFile = "<yourpath>/server-key.pem"

    #default is ''. Path of file that contains list of trusted SSL CAs for client
    tlsCaFile = "<yourpath>/ca.pem"
    ```

    __Note__: `<yourpath>` in the above code is the local directory path where you need to store the generated certificate and key files

    In the above code, the configuration parameters are explained as follows:

    | Parameters  | Description                                                   |
    | ----------- | ------------------------------------------------------------- |
    | enableTls   | Bool, enable TLS support on the MatrixOne server.             |
    | tlsCertFile | Specify the SSL certificate file path                         |
    | tlsKeyFile  | Specify the private key corresponding to the certificate file |
    | tlsCaFile   | Optional, specify the trusted CA certificate file path        |

    __Note__: If you use Docker to install and launch MatrixOne, before modifying the configuration file, you need to mount the configuration file first and then modify it. For more information, see [Mount directory to Docker container](../Maintain/mount-data-by-docker.md).

3. Verify that MatrixOne's SSL is enabled.

    ① Use the MySQL client to connect to MatrixOne:

    ```
    mysql -h 127.0.0.1 -P 6001 -uroot -p111

    Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
    ```

    ② Use the `Status` command to check whether SSL is enabled.

    Successfully enabled, the code example is as follows; you can see that the SSL status is `Cipher in use is TLS_AES_128_GCM_SHA256`:

    ```
    mysql> status
    mysql  Ver 8.0.28 for macos11 on arm64 (MySQL Community Server - GPL)

    Connection id:          1001
    Current database:
    Current user:           root@0.0.0.0
    SSL:                    Cipher in use is TLS_AES_128_GCM_SHA256
    Current pager:          stdout
    Using outfile:          ''
    Using delimiter:        ;
    Server version:         8.0.30-MatrixOne-v2.1.0 MatrixOne
    Protocol version:       10
    Connection:             127.0.0.1 via TCP/IP
    Server characterset:    utf8mb4
    DB     characterset:    utf8mb4
    Client characterset:    utf8mb4
    Conn.  characterset:    utf8mb4
    TCP port:               6001
    Binary data as:         Hexadecimal
    --------------
    ```

    If it is not enabled successfully, the returned result is as follows; you can see that the SSL status is `Not in use`; you need to recheck whether the local directory path (namely <yourpath>) of the certificate and key file you configured in the above steps is correct:

    ```
    mysql> status;
    /usr/local/mysql/bin/mysql  Ver 8.0.30 for macos12 on arm64 (MySQL Community Server - GPL)

    Connection id:		1009
    Current database:	test
    Current user:		root@0.0.0.0
    SSL:			Not in use
    Current pager:		stdout
    Using outfile:		''
    Using delimiter:	;
    Server version:		8.0.30-MatrixOne-v2.1.0 MatrixOne
    Protocol version:	10
    Connection:		127.0.0.1 via TCP/IP
    Server characterset:	utf8mb4
    Db     characterset:	utf8mb4
    Client characterset:	utf8mb4
    Conn.  characterset:	utf8mb4
    TCP port:		6001
    Binary data as:		Hexadecimal
    --------------
    ```

After completing the above steps, MatrixOne's TLS is enabled.

### Step 2: Configure the parameters of MySQL client

When a MySQL client connects to Matrix One Server, the encrypted connection behavior needs to be specified by the `--ssl-mode` parameter, such as:

```sql
mysql -h 127.0.0.1 -P 6001 -uroot -p111 --ssl-mode=PREFFERED
```

!!! info
    The login account in the above code snippet is the initial account; please change the initial password after logging in to MatrixOne; see [Password Management](password-mgmt.md).

The value types of `ssl mode` are as follows:

| `ssl-mode` value | Description                                                                                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DISABLED         | Establish an encrypted connection without SSL/TLS, synonymous with skip-ssl.                                                                                      |
| PREFFERED        | The default behavior is first to establish an encrypted connection using SSL/TLS; if it cannot be established, it will try to establish a non-SSL/TLS connection. |
| REQUIRED         | Only SSL/TLS will be attempted to establish an encrypted connection, and if the connection cannot be established, the connection will fail.                       |
| VERIFY_CA        | As with the REQUIRED behavior, and also verifies that the CA certificate on the Server side is valid.                                                             |
| VERIFY_IDENTITY  | It acts like VERIFY_CA and verifies that the host in the server-side CA certificate is the same as the hostname for the actual connection.                        |

!!! note
    When the client specifies `--ssl-mode=VERIFY_CA`, it needs to use `--ssl-ca` to specify the CA certificate;
    If `--ssl-mode=VERIFY_IDENTITY` is specified on the client, you need to specify the CA certificate. You need to use `--ssl-key` to specify the client private key and `--ssl-cert` to specify the client certificate.
