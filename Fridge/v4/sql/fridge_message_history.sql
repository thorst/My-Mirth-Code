CREATE TABLE `fridge_message_history` (
    `fridge_message_history_id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
    `message_id` BIGINT(20) UNSIGNED NOT NULL DEFAULT '0',
    `channel_id` UUID NOT NULL,
    `channel_name` VARCHAR(100) NOT NULL DEFAULT '' COLLATE 'utf8mb4_unicode_ci', -- partition key
    `connector_id` TINYINT(3) NOT NULL DEFAULT '0',
    `connector_name` VARCHAR(100) NOT NULL DEFAULT '' COLLATE 'utf8mb4_unicode_ci',
    `send_state` VARCHAR(15) NOT NULL DEFAULT '' COLLATE 'utf8mb4_unicode_ci',
    `transmit_time` BIGINT(20) NOT NULL DEFAULT '0',
    `maps` LONGTEXT NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
    `message` MEDIUMTEXT NOT NULL COLLATE 'utf8mb4_unicode_ci',
    `response` MEDIUMTEXT NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
    `inserted` TIMESTAMP NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`fridge_message_history_id`, `channel_name`),
    INDEX `idx_fridge_message_history_channel_connector_inserted` (`channel_name`, `connector_name`, `message_id`),
    INDEX `idx_fridge_message_history_inserted` (`channel_name`, `connector_name`, `inserted` DESC),
    INDEX `idx_fridge_message_history_message_id` (`message_id`, `channel_name`, `connector_id`)
)
PARTITION BY LIST COLUMNS(`channel_name`) (
    PARTITION p_default VALUES IN ('default') -- Placeholder partition, must be replaced dynamically
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB;
