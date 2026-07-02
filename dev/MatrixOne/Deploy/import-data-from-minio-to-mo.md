# Import data from local Minio to MatrixOne

In a distributed MatrixOne cluster, in addition to importing data locally and from public cloud object storage to MatrixOne, data can be imported through the local Minio component. This method is also feasible to import data to MatrixOne if there is no public network access or the imported file is too large to exceed the local disk space.

This article will guide you on importing CSV files using local Minio. And the environment introduced in this document will be based on [MatrixOne Distributed Cluster Deployment](deploy-MatrixOne-cluster.md); ensure the entire MatrixOne has been installed.

## steps

### Import Data

You can log in to the Minio GUI by visiting <http://192.168.56.10:32001>. For the account and password, refer the rootUser and rootPassword created during the installation and deployment of Minio in [MatrixOne Distributed Cluster Deployment](deploy-MatrixOne-cluster.md). After logging in, you need to create a dedicated bucket `load-from-minio`, and upload the corresponding CSV file into the bucket.

![Create Bucket](https://github.com/matrixorigin/artwork/blob/main/docs/deploy/import/minio-create-bucket.png?raw=true)

The example we use here is a simple `addresses.csv` example containing only 6 rows of data.

![Load From Minio](https://github.com/matrixorigin/artwork/blob/main/docs/deploy/import/load-from-minio.png?raw=true)

### Get Minio's Endpoint

The principle of loading data from local Minio to MatrixOne cluster is the same as [Import the data from S3 Compatible object storage](../Develop/import-data/bulk-load/load-s3.md) are precisely the same, and their grammatical structure is the same. However, the public cloud vendor will give the parameters in the public cloud method, while the parameters in the local Minio need to be set by yourself.

```
LOAD DATA
    | URL s3options {"endpoint"='<string>', "access_key_id"='<string>', "secret_access_key"='<string>', "bucket"='<string>', "role_arn"='xxxx', "external_id"='yyy', "filepath"='<string>', "region"='<string>', "compression"='<string>', "provider"='<string>'}
    INTO TABLE tbl_name
    [{FIELDS | COLUMNS}
        [TERMINATED BY 'string']
        [[OPTIONALLY] ENCLOSED BY 'char']
        [ESCAPED BY 'char']
    ]
    [IGNORE number {LINES | ROWS}]
    [PARALLEL {'TRUE' | 'FALSE'}]
```

To load data from the local Minio, you first need to find the Minio endpoint. Before the actual operation, let's understand the architecture of the entire call link.

#### Minio Access Architecture

Logically speaking, MatrixOne communicates with Minio through Minio's access port endpoint and obtains data from it, as shown in the following figure:

![](https://github.com/matrixorigin/artwork/blob/main/docs/deploy/import/minio-logical-call.png?raw=true)

Minio is managed in Kubernetes (K8s), and external services must be accessed through the Service (SVC) of K8s. The actual execution of tasks is done in K8s Pods. SVC can ensure that the same port is always maintained for external applications no matter how the Pod changes. The association between SVC and Pod needs to establish rules through the Endpoint (EP) in K8s. Therefore, MatrixOne is connected to the Minio service through SVC and the specific architecture is shown in the following figure:

![](https://github.com/matrixorigin/artwork/blob/main/docs/deploy/import/minio-real-call.png?raw=true)

#### Actual command

When we installed Minio, we created a namespace named mostorage. We can find this endpoint through the following K8s commands.

- `kubectl get svc -n ${ns}`: List all SVCs under this namespace.
- `kubectl get pod -n${ns}`: List all Pods under this namespace.
- `kubectl get ep -n ${ns}`: List all forwarding rule relationships under this namespace.

Examples are as follows:

```
root@VM-32-16-debian:~# ns="mostorage"
root@VM-32-16-debian:~# kubectl get svc -n${ns}
NAME             TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)          AGE
minio            ClusterIP   10.96.1.65   <none>        80/TCP           127d
minio1-console   NodePort    10.96.3.53   <none>        9090:30869/TCP   127d
minio1-hl        ClusterIP   None         <none>        9000/TCP         127d
root@VM-32-16-debian:~# kubectl get pod -n${ns}
kubectl get ep -n${ns}NAME            READY   STATUS    RESTARTS   AGE
minio1-ss-0-0   1/1     Running   0          106d
minio1-ss-0-1   1/1     Running   0          106d
minio1-ss-0-2   1/1     Running   0          106d
minio1-ss-0-3   1/1     Running   0          106d
root@VM-32-16-debian:~# kubectl get ep -n${ns}
NAME             ENDPOINTS                                                                 AGE
minio            100.92.250.195:9000,100.92.250.200:9000,100.92.250.201:9000 + 1 more...   127d
minio1-console   100.92.250.195:9090,100.92.250.200:9090,100.92.250.201:9090 + 1 more...   127d
minio1-hl        100.92.250.195:9000,100.92.250.200:9000,100.92.250.201:9000 + 1 more...   127d
```

The access address of SVC is the terminal address that needs to be added to the `Load` statement. To construct the SVC address, you can use `${service_name}.{namespace}.svc.cluster.local` (the last three digits can be omitted). The results of the following commands show that the SVC of minio1-hl uses 9000 as the external forwarding port, and the SVC of minio uses 80 as the external forwarding port. Therefore, the final endpoint of Minio connected to Mostorage is: <http://minio1-hl.mostorage:9000> or <http://minio.mostorage:80>.

### Build and execute the Load statement

1. Build the corresponding table according to the data structure of `addresses.csv`:

    ```
    create table address (firstname varchar(50), lastname varchar(50), address varchar(500), city varchar(20), state varchar(10), postcode varchar(20));
    ```

2. Referring to the syntax structure of Load S3, fill in the parameter information in the `Load` statement:

    - endpoint, access_key_id: the login account of minio
    - secret_access_key: the login password of minio)
    - bucket: the name of the bucket
    - filepath: the path to the imported file

    It should be noted that from the local Minio, a `"provider"="minio"` needs to be added to the parameter string to indicate that the underlying storage source is the local Minio, and finally form the following SQL statement.

    ```
    MySQL [stock]> load data url s3option{"endpoint"='http://minio.mostorage:80',"access_key_id"='rootuser', "secret_access_key"='rootpass123',"bucket"='load-from-minio', "filepath"='/addresses.csv', "compression"='none', "provider"="minio"} INTO TABLE address FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY '\n' PARALLEL 'TRUE';
    Query OK, 6 rows affected (2.302 sec)
    ```

!!! note
    "provider"="minio" is only valid in the local Minio environment. If you import data from the object storage of the public cloud, you don't need to add this parameter.
