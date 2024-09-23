CREATE TABLE `user` (
                        `id` BIGINT NOT NULL AUTO_INCREMENT,
                        `name` VARCHAR(255),
                        `avatar` VARCHAR(255),
                        `node_id` VARCHAR(255),
                        `active_status` INT,
                        `create_time` DATETIME,
                        `update_time` DATETIME,
                        PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;