# Detailed Caching and Hot-Cold Data Separation Architecture

Data caching and hot-cold data separation are key features of MatrixOne, where data is classified into hot and cold based on the frequency of use and managed differently. This design allows MatrixOne to maintain excellent performance while keeping operating costs low.

## Technical Architecture

In the overall architecture of MatrixOne, two parts are responsible for persistent data storage. One is the object storage shared by the entire MatrixOne distributed cluster, which is the primary storage device of the cluster. The other is the local storage on each compute node (CN), mainly used for data caching. The primary storage contains all data of the entire cluster, while the cache only saves data extracted from the primary storage during recent queries. In addition, the memory of CN nodes is also used as part of the data cache.

![](https://github.com/matrixorigin/artwork/blob/main/docs/overview/hot-cold-separation/cold-hot-data-separation.png?raw=true)

When a user initiates a query, the system first checks whether the cache of the CN to which the user is connected already contains the required data. If it exists, the system directly returns the result to the user, prioritizing memory over disk. Suppose the required data is not found in the cache of the currently connected CN. In that case, the system queries the global metadata information to see if the required data exists in the cache of other available CNs for this user, checking memory first and then disk. If it exists, the system redirects the request to the CN containing this data, processes it, and returns the result to the user. If the data searched for is not in the cache of any available CN, the system initiates a read request to the object storage and returns the result to the user.

![](https://github.com/matrixorigin/artwork/blob/main/docs/overview/hot-cold-separation/query-order.png?raw=true)

When a user queries data from object storage, the queried data block will be filled into the corresponding position according to the cache query order. For example, if a user queries 100M of data from object storage, this 100M of data will first be written into the memory of the CN node to which the user is connected and then written into the disk cache of this CN node. Each time a new query is generated, the data in the cache will be updated according to this rule. Whether in memory or disk, data replacement in the CN cache follows the LRU (Least Recently Used) principle. With this mechanism, the most recent data is always in the easiest-to-get position, while relatively unpopular data will gradually be removed from the cache.

## Product Features

The features of data caching and hot-cold data separation bring unique advantages to the product. To show more specifically, we will show a simple example.

### Environment Configuration

The environment introduced in this chapter will be based on the environment of [MatrixOne Distributed Cluster Deployment](../../Deploy/deploy-MatrixOne-cluster.md). Please ensure that the entire MatrixOne is installed.

1. Prepare a table named `pe` and the corresponding CSV data. This CSV data table is 35.8MB, with 1,048,575 rows of data. We will use the following SQL statement to create two databases and load the same data table into the `pe` table in both databases.

    ```sql
    create database stock;
    drop table if exists stock.pe;
    create table stock.pe (
    ts_code VARCHAR(255) DEFAULT null,
    trade_date VARCHAR(255) DEFAULT null,
    pe FLOAT DEFAULT null,
    pb FLOAT DEFAULT null
    );
    load data local infile '/XXX/pe.csv' into table stock.pe fields TERMINATED BY '\t';

    create database stock2;
    drop table if exists stock2.pe;
    create table stock2.pe (
    ts_code VARCHAR(255) DEFAULT null,
    trade_date VARCHAR(255) DEFAULT null,
    pe FLOAT DEFAULT null,
    pb FLOAT DEFAULT null
    );
    load data local infile '/XXX/pe.csv' into table stock.pe fields TERMINATED BY '\t';
    ```

2. Next, perform the corresponding cache configuration. In the cluster yaml settings of MatrixOne, TN, Log Service, and CN all have cache-related settings. However, you only need to focus on the CN cache directly related to the query, and the primary cache size is managed by `memoryCacheSize` and `diskCacheSize`.

    ```yaml
    metadata:
      name: mo
      namespace: mo-hn
    spec:
      cnGroups:
      - name: cn-set1
        # Intermediate configuration omitted
        sharedStorageCache: # Core parameters for configuring CN cache
          memoryCacheSize: 250Mi # CN's memory cache, Mi stands for MB
          diskCacheSize: 1Gi # CN's disk cache, Gi stands for GB
    ```

When both parameters are set to "1", the cache is turned off, and all query requests from MatrixOne will interact directly with the underlying object storage, significantly reducing the efficiency of queries.

To simplify the display, you can first turn off the memory cache here and only set a specific size of the disk cache. Since the original data will be compressed to a particular ratio according to the data type after being stored, you need to set the disk cache to 20MB first, which is enough to store the compressed 35.8MB data file.

```yaml
metadata:
  name: mo
  namespace: mo-hn
spec:
  cnGroups:
  - name: cn-set1
## Omitted intermediate configuration
    sharedStorageCache: # Core parameters for configuring CN cache
      memoryCacheSize: "1" # CN's memory cache, Mi stands for MB
      diskCacheSize: 20Mi # CN's disk cache, Gi stands for GB
```

### Query Acceleration

After completing the above settings and starting the MatrixOne cluster, you can experience the effect of cache acceleration through the results of multiple queries. Here, you can run a full table scan of `stock.pe` multiple times in a row.

```sql
mysql> select * from stock.pe into outfile "test01.txt";
Empty set (6.53 sec)

mysql> select * from stock.pe into outfile "test02.txt";
Empty set (4.01 sec)

mysql> select * from stock.pe into outfile "test03.txt";
Empty set (3.84 sec)

mysql> select * from stock.pe into outfile "test04.txt";
Empty set (3.96 sec)
```

The above results show that the first query is noticeably slower because it needs to fetch data from object storage. However, since the data has been cached to the disk in the subsequent three queries, the query speed has significantly improved.

### Cache Replacement

Next, you can alternate and run a full table scan of `stock.pe` and `stock2.pe` multiple times.

```sql
mysql> select * from stock2.pe into outfile "test05.txt";
Empty set (5.84 sec)

mysql> select * from stock2.pe into outfile "test06.txt";
Empty set (4.27 sec)

mysql> select * from stock2.pe into outfile "test07.txt";
Empty set (4.15 sec)

mysql> select * from stock.pe into outfile "test08.txt";
Empty set (6.37 sec)

mysql> select * from stock.pe into outfile "test09.txt";
Empty set (4.14 sec)

mysql> select * from stock.pe into outfile "test10.txt";
Empty set (3.81 sec)
```

You might notice that each time the data table for the query is switched, the query efficiency significantly decreases. This is due to the cache replacement mechanism. You only set a small cache, which is just enough to store the complete data of a table. Therefore, when you alternate queries, the old cache data is replaced. The new query needs to fetch data from the object storage, and when queried again, since the data has been cached, the query speed is improved.

### Query Preheating

In many business scenarios, we often need to accelerate the queries due to a large amount of data or complex queries. The cache mechanism of MatrixOne can accelerate queries by preheating the data.

For example, the following SQL query:

```sql
SELECT pe1.ts_code, pe1.pe, pe1.pb
FROM stock2.pe as pe1
WHERE pe1.pe = (SELECT min(pe2.pe)
FROM stock2.pe as pe2
WHERE pe1.ts_code = pe2.ts_code)
ORDER BY trade_date
DESC LIMIT 1;
```

If not optimized, the execution speed is as follows:

```sql
SELECT pe1.ts_code, pe1.pe, pe1.pb
FROM stock2.pe as pe1
WHERE pe1.pe = (SELECT min(pe2.pe)
FROM stock2.pe as pe2
WHERE pe1.ts_code = pe2.ts_code)
ORDER BY trade_date
DESC LIMIT

1;
+-----------+------+--------+
| ts_code   | pe   | pb     |
+-----------+------+--------+
| 000038.SZ |    0 | 1.2322 |
+-----------+------+--------+
1 row in set (5.21 sec)
```

This SQL query only involves the query of the `stock2.pe` table. We can preheat the table data to the cache by pre-scanning the complete table data, so the query can significantly improve the speed of this SQL query.

```sql
mysql> select * from stock2.pe into outfile "test11.txt";
Empty set (6.48 sec)

mysql> SELECT pe1.ts_code, pe1.pe, pe1.pb FROM stock2.pe as pe1 WHERE pe1.pe = (SELECT min(pe2.pe) FROM stock2.pe as pe2 WHERE pe1.ts_code = pe2.ts_code) ORDER BY trade_date DESC LIMIT 1;
+-----------+------+---------+
| ts_code   | pe   | pb      |
+-----------+------+---------+
| 000068.SZ |    0 | 14.6959 |
+-----------+------+---------+
1 row in set (2.21 sec)
```

This feature is particularly suitable for some fixed report calculation scenarios. Users can preheat the data involved in the query and then perform the query, which can significantly improve the query effect.
