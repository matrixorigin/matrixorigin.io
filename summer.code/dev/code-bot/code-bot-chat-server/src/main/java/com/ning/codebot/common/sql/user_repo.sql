CREATE TABLE `user_repo` (
                             `id` BIGINT NOT NULL AUTO_INCREMENT,
                             `user_name` VARCHAR(255) NOT NULL,
                             `repo_name` VARCHAR(255) NOT NULL,
                             `status` INT NOT NULL,
                             `create_time` DATETIME,
                             PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;