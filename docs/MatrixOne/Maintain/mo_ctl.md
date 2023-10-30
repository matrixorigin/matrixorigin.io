# mo_ctl Tool

`mo_ctl` is a command-line tool that helps you deploy and install MatrixOne, start and stop control, and connect to the database.

## Feature Overview

The operating systems that `mo_ctl` has adapted so far are shown in the table below:

| OS | Version |
| -------- | -------------------- |
| Debian | 11 and above |
| Ubuntu | 20.04 and above |
| macOS | Monterey 12.3 and above |

The current function list of `mo_ctl` is shown in the table below.

| Command | Function |
| -------------------- | ---------------------------- ----------------------------------- |
| `mo_ctl help` | See a list of statements and functions for the `mo_ctl` tool itself |
| `mo_ctl precheck` | Check dependencies required for MatrixOne source code installation, namely golang, gcc, git, MySQL Client |
| `mo_ctl deploy` | Download and install and compile the corresponding version of MatrixOne; the default is to install the latest stable version |
| `mo_ctl start` | Start MatrixOne service |
| `mo_ctl status` | Check if the MatrixOne service is running |
| `mo_ctl stop` | Stop all MatrixOne service processes |
| `mo_ctl restart` | Restart MatrixOne service |
| `mo_ctl connect` | Call MySQL Client to connect to MatrixOne service |
| `mo_ctl upgrade`     | Upgrade/downgrade MatrixOne from the current version to a release version or commit id version        |
| `mo_ctl set_conf` | Set various usage parameters |
| `mo_ctl get_conf` | View current parameters |
| `mo_ctl uninstall` | Uninstall MatrixOne from MO_PATH path |
| `mo_ctl watchdog` | Set a scheduled task to ensure the availability of MatrixOne service, check the status of MatrixOne every minute, and automatically pull up the service if the service is found to be suspended |
| `mo_ctl sql` | Execute SQL directly through commands or a text file composed of SQL |
| `mo_ctl ddl_convert` | A tool to convert MySQL DDL statements into MatrixOne statements |
| `mo_ctl get_cid` | View the source version of the current MatrixOne download repository |
| `mo_ctl get_branch`     | View the branch version of the current MatrixOne download repository                 |
| `mo_ctl pprof` | Used to collect MatrixOne profiling data |

## Install mo_ctl

Depending on whether you have internet access, you can choose to install the `mo_ctl` tool online or offline; you need to be careful to consistently execute commands as root or with sudo privileges (and add sudo before each command). Meanwhile, `install.sh` will use the `unzip` command to decompress the `mo_ctl` package; please ensure the `unzip` command is installed.

### Install Online

```
wget https://raw.githubusercontent.com/matrixorigin/mo_ctl_standalone/main/install.sh && sudo bash +x ./install.sh

# alternate address
wget https://ghproxy.com/https://github.com/matrixorigin/mo_ctl_standalone/blob/main/install.sh && sudo bash +x install.sh
```

For users running this command in a macOS environment, if you are a non-root user, run `install.sh` with the following statement:

```
sudo -u $(whoami) bash +x ./install.sh
```

### Install Offline

```
# 1. First, download the installation script to the local computer, and then upload it to the installation machine
wget https://raw.githubusercontent.com/matrixorigin/mo_ctl_standalone/main/install.sh
wget https://github.com/matrixorigin/mo_ctl_standalone/archive/refs/heads/main.zip -O mo_ctl.zip

# alternate address
wget https://ghproxy.com/https://github.com/matrixorigin/mo_ctl_standalone/blob/main/install.sh
wget https://ghproxy.com/https://github.com/matrixorigin/mo_ctl_standalone/archive/refs/heads/main.zip -O mo_ctl.zip

# 2. Install from offline package
bash +x ./install.sh mo_ctl.zip
```

## Quick Start

You can quickly install and deploy the stand-alone version of MatrixOne through the following steps. For more information, see [Deploy standalone MatrixOne](../Get-Started/install-standalone-matrixone.md).

1. Use the `mo_ctl help` command to view the tool guide.

2. Use the `mo_ctl precheck` command to check whether the pre-dependency conditions are met.

3. Use the `mo_ctl get_conf` command to set relevant parameters, and the possible parameter configurations are as follows:

    ```
    # check default parameter values
    mo_ctl set_conf MO_PATH="/data/mo/matrixone" # set your own mo path
    mo_ctl set_conf MO_GIT_URL="https://ghproxy.com/https://github.com/matrixorigin/matrixone.git" # in case have network issues, you can set this conf by overwriting default value MO_GIT_URL="https:// github.com/matrixorigin/matrixone.git"
    ```

