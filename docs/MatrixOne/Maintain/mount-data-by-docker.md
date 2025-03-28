# Mount directory to Docker container

This document will teach you how to mount the *data directory* or your *customized configuration file* to the Docker container when you launch MatrixOne by using Docker.

## Mount the *data directory*

To ensure the safety of the data directory, mount the local data directory to the Docker container by the following steps:

1. To check if MatrixOne has been running in Docker, execute the following command:

    ```
    docker ps -a
    ```

2. To stop the running container if MatrixOne has been running in Docker, execute the following command:

    ```
    docker stop <containerID>
    docker rm <containerID>
    ```

    Skip this step if MatrixOne is not running in Docker.

3. Mount the local **empty directory** to the Docker container directory */mo-data*, execute the following command:

     ```shell
     sudo docker run --name <name> --privileged -d -p 6001:6001 -v ${local_data_path}/mo-data:/mo-data:rw matrixorigin/matrixone:2.1.0
     ```

     | Parameters                          | Description                                                                                                                                                                         |
     | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
     | ${local_data_path}/mo-data:/mo-data | mount the local disk directory *${local_data_path}/mo-data* to the container directory */mo-data* <br>

__Tips__: The local data directory to be mounted must be an empty directory. |

## Mount the *customized configuration file*

If you need to modify the configuration file. In that case, it would be best to copy the configuration file in Docker to your local directory and then mount the local directory where the configuration file is stored to the Docker container directory. Refer to the following steps to mount the configuration file to the Docker container:

1. To check if MatrixOne has been running in Docker, execute the following command:

    ```
    docker ps -a
    ```

2. To launch MatrixOne MatrixOne has not been running in Docker, execute the following command:

    ```
    docker run -d -p 6001:6001 --name matrixone --privileged=true matrixorigin/matrixone:2.1.0
    ```

3. Check the containerID that MatrixOne has been running in Docker, and copy the configuration file directory to the local directory:

    ```
    docker ps -a
    docker cp <containerID>:/etc .
    ```

4. To stop the MatrixOne when the copy is completed, execute the following command:

    ```
    docker stop <containerID>
    docker rm <containerID>
    ```

5. (Optional) Modify the configuration file and save it.

6. Mount the configuration file to the Docker container directory and launch MatrixOne. Execute the following command:

     ```shell
     sudo docker run --name <name> --privileged -d -p 6001:6001 -v ${local_config_path}/etc:/etc:rw  --entrypoint "/mo-service" matrixorigin/matrixone:2.1.0 -launch /etc/launch/launch.toml
     ```

     | Parameters                      | Description                                                                                                   |
     | ------------------------------- | ------------------------------------------------------------------------------------------------------------- |
     | ${local_config_path}/etc:/etc   | mount the local customize configration directory *${local_config_path}/etc* to the container directory */etc* |
     | --entrypoint "/mo-service"      | Specifies that the container starts the MatrixOne service                                                     |
     | -launch /etc/launch/launch.toml | launch mode in */etc/*                                                                                        |

For more information on the description of *Docker run*, run the commands `docker run --help`.
