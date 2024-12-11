# Connection whitelist

MatrixOne supports the following variables for restricting only clients with specific IP addresses from connecting to the database:

1. **`validnode_checking`**: Control whether to enable the IP whitelist function. The value range of this variable is `ON` or `OFF`, and the default value is `OFF`.  

2. **`invited_nodes`**: Define the list of IP addresses allowed to connect to the MO database. The following formats are supported:
      - **Single IP address**: e.g. `(192.168.1.100, 192.168.1.101)`
      - **Wildcard**: `(*)` means allow all IP addresses to connect
      - **CIDR format**: For example `(192.168.1.100, 192.168.1.0/8, 192.168.0.0/32)`

      The default value of this variable is `*`, which means that all clients can connect by default.  

The above configuration provides a flexible access control mechanism for the database to meet a variety of network security needs.

## Check

```sql
select @@global.validnode_checking;
select @@global.invited_nodes;
```

## set up

```sql
set global validnode_checking=xx;--Default is 0
set global invited_nodes=xx; --Default is *
```

## Example

```sql
mysql> select @@global.validnode_checking;
+----------------------+
| @@validnode_checking |
+----------------------+
| 0                    |
+----------------------+
1 row in set (0.00 sec)

mysql> select @@global.invited_nodes;
+-----------------+
| @@invited_nodes |
+-----------------+
| *               |
+-----------------+
1 row in set (0.00 sec)

mysql> set global validnode_checking=1;
Query OK, 0 rows affected (0.02 sec)
set global invited_nodes='10.222.2.36';

--View IP
root@host-10-222-4-5:~# hostname -I
10.222.4.5 

--Connect to 10.222.2.36 from the machine with ip 10.222.4.5
root@host-10-222-4-5:~# mysql -uroot -P 6001 -h10.222.2.36 -p111
mysql: [Warning] Using a password on the command line interface can be insecure.
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 62
Server version: 8.0.30-MatrixOne-v MatrixOne

Copyright (c) 2000, 2018, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> 


--View IP
root@host-10-222-4-8:~# hostname -I
10.222.4.8 

--Connect to 10.222.2.36 from the machine with IP address 10.222.4.8. The connection fails because it is not in the whitelist.
root@host-10-222-4-8:~# mysql -uroot -P 6001 -h10.222.2.36 -p111
mysql: [Warning] Using a password on the command line interface can be insecure.
ERROR 20301 (HY000): invalid input: IP 10.222.4.8 is not in the invited nodes
```
