# mo_ctl Standalone Tools Guide

`mo_ctl` Standalone is a command-line tool that helps you with deployment installation, start-stop control, and database connectivity for Standalone MatrixOne.

## Overview of features

`mo_ctl`'s currently adapted operating systems are shown in the following table:

| Operating System | Version |
| -------- | -------------------- |
| Debian   | 11 and above            |
| Ubuntu   | 20.04 and above         |
| macOS    | Monterey 12.3 and above  |
|OpenCloudOS| v8.0 / v9.0 |
|Open  EulerOS  | 20.03 |
|TencentOS Server | v2.4 / v3.1 |
|UOS  | V20 |
|KylinOS | V10 |
|KylinSEC | v3.0 |

`mo_ctl`'s current list of features is shown in the following table.

| commandS             | clarification                                |
| -------------------- | ---------------------------------|
| `mo_ctl help`        | View a list of statements and functions for the `mo_ctl` tool itself      |
| `mo_ctl precheck`    | Check the dependencies required for MatrixOne source code installation, which are golang, gcc, git, MySQL Client. |
| `mo_ctl deploy`      | Download, install and compile the appropriate version of MatrixOne, the latest stable version is installed by default. |
| `mo_ctl start`       | Starting the MatrixOne Service        |
| `mo_ctl status`      | Check if the MatrixOne service is running          |
| `mo_ctl stop`        | Stop all MatrixOne service processes  |
| `mo_ctl restart`     | Restarting the MatrixOne Service     |
| `mo_ctl connect`     | Calling MySQL Client to Connect to MatrixOne Service    |
| `mo_ctl upgrade`     | Upgrading/downgrading MatrixOne from the current version to a release or commit id version    |
| `mo_ctl set_conf`    | Setting the parameters for each type of use     |
| `mo_ctl get_conf`    | View currently used parameters          |
| `mo_ctl uninstall`   | Uninstall MatrixOne from MO_PATH path      |
| `mo_ctl watchdog`    | Set up a timed task to ensure MatrixOne service availability, checking the status of MatrixOne every minute and automatically pulling up the service if it is found to be aborted |
| `mo_ctl sql`         | Execute SQL or a text file consisting of SQL directly by command.   |
| `mo_ctl ddl_convert` | Tools for Converting MySQL DDL Statements to MatrixOne Statements        |
| `mo_ctl get_cid`     | View the current version of the source code that was downloaded from the repository using MatrixOne     |
| `mo_ctl get_branch`  | View the current branch version of a repository downloaded using MatrixOne   |
| `mo_ctl pprof`       | Used to collect MatrixOne performance analysis data         |

## Install mo_ctl

Depending on whether you have Internet access, you can choose to install the `mo_ctl` tool online or offline. You need to be careful to always execute commands as root or with sudo privileges (and add sudo before each command). Meanwhile, `install.sh` will use the `unzip` command to extract `the mo_ctl` package. Make sure the `unzip` command is installed.

### Install online

```
wget https://raw.githubusercontent.com/matrixorigin/mo_ctl_standalone/main/install.sh && sudo bash +x ./install.sh

# Alternate address
wget https://ghproxy.com/https://github.com/matrixorigin/mo_ctl_standalone/blob/main/install.sh && sudo bash +x install.sh 
```

For users running this command in a macOS environment, if you are a non-root user, run `install.sh` with the following statement:

```
sudo -u $(whoami) bash +x ./install.sh 
```

### Offline installation

```
# 1. Download the installation script to your local computer before uploading it to the installation machine
wget https://raw.githubusercontent.com/matrixorigin/mo_ctl_standalone/main/install.sh 
wget https://github.com/matrixorigin/mo_ctl_standalone/archive/refs/heads/main.zip -O mo_ctl.zip

# If the original github address downloads too slowly, you can try downloading from the following mirror address:
wget https://mirror.ghproxy.com/https://github.com/matrixorigin/mo_ctl_standalone/blob/main/install.sh 
wget https://githubfast.com/matrixorigin/mo_ctl_standalone/archive/refs/heads/main.zip -O mo_ctl.zip

# 2. Install from offline package
bash +x ./install.sh mo_ctl.zip 
```

## Get started quickly

The Deployment Standalone Edition of MatrixOne can be quickly installed by following these steps, and the detailed guide provides a view of the [Standalone Deployment MatrixOne](../Get-Started/install-standalone-matrixone.md).

1. Use the command `mo_ctl help` to view the tool guide.

2. Use the command `mo_ctl precheck` to see if the predependencies are met.

