# mo_ctl Distributed Edition Tool Guide

`mo_ctl` Distributed Edition is a command-line tool for business users that assists them in deploying MatrixOne distributed clusters, installing related components, and ultimately providing MatrixOne services to users

!!! note
    mo_ctl Distributed Edition is an efficient database cluster management tool designed for enterprise users. To get a download path for the tool, contact your MatrixOne account manager.

## Overview of features

`mo_ctl` has now been adapted to the operating system as shown in the following table:

| Operating System | Version |
| ------------- | ----------|
| Debian        | 11 及以上    |
| Ubuntu        | 20.04 及以上 |
| UOS           | 20.0.0     |
| Open  EulerOS | 20.3.0     |

`mo_ctl`'s current list of features is shown in the following table:

| Command | Features |
| ------------------ | -------------------------- |
| `mo_ctl help`   | See a list of statements and functions for the `mo_ctl` tool itself.  |
| `mo_ctl precheck` | Check the dependencies needed to install the cluster, e.g. CPU, memory, etc.   |
| `mo_ctl install` | Create the cluster, install the appropriate plug-ins, and initialize the matrixone cluster according to the configuration file. |
| `mo_ctl registry` | Operate on highly available mirror repositories created in the cluster, e.g., add, delete, change, and check mirrors. |
| `mo_ctl node` | Manage nodes in the cluster, add nodes, delete nodes, etc. |
| `mo_ctl matrixone` | Manages matrixone clusters in a cluster, creating, starting, stopping, and deleting them. |
| `mo_ctl s3` | Manage distributed minio in the cluster, check status, expand capacity, and more. |
| `mo_ctl backup` | Perform backups and restores of matrixone clusters in the cluster. |
| `mo_ctl destroy` | Destroy the matrixone service and wipe the cluster. |

## Get started quickly

1. Use the command `mo_ctl help` to view the tool guide.

2. Use the command `mo_ctl precheck` to see if the predependencies are met.

    ```
    mo_ctl precheck --config xxx.yaml 
    ```

3. Deploy the MatrixOne cluster with the command `mo_ctl install`:

    ```
    mo_ctl install --config xxx.yaml 
    ```

4. Use the command `mo_ctl matrixone list` to check the status of MatrixOne.

    ```
    mo_ctl matrixone list --type cluster 
    ```

## Reference Command Guide

### help

Use `mo_ctl help` to print the reference guide.

```
./mo_ctl help
Install, destroy, and operation matrixone cluster

Usage:
  mo_ctl [command]

Available Commands:
  backup      backup matrixone cluster
  completion  Generate the autocompletion script for the specified shell
  destroy     destroy k8s cluster and apps on it
  help        Help about any command
  install     Install k8s, matrixone, minio, and other apps
  matrixone   matrixone operation cmd
  precheck    precheck cluster machine environment before install
  registry    registry operations

Flags:
      --config string       Specify the mo_ctl config file
  -d, --debug               turn on debug mode
  -h, --help                help for mo_ctl
      --kubeconfig string   Path to the kubeconfig file to use (default "/root/.kube/config")
      --logfile string      Specify the log file

Use "mo_ctl [command] --help" for more information about a command.
```

### precheck

Use `mo_ctl precheck` to precheck whether the hardware and software environments are suitable for installing MatrixOne.

```
./mo_ctl precheck --help
precheck cluster machine environment before install

Usage:
  mo_ctl precheck [flags]

Flags:
  -h, --help   help for precheck
```

### install

Use `mo_ctl install` to install k8s, matrixone, minio, and other applications on your computer (machine or virtual machine). You will need to contact your account manager for the download path to the mirror package before executing this command.

- clusterimage.tar: for those who need to use `mo_ctl` to create a cluster and install related components with the base k8s component and the corresponding app component for matrixone
- moappdistro.tar: for existing k8s clusters, requires component management using `mo_ctl` with matrixone and corresponding components

```
./mo_ctl install --help
Install k8s, matrixone, minio, and other apps

Usage:
  mo_ctl install [flags]

Flags:
      --app       only install k8s app
      --dry-run   dry run
  -h, --help      help for install
```

### destory

Use `mo_ctl destroy` to destroy the k8s cluster and the applications on it.

```
./mo_ctl destroy --help
destroy k8s cluster and apps on it

Usage:
  mo_ctl destroy [flags]

Flags:
      --configmap   get clusterfile from k8s configmap
      --dry-run     dry run
      --force       force destroy, no notice
  -h, --help        help for destroy
```

### register

