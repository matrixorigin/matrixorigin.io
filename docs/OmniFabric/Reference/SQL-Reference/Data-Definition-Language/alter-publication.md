# **ALTER PUBLICATION**

## **Syntax description**

`ALTER PUBLICATION` modifies the publication content.

## **Grammar structure**

```
ALTER PUBLICATION pubname
    [ACCOUNT
            { ALL
            | account_name, [, ... ]
            | ADD account_name, [, ... ]
            | DROP account_name, [, ... ]]
    [COMMENT 'string']
    [DATABASE database_name]
    [TAble table_name]
```

## Grammar explanation

-pubname: Existing publication name.

-account_name: The tenant name of the publication can be obtained.

-database_name: The name of the publishing library to be modified.

## **示例**

```sql
create account acc0 admin_name 'root' identified by '111';
create account acc1 admin_name 'root' identified by '111';
create account acc2 admin_name 'root' identified by '111';
create database t;
create publication pub3 database t account acc0,acc1;

alter publication pub3 account add acc2;--Modify release scope
mysql> show create publication pub3;

+-------------+-----------------------------------------------------------+
| Publication | Create Publication                                        |

+-------------+-----------------------------------------------------------+
| pub3        | CREATE PUBLICATION pub3 DATABASE t ACCOUNT acc0,acc1,acc2 |

+-------------+-----------------------------------------------------------+
1 row in set (0.01 sec)

mysql> show publications;

+-------------+----------+--------+----------------+---------------------+---------------------+---------------------+----------+
| publication | database | tables | sub_account    | subscribed_accounts | create_time         | update_time         | comments |

+-------------+----------+--------+----------------+---------------------+---------------------+---------------------+----------+
| pub3        | t        | *      | acc0,acc1,acc2 |                     | 2024-10-28 11:20:20 | 2024-10-28 11:20:43 |          |

+-------------+----------+--------+----------------+---------------------+---------------------+---------------------+----------+
1 row in set (0.00 sec)

alter publication pub3  comment "this is pubs";--Modify release notes
mysql> show publications;

+-------------+----------+--------+----------------+---------------------+---------------------+---------------------+--------------+
| publication | database | tables | sub_account    | subscribed_accounts | create_time         | update_time         | comments     |

+-------------+----------+--------+----------------+---------------------+---------------------+---------------------+--------------+
| pub3        | t        | *      | acc0,acc1,acc2 |                     | 2024-10-28 11:20:20 | 2024-10-28 11:21:28 | this is pubs |

+-------------+----------+--------+----------------+---------------------+---------------------+---------------------+--------------+
1 row in set (0.00 sec)

create database new_pub3;
alter publication pub3 database new_pub3;--Modify publishing database
mysql> show publications;

+-------------+----------+--------+----------------+---------------------+---------------------+---------------------+--------------+
| publication | database | tables | sub_account    | subscribed_accounts | create_time         | update_time         | comments     |

+-------------+----------+--------+----------------+---------------------+---------------------+---------------------+--------------+
| pub3        | new_pub3 | *      | acc0,acc1,acc2 |                     | 2024-10-28 11:20:20 | 2024-10-28 11:21:44 | this is pubs |

+-------------+----------+--------+----------------+---------------------+---------------------+---------------------+--------------+
1 row in set (0.00 sec)
```
