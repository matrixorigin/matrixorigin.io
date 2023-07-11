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
| `mo_ctl start` | Restart MatrixOne service |
| `mo_ctl connect` | Call MySQL Client to connect to MatrixOne service |
| `mo_ctl set_conf` | Set various usage parameters |
| `mo_ctl get_conf` | View current parameters |
| `mo_ctl ddl_convert` | A tool to convert MySQL DDL statements into MatrixOne statements |
| `mo_ctl get_cid` | View the source version of the current MatrixOne download repository |
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

[option_1]        : available: help | precheck | deploy | status | start | stop | restart | connect | get_cid | set_conf | get_conf | pprof | ddl_convert
  0) help         : print help information
  1) precheck     : check pre-requisites for mo_ctl
  2) deploy       : deploy mo onto the path configured
  3) status       : check if there's any mo process running on this machine
  4) start        : start mo-service from the path configured
  5) stop         : stop all mo-service processes found on this machine
  6) restart      : start mo-service from the path configured
  7) connect      : connect to mo via mysql client using connection info configured
  8) get_cid      : print mo commit id from the path configured
  9) pprof        : collect pprof information
  10) set_conf    : set configurations
  11) get_conf    : get configurations
  12) ddl_convert : convert ddl file from to mo format from other types of database
  e.g.            : mo_ctl status

[option_2]        : Use " mo_ctl [option_1] help " to get more info
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
  e.g.        : mo_ctl deploy             # default, same as mo_ctl deploy 0.8.0
              : mo_ctl deploy main        # deploy development latest version
              : mo_ctl deploy d29764a     # deploy development version d29764a
              : mo_ctl deploy 0.8.0       # deploy stable verson 0.8.0
              : mo_ctl deploy force       # delete all under MO_PATH and deploy verson 0.8.0
              : mo_ctl deploy 0.8.0 force # delete all under MO_PATH and deploy stable verson 0.8.0 from beginning
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

### get_cid - print MatrixOne code commit id

Use `mo_ctl get_cid` to print the MatrixOne repository commit id under the current `MO_PATH` path.

```
mo_ctl get_cid help
Usage : mo_ctl get_cid # print mo commit id from the path configured
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
| MO_DEFAULT_VERSION     | Default version of MatrixOne to be fetched          | Default: 0.8.0                                               |
| GOPROXY                | Address of GOPROXY used for faster dependency retrieval in China | Default: <https://goproxy.cn>, direct                          |
| STOP_INTERVAL          | Interval to wait for service status check after stopping the service | Default: 5 seconds                                           |
| START_INTERVAL         | Interval to wait for service status check after starting the service | Default: 2 seconds                                           |
| MO_DEBUG_PORT          | Debug port for MatrixOne, usually used by developers | Default: 9876                                                |
| MO_CONF_FILE           | Launch configuration file for MatrixOne              | Default: ${MO_PATH}/matrixone/etc/launch-tae-CN-tae-DN/launch.toml |
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

<!--ddl_convert 的详细转换规则请参考[该文档]()。-->