3. Use the command `mo_ctl get_conf` to set the relevant parameters, which may be configured as follows:

    ```
    mo_ctl set_conf MO_PATH="/data/mo/matrixone" #Set custom MatrixOne download path 
    mo_ctl set_conf MO_GIT_URL="https://githubfast.com/matrixorigin/matrixone.git" #Set mirror download address for slow download of github original address
    ```

4. Install and deploy the latest stable version of MatrixOne using the command `mo_ctl deploy`.

5. Start the MatrixOne service with the command `mo_ctl start`.

6. Use the command `mo_ctl connect` to connect to the MatrixOne service.

## Reference Command Guide

### help - Print Reference Guide

```
mo_ctl help
Usage             : mo_ctl [option_1] [option_2]

  [option_1]      : available: connect | ddl_connect | deploy | get_branch | get_cid | get_conf | help | pprof | precheck | query | restart | set_conf | sql | start | status | stop | uninstall | upgrade | watchdog
  1) connect      : connect to mo via mysql client using connection info configured
  2) ddl_convert  : convert ddl file to mo format from other types of database
  3) deploy       : deploy mo onto the path configured
  4) get_branch   : upgrade or downgrade mo from current version to a target commit id or stable version
  5) get_cid      : print mo git commit id from the path configured
  6) get_conf     : get configurations
  7) help         : print help information
  8) pprof        : collect pprof information
  9) precheck     : check pre-requisites for mo_ctl
  10) restart     : a combination operation of stop and start
  11) set_conf    : set configurations
  12) sql         : execute sql from string, or a file or a path containg multiple files
  13) start       : start mo-service from the path configured
  14) status      : check if there's any mo process running on this machine
  15) stop        : stop all mo-service processes found on this machine
  16) uninstall   : uninstall mo from path MO_PATH=/data/mo/20230712_1228//matrixone
  17) upgrade     : upgrade or downgrade mo from current version to a target commit id or stable version
  18) watchdog    : setup a watchdog crontab task for mo-service to keep it alive
  e.g.            : mo_ctl status

  [option_2]      : Use " mo_ctl [option_1] help " to get more info
  e.g.            : mo_ctl deploy help
```

Use `mo_ctl [option_1] help` to get a guide to the next level of `mo_ctl [option_1]` functionality.

### precheck - check for predependencies

Use `mo_ctl precheck` to check for pre-dependencies before installing MatrixOne in source code, which currently depends on `go`/`gcc`/`git`/`mysql (client)`.

```
mo_ctl precheck help
Usage         : mo_ctl precheck # check pre-requisites for mo_ctl
   Check list : go gcc git mysql
```

### deploy - Install MatrixOne

Use `mo_ctl deploy [mo_version] [force]` to install the deployment stable version of MatrixOne, or a specified version. The `force` option allows you to remove an existing version of MatrixOne in the same directory and force a new installation.

```
mo_ctl deploy help
Usage         : mo_ctl deploy [mo_version] [force] # deploy mo onto the path configured
  [mo_version]: optional, specify an mo version to deploy
  [force]     : optional, if specified will delete all content under MO_PATH and deploy from beginning
  e.g.        : mo_ctl deploy             # default, same as mo_ctl deploy 2.1.0
              : mo_ctl deploy main        # deploy development latest version
              : mo_ctl deploy d29764a     # deploy development version d29764a
              : mo_ctl deploy 2.1.0       # deploy stable verson 2.1.0
              : mo_ctl deploy force       # delete all under MO_PATH and deploy verson 2.1.0
              : mo_ctl deploy 2.1.0 force # delete all under MO_PATH and deploy stable verson 2.1.0 from beginning
```

### start - Starts the MatrixOne service

Start the MatrixOne service with `mo_ctl start`, with the startup file path under `MO_PATH`.

```
mo_ctl start help
Usage         : mo_ctl start # start mo-service from the path configured
```

### stop - stop the MatrixOne service

Use `mo_ctl stop [force]` to stop all MatrixOne services on this machine, or all if there are multiple MatrixOne services running.

```
 mo_ctl stop help
Usage         : mo_ctl stop [force] # stop all mo-service processes found on this machine
 [force]      : optional, if specified, will try to kill mo-services with -9 option, so be very carefully
  e.g.        : mo_ctl stop         # default, stop all mo-service processes found on this machine
              : mo_ctl stop force   # stop all mo-services with kill -9 command
```

### restart - restart the MatrixOne service

Use `mo_ctl restart [force]` to stop all MatrixOne services on this machine and restart the MatrixOne service located under the `MO_PATH` path.