Use `mo_ctl register` to manipulate the highly available mirror repository created in the cluster, for example: add, delete, and lookup mirrors.

```
 mo_ctl registry --help
Usage:
  mo_ctl registry [flags]
  mo_ctl registry [command]

Aliases:
  registry, reg

Available Commands:
  delete      delete (image)
  list        list (image | chart)
  push        push (image | chart)

Flags:
  -h, --help          help for registry
      --type string   registry type (image | chart) (default "image")
```

### backup

 Use `mo_ctl backup` to backup, restore, and more to a matrixone cluster in a cluster

```
 ./mo_ctl backup --help
backup matrixone cluster

Usage:
  mo_ctl backup [flags]
  mo_ctl backup [command]

Available Commands:
  list        list matrixone cluster backup revison
  restore     restore backup matrixone cluster
  start       start backup matrixone cluster

Flags:
  -h, --help   help for backup
```

- **start**
  
    1. First you need to prepare a yaml file that describes the backup job, where the generated yaml name is preset as backup.yaml.

        ```
        apiVersion: core.matrixorigin.io/v1alpha1
        kind: BackupJob
        metadata:
        # Specify the name of the job here
        name: backupjob
        # This specifies the namespace to which the job belongs
        # 注意:此处要与需要备份的 mo 集群处于同一个 namespace
        namespace: mocluster1
        spec:
        source:
            # The name of the mo cluster, available via the mo_ctl matrixone list command.
            clusterRef: mocluster-mocluster1
        # Configure the backup storage location, either object storage or local path storage. For details, refer to https://github.com/matrixorigin/matrixone-operator/blob/main/docs/reference/api-reference.md#backupjob
        target:
            s3:
            type: minio
            endpoint: http://minio.s3-minio-tenant-test1
            path: mo-test/backup-01
            secretRef:
                name: minio
        ```

    2. Create a backup job for the backup operation with the following command

        ```
        # An exit code of 0 proves that the backup job was created successfully
        sudo ./mo_ctl backup start --values backup.yaml 
        ```

    3. After successful creation, you can wait for the backup to complete with the following command

        ```
        # The backupjob here is the name defined in step one
        sudo kubectl wait --for=condition=ended backupjob --all -A --timeout=5m 
        ```

- **restore**
  
    1. Gets the name (ID) of the backup job, which can be obtained by

        ```
        sudo ./mo_ctl backup list 
        ```

    2. First you need to prepare a yaml file that describes the restore job, where the generated yaml name is preset as restore.yaml.

        ```
        # In addition to restoreFrom, other fields can be found at https://github.com/matrixorigin/matrixone-operator/blob/main/docs/reference/api-reference.md#matrixonecluster
        apiVersion: core.matrixorigin.io/v1alpha1
        kind: MatrixOneCluster
        metadata:
        name: morestore
        namespace: mocluster1
        spec:
        # Here you need to fill in the name of the backup job you got in step 1
        restoreFrom: #BackupName
        # Here you need to fill in the actual mirror repository information
        imageRepository: sea.hub:5000/matrixorigin/matrixone
        version: 1.1.0
        logService:
        replicas: 1
        sharedStorage:
            # Here you need to fill in the actual object storage information
            s3:
            type: minio
            path: mo-test/backup-01
            endpoint: http://minio.s3-minio-tenant-test1
            secretRef:
                name: minio
        volume:
            size: 10Gi
        tn:
        replicas: 1
        cacheVolume:
            size: 10Gi
        cnGroups:
        - name: tp
        replicas: 1
        cacheVolume:
        size: 10Gi
        ```

    3. Perform backup restore commands  

        ```
        sudo ./mo_ctl backup restore --values restore.yaml 
        ```

### matrixone

Use `mo_ctl matrixone` to manage matrixone clusters in a cluster, create, start, stop, delete, and more

```
./mo_ctl matrixone --help
Used for matrixone operation cmd

Usage:
  mo_ctl matrixone [flags]
  mo_ctl matrixone [command]

Aliases:
  matrixone, mo

Available Commands:
  history     history all matrixone (cluster | operator)
  list        list matrixone (cluster | operator)
  remove      remove matrixone (cluster)
  rollback    rollback depoly of matrixone (cluster | operator)
  setup       setup matrixone (cluster)
  start       start matrixone (cluster)
  stop        stop matrixone (cluster)
  upgrade     upgrade matrixone (cluster | operator)

Flags:
      --dry-run       dry run
  -h, --help          help for matrixone
      --name string   Specify matrixorigin cluster name
      --type string   Specify a type (cluster | operator) (default "cluster")
```