4. Use the `mo_ctl deploy`command to install and deploy the latest stable version of MatrixOne.

5. Use the `mo_ctl start` command to launch the MatrixOne service with the command .

6. Use the `mo_ctl connect` command to connect to the MatrixOne service.

## Reference command guide

### help - print reference guide

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

Use `mo_ctl [option_1] help` for instructions on using the next-level `mo_ctl [option_1]` functionality.

### precheck - check pre-dependency

Before installing MatrixOne from the source code, use `mo_ctl precheck` to check the pre-dependency conditions. The pre-dependence depends on `go`/`gcc`/`git`/`mysql(client)`.

```
mo_ctl precheck help
Usage         : mo_ctl precheck # check pre-requisites for mo_ctl
   Check list : go gcc git mysql
```

### deploy - install MatrixOne

Use `mo_ctl deploy [mo_version] [force]` to install and deploy a stable version of MatrixOne, or a specified version. The `force` option can delete the existing version of MatrixOne in the same directory and force a new version to be reinstalled.

```
mo_ctl deploy help
Usage         : mo_ctl deploy [mo_version] [force] # deploy mo onto the path configured
  [mo_version]: optional, specify an mo version to deploy
  [force]     : optional, if specified will delete all content under MO_PATH and deploy from beginning
  e.g.        : mo_ctl deploy             # default, same as mo_ctl deploy 1.0.0-rc2
              : mo_ctl deploy main        # deploy development latest version
              : mo_ctl deploy d29764a     # deploy development version d29764a
              : mo_ctl deploy 1.0.0-rc2       # deploy stable verson 1.0.0-rc2
              : mo_ctl deploy force       # delete all under MO_PATH and deploy verson 1.0.0-rc2
              : mo_ctl deploy 1.0.0-rc2 force # delete all under MO_PATH and deploy stable verson 1.0.0-rc2 from beginning
```

### start - launch MatrixOne

Use `mo_ctl start` to start MatrixOne service; the startup file path is located under `MO_PATH`.

```
mo_ctl start help
Usage         : mo_ctl start # start mo-service from the path configured
```

### stop - stop MatrixOne

Use `mo_ctl stop [force]` to stop all MatrixOne services on local machine, and if multiple MatrixOne services are running, they will also be stopped.

```
 mo_ctl stop help
Usage : mo_ctl stop [force] # stop all mo-service processes found on this machine
 [force] : optional, if specified, will try to kill mo-services with -9 option, so be very carefully
  e.g.: mo_ctl stop # default, stop all mo-service processes found on this machine
              : mo_ctl stop force # stop all mo-services with kill -9 command
```

### restart - restart MatrixOne

Use `mo_ctl restart [force]` to stop all MatrixOne services on this machine and restart the MatrixOne services located in the path of `MO_PATH`.

```
mo_ctl restart help
Usage         : mo_ctl restart [force] # a combination operation of stop and start
 [force]      : optional, if specified, will try to kill mo-services with -9 option, so be very carefully
  e.g.        : mo_ctl restart         # default, stop all mo-service processes found on this machine and start mo-serivce under path of conf MO_PATH
              : mo_ctl restart force   # stop all mo-services with kill -9 command and start mo-serivce under path of conf MO_PATH
```

### connect - using mysql-client to connect MatrixOne

Use `mo_ctl connect` to connect to MatrixOne service, the connection parameters are set by `mo_ctl` tool.

```
mo_ctl connect help
Usage         : mo_ctl connect # connect to mo via mysql client using connection info configured
```

### status - Check the status of MatrixOne

Use `mo_ctl status` to check whether MatrixOne is running or not.

```
mo_ctl status help
Usage         : mo_ctl status # check if there's any mo process running on this machine
```

### get_cid - print MatrixOne code commit id

Use `mo_ctl get_cid` to print the MatrixOne repository commit id under the current `MO_PATH` path.

```
mo_ctl get_cid help
Usage : mo_ctl get_cid # print mo commit id from the path configured
```

### get_branch - print MatrixOne code commit id

Use `mo_ctl get_branch` to print the MatrixOne codebase branch under the current `MO_PATH` path.

```
mo_ctl get_branch help
Usage           : mo_ctl get_branch        # print which git branch mo is currently on
```

### pprof - Collect performance information