```
mo_ctl restart help
Usage         : mo_ctl restart [force] # a combination operation of stop and start
 [force]      : optional, if specified, will try to kill mo-services with -9 option, so be very carefully
  e.g.        : mo_ctl restart         # default, stop all mo-service processes found on this machine and start mo-serivce under path of conf MO_PATH
              : mo_ctl restart force   # stop all mo-services with kill -9 command and start mo-serivce under path of conf MO_PATH
```

### connect - connect to the MatrixOne service via mysql-client

Use `mo_ctl connect` to connect to the MatrixOne service, the connection parameters are set in the `mo_ctl` tool.

```
mo_ctl connect help
Usage         : mo_ctl connect # connect to mo via mysql client using connection info configured
```

### status - Checks the status of MatrixOne

Use `mo_ctl status` to check whether MatrixOne is running or not.

```
mo_ctl status help
Usage         : mo_ctl status # check if there's any mo process running on this machine
```

### get_cid - Print MatrixOne code submission id

Use `mo_ctl get_cid` to print the MatrixOne codebase commit id under the current `MO_PATH` path.

```
mo_ctl get_cid help
Usage         : mo_ctl get_cid # print mo commit id from the path configured
```

### get_branch - print MatrixOne code commit id

Use `mo_ctl get_branch` to print the MatrixOne codebase branch under the current `MO_PATH` path.

```
mo_ctl get_branch help
Usage           : mo_ctl get_branch        # print which git branch mo is currently on
```

### pprof - Collect performance information

Use `mo_ctl pprof [item]` \[duration] to gather performance information about MatrixOne, primarily for debugging use by developers.

```
mo_ctl pprof help
Usage         : mo_ctl pprof [item] [duration] # collect pprof information
  [item]      : optional, specify what pprof to collect, available: profile | heap | allocs
  1) profile  : default, collect profile pprof for 30 seconds
  2) heap     : collect heap pprof at current moment
  3) allocs   : collect allocs pprof at current moment
  [duration]  : optional, only valid when [item]=profile, specifiy duration to collect profile
  e.g.        : mo_ctl pprof
              : mo_ctl pprof profile    # collect duration will use conf value PPROF_PROFILE_DURATION from conf file or 30 if it's not set
              : mo_ctl pprof profile 30
              : mo_ctl pprof heap
```

### set_conf - configuration parameters

Use `mo_ctl set_conf [conf_list]` to configure 1 or more usage parameters.

```
mo_ctl set_conf help
Usage         : mo_ctl setconf [conf_list] # set configurations
 [conf_list]  : configuration list in key=value format, seperated by comma
  e.g.        : mo_ctl setconf MO_PATH=/data/mo/matrixone,MO_PW=M@trix0riginR0cks,MO_PORT=6101  # set multiple configurations
              : mo_ctl setconf MO_PATH=/data/mo/matrixone                                       # set single configuration
```

!!! note
    When the path to set_conf's settings contains variables such as `${MO_PATH}`, `$` needs to be preceded by `\`, for example:

    ```bash
    mo_ctl set_conf  MO_CONF_FILE="\${MO_PATH}/matrixone/etc/launch/launch.toml"
    ```

### get_conf - Get the list of parameters

Use `mo_ctl get_conf [conf_list]` to get one or more current configuration items.

```
mo_ctl get_conf help
Usage         : mo_ctl getconf [conf_list] # get configurations
 [conf_list]  : optional, configuration list in key, seperated by comma.
              : use 'all' or leave it as blank to print all configurations
  e.g.        : mo_ctl getconf MO_PATH,MO_PW,MO_PORT  # get multiple configurations
              : mo_ctl getconf MO_PATH                # get single configuration
              : mo_ctl getconf all                    # get all configurations
              : mo_ctl getconf                        # get all configurations
```

#### mo_ctl get_conf - list of detailed parameters

Using `mo_ctl get_conf` will print a list of all parameters used by the current tool, their interpretations and ranges of values are shown in the following table.

