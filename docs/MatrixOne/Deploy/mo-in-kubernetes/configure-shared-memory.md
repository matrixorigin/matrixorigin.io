# Configure shared memory for MatrixOne

In a MatrixOne cluster, it is necessary to configure external shared memory to ensure that each node in a distributed environment can use the same storage for database operations. This document describes configuring different types of shared memory for a MatrixOne cluster on Kubernetes. The currently configured storage services that MatrixOne can support are AWS S3, MinIO, and NFS.

## Before you start

- Refer to [Using MatrixOne Operator to Deploy a MatrixOne Cluster](get-started.md) to deploy the Kubernetes cluster.
- According to your business demand and deployment and installation environment, apply for the storage space required by object storage.

## Configure shared memory

### Overview

The shared memory used by the cluster is configured via the [`.spec.logset.sharedStorage`](https://github.com/matrixorigin/matrixone-operator/blob/main/docs/reference/api-reference.md#sharedstorageprovider) field of the `MatrixOneCluster` object.  This field cannot be modified after the cluster is created.

### Configuration Steps

You can choose one of AWS S3, MinIO, or NFS to configure MatrixOne's shared memory according to your environment.

#### Option 1: Configure AWS S3

If you are using the AWS public cloud, it is recommended to configure AWS S3 as the shared memory of the MatrixOne cluster. The configuration steps are as follows:

1. Use an existing S3 bucket or refer to the [Create Bucket](https://docs.aws.amazon.com/zh_cn/AmazonS3/latest/userguide/create-bucket-overview.html) official document to create a new S3 bucket.

2. Refer to the [Managing Access Keys for IAM Users](https://docs.aws.amazon.com/zh_cn/IAM/latest/UserGuide/id_credentials_access-keys.html) official document to create a set of access keys.

3. Create a k8s `Secret` in the target `Namespace`, including the access key generated in the second step, which authorizes the MatrixOne cluster to access the corresponding S3 bucket. The code example is as follows:

    ```
    kubectl -n <YOUR_NAMESPACE> create secret generic aws --from-literal=AWS_ACCESS_KEY_ID=<YOUR_AWS_ACCESS_KEY_ID> --from-literal=AWS_SECRET_ACCESS_KEY=<YOUR_AWS_SECRET_ACCESS_KEY>
    ```

4. Modify the *YAML* definition of the cluster, and configure the `sharedStorage` field by the following commands. You can use `path` to specify the specific path where the cluster stores data in the target S3 bucket. If only the first-level directory (ie `${bucketName}`) is configured, the data will be stored in the root directory of the target bucket:

    ```
    pec:
      logService:
        sharedStorage:
          s3:
            path: ${bucketName}/${path}
            # bucket 所在的 region
            region: us-west-2
            secretRef:
              name: aws
    ```

5. Create a MatrixOne cluster and verify that the cluster starts correctly. For the steps to create a MatrixOne cluster, please refer to [Using MatrixOne Operator to Deploy a MatrixOne Cluster](get-started.md).

**Configure other authentication**

The above example uses a static access key to grant the MatrixOne cluster access to the target S3 bucket. Kubernetes can also be based on [IAM roles for service accounts](https://docs.aws.amazon.com/zh_cn/eks/latest/userguide/iam-roles-for-service-accounts.html) provided by AWS. The mechanism authorizes the MatrixOne cluster, which avoids storing static key files in the system and enhances security. The configuration process is as follows:

1. Refer to [AWS Official Document](https://docs.aws.amazon.com/zh_cn/eks/latest/userguide/associate-service-account-role.html), create a k8s `ServiceAccount associated with AWS Role `, and permit the corresponding AWS Role to access the target S3 bucket.

2. Configure the MatrixOne cluster to use the `ServiceAccount` created in the first step through the `.spec.serviceAccountName` field, and delete the `secretRef` configuration of s3. The code example is as follows:

    ```
    pec:
    ogService:
        sharedStorage:
          s3:
            path: ${bucketName}/${path}
      serviceAccountName: ${serviceAccountName}
    ```

#### Option 2: Using MinIO

1. Refer to the official MinIO documentation, [Installing MinIO Storage](https://min.io/docs/minio/linux/index.html) in a Linux environment.
2. Log into [MinIO Console](https://min.io/docs/minio/linux/administration/minio-console.html) to create a new bucket on MinIO.
3. Refer to the [MinIO User Manager](https://min.io/docs/minio/linux/administration/identity-access-management/minio-user-management.html) official document to create an access password with sufficient permissions key.

4. Create a k8s `Secret` in the target `Namespace`, including the access key generated in the step 2, to authorize the MatrixOne cluster to access the corresponding MinIO storage bucket:

    ```
    kubectl -n <YOUR_NAMESPACE> create secret generic minio --from-literal=AWS_ACCESS_KEY_ID=<YOUR_MINIO_ACCESS_KEY_ID> --from-literal=AWS_SECRET_ACCESS_KEY=<YOUR_MINIO_SECRET_ACCESS_KEY>
    ```

5. Modify the *YAML* definition of the cluster, and configure the `sharedStorage` field by the following commands. You can use `path` to specify the specific path where the cluster stores data in the target bucket. If only the first-level directory (ie `${bucketName}`) is configured, the data will be stored in the root directory of the target bucket:

    ```
    pec:
      logSere:
        sharedStorage:
          s3:
            type: minio
            path: ${bucketName}/${path}
            endpoint: ${minioURL}
            secretRef:
              name: minio
    ```

#### Option 3: Using NFS

Coming soon...

## Configure shared memory Cache

To improve performance, `matrixone-operator` will automatically configure shared memory `cache` for MatrixOne. The rules are as follows:

- If the component does not have a memory resource request (`.esources.requests.memory`), then the cache will not be enabled by default.
- If the component is configured with a memory resource application, it will default start the memory-based shared memory cache. The cache size is 50% of the memory resource application.
- You can always explicitly enable memory cache and directly specify the cache size by setting `.spec.cn.shreStorageCache.memoryCacheSize` and `.spec.dn.sharedStorageCache.memoryCacheSize`, the setting example is as follows:

```
pec:
  dn:
    replica 1
+ sharedStorageCache:
+ emoryCacheSize: 1Gi
```

!!! note
    A huge memory cache will cause Pod out of memory.