Use `mo_ctl pprof [item] [duration]` to collect related performance information of MatrixOne, mainly for developers to debug.

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

### get_conf - get parameter list

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

#### mo_ctl get_conf - Detailed Parameter List

Using `mo_ctl get_conf` will print a list of all the parameters used by the current tool. Their meanings and value ranges are shown in the table below.

| Parameter Name         | Function                | Value Specification                |
| ---------------------- | ---------------------- | -------------------------------- |
| MO_PATH                | Location of MatrixOne's code repository and executables | Folder path                                                  |
| MO_LOG_PATH            | Location of MatrixOne's logs                       | Folder path, default: ${MO_PATH}/matrixone/logs              |
| MO_HOST                | IP address for connecting to MatrixOne service      | IP address, default: 127.0.0.1                                |
| MO_PORT                | Port number for connecting to MatrixOne service     | Port number, default: 6001                                    |
| MO_USER                | Username for connecting to MatrixOne service        | Username, default: root                                      |
| MO_PW                  | Password for connecting to MatrixOne service        | Password, default: 111                                       |
| CHECK_LIST             | Dependencies required for precheck                  | Default: ("go" "gcc" "git" "mysql")                          |
| GCC_VERSION            | gcc version to be checked in precheck               | Default: 8.5.0                                               |
| GO_VERSION             | go version to be checked in precheck                | Default: 1.20                                                |
| MO_GIT_URL             | Repository URL for fetching MatrixOne source code   | Default: <https://github.com/matrixorigin/matrixone.git>      |
| MO_DEFAULT_VERSION     | Default version of MatrixOne to be fetched          | Default: 1.0.0-rc2                                               |
| GOPROXY                | Address of GOPROXY used for faster dependency retrieval in China | Default: <https://goproxy.cn>, direct                          |
| STOP_INTERVAL          | Interval to wait for service status check after stopping the service | Default: 5 seconds                                           |
| START_INTERVAL         | Interval to wait for service status check after starting the service | Default: 2 seconds                                           |
| MO_DEBUG_PORT          | Debug port for MatrixOne, usually used by developers | Default: 9876                                                |
| MO_CONF_FILE           | Launch configuration file for MatrixOne              | Default: ${MO_PATH}/matrixone/etc/launch/launch.toml |
| RESTART_INTERVAL       | Interval to wait for service status check after restarting the service | Default: 2 seconds                                           |
| PPROF_OUT_PATH         | Output path for collecting golang performance data   | Default: /tmp/pprof-test/                                    |
| PPROF_PROFILE_DURATION | Duration for collecting golang performance data      | Default: 30 seconds                                          |

### ddl_convert - DDL format conversion

Use `mo_ctl ddl_convert [options] [src_file] [tgt_file]` to convert a DDL file from other database syntax formats to MatrixOne's DDL format, currently only supported by `mysql_to_mo` mode.

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

Use `mo_ctl upgrade version` or `mo_ctl upgrade commitid` to upgrade or downgrade MatrixOne from the current version to a stable version or a commit id version.

```
mo_ctl upgrade help
Usage           : mo_ctl upgrade [version_commitid]   # upgrade or downgrade mo from current version to a target commit id or stable version
 [commitid]     : a commit id such as '38888f7', or a stable version such as '1.0.0-rc2'
                : use 'latest' to upgrade to latest commit on main branch if you don't know the id
  e.g.          : mo_ctl upgrade 38888f7              # upgrade/downgrade to commit id 38888f7 on main branch
                : mo_ctl upgrade latest               # upgrade/downgrade to latest commit on main branch
                : mo_ctl upgrade 1.0.0-rc2                # upgrade/downgrade to stable version 1.0.0-rc2
```

### watchdog - Keep Alive MatrixOne

Use `mo_ctl watchdog [options]` to set a scheduled task to ensure the availability of MatrixOne service, check the status of MatrixOne every minute, and automatically pull up the service if it finds that the service is suspended.

```
mo_ctl watchdog help
Usage           : mo_ctl watchdog [options]   # setup a watchdog crontab task for mo-service to keep it alive
 [options]      : available: enable | disable | status
  e.g.          : mo_ctl watchdog enable      # enable watchdog service for mo, by default it will check if mo-servie is alive and pull it up if it's dead every one minute
                : mo_ctl watchdog disable     # disable watchdog
                : mo_ctl watchdog status      # check if watchdog is enabled or disabled
                : mo_ctl watchdog             # same as mo_ctl watchdog status
```