| Parameter name               | features            | Value specification              |
| ---------------------- | ------------------------ | -------------------------|
| MO_PATH                | MatrixOne's codebase and executables are located at    | Folder Path  |
| MO_LOG_PATH            | Where MatrixOne's logs are stored     | Folder path, default is ${MO_PATH}/matrixone/logs           |
| MO_HOST                | IP address to which the MatrixOne service is connected  | IP address, default is 127.0.0.1    |
| MO_PORT                | Port number to which the MatrixOne service is connected  | Port number, default is 6001   |
| MO_USER                | User name for connecting to the MatrixOne service | Username, default is root  |
| MO_PW                  | Password for connecting to the MatrixOne service  | Password, default is 111   |
| CHECK_LIST             | precheck Required check dependencies     | The default is ("go" "gcc" "git" "mysql"). |
| GCC_VERSION            | The version of gcc that precheck checks    |default 8.5.0   |
| GO_VERSION             | The go version of the precheck check    |default 1.22.3  |
| MO_GIT_URL             | MatrixOne source code pulling address   | default <https://github.com/matrixorigin/matrixone.git> |
| MO_DEFAULT_VERSION     | The version of MatrixOne that is pulled by default | default 2.1.0    |
| GOPROXY                | GOPROXY address, generally used for domestic accelerated pull golang dependencies | default <https://goproxy.cn>,direct  |
| STOP_INTERVAL          | Stop interval, wait time to detect service status after stopping service | default 5 seconds |
| START_INTERVAL         | Startup interval, wait time to detect service status after starting the service | default 2 seconds   |
| MO_DEBUG_PORT          | MatrixOne's debug port, typically used by developers.  | default 9876   |
| MO_CONF_FILE           | MatrixOne startup configuration file  |default ${MO_PATH}/matrixone/etc/launch/launch.toml     |
| RESTART_INTERVAL       | Restart interval, wait time to detect service status after restarting the service | default 2 seconds    |
| PPROF_OUT_PATH         | golang's performance collection data output path  | default /tmp/pprof-test/    |
| PPROF_PROFILE_DURATION | Performance collection time for golang    | default 30 seconds |

### ddl_convert - DDL format conversion

Use `mo_ctl ddl_convert [options] [src_file] [tgt_file]` to convert a DDL file from another database syntax format to MatrixOne's DDL format, currently supported only in `mysql_to_mo` mode.

```
mo_ctl ddl_convert help
Usage           : mo_ctl ddl_convert [options] [src_file] [tgt_file] # convert a ddl file to mo format from other types of database
 [options]      : available: mysql_to_mo
 [src_file]     : source file to be converted, will use env DDL_SRC_FILE from conf file by default
 [tgt_file]     : target file of converted output, will use env DDL_TGT_FILE from conf file by default
  e.g.          : mo_ctl ddl_convert mysql_to_mo /tmp/mysql.sql /tmp/mo.sql
```

### sql - Execute SQL

Use `mo_ctl sql [sql]` to execute SQL text or SQL files.

```
mo_ctl sql help
Usage           : mo_ctl sql [sql]                 # execute sql from string, or a file or a path containg multiple files
  [sql]         : a string quote by "", or a file, or a path
  e.g.          : mo_ctl sql "use test;select 1;"  # execute sql "use test;select 1"
                : mo_ctl sql /data/q1.sql          # execute sql in file /data/q1.sql
                : mo_ctl sql /data/                # execute all sql files with .sql postfix in /data/
```

### uninstall - Uninstall MatrixOne

Use `mo_ctl uninstall` to uninstall MatrixOne from MO_PATH.

```
mo_ctl uninstall help
Usage           : mo_ctl uninstall        # uninstall mo from path MO_PATH=/data/mo//matrixone
                                          # note: you will need to input 'Yes/No' to confirm before uninstalling
```

### upgrade - upgrade/downgrade MatrixOne version

MatrixOne 0.8 and later can use `mo_ctl upgrade version` or `mo_ctl upgrade commitid` to upgrade or downgrade MatrixOne from the current version to a stable version or a commit id version.

```
mo_ctl upgrade help
Usage           : mo_ctl upgrade [version_commitid]   # upgrade or downgrade mo from current version to a target commit id or stable version
 [commitid]     : a commit id such as '38888f7', or a stable version such as '2.1.0'
                : use 'latest' to upgrade to latest commit on main branch if you don't know the id
  e.g.          : mo_ctl upgrade 38888f7              # upgrade/downgrade to commit id 38888f7 on main branch
                : mo_ctl upgrade latest               # upgrade/downgrade to latest commit on main branch
                : mo_ctl upgrade 2.1.0               # upgrade/downgrade to stable version 2.1.0
```

### watchdog - Keep MatrixOne alive

Use `mo_ctl watchdog [options]` to set a scheduled task to guarantee MatrixOne service availability, check the status of MatrixOne every minute, and automatically pull up the service if it is found to be aborted.

```
mo_ctl watchdog help
Usage           : mo_ctl watchdog [options]   # setup a watchdog crontab task for mo-service to keep it alive
 [options]      : available: enable | disable | status
  e.g.          : mo_ctl watchdog enable      # enable watchdog service for mo, by default it will check if mo-servie is alive and pull it up if it's dead every one minute
                : mo_ctl watchdog disable     # disable watchdog
                : mo_ctl watchdog status      # check if watchdog is enabled or disabled
                : mo_ctl watchdog             # same as mo_ctl watchdog status
```

<!--ddl_convert 的详细转换规则请参考 [该文档]().-->
