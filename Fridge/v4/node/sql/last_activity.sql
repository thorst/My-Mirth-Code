CREATE TABLE `last_activity` (
	`last_activity_id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
	`channel_id` UUID NOT NULL,
	`channel_name` VARCHAR(100) NOT NULL DEFAULT '0' COLLATE 'utf8mb4_unicode_ci',
	`connector_id` TINYINT(3) UNSIGNED NOT NULL DEFAULT '0',
	`connector_name` VARCHAR(100) NOT NULL DEFAULT '0' COLLATE 'utf8mb4_unicode_ci',
	`estimated_transmit` BIGINT(20) UNSIGNED NOT NULL DEFAULT '0',
	`actual_transmit` BIGINT(20) UNSIGNED NOT NULL DEFAULT '0',
	`updated` DATETIME NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
	PRIMARY KEY (`last_activity_id`) USING BTREE,
	UNIQUE INDEX `unique_channel_connector` (`channel_id`, `connector_id`) USING BTREE
)
COMMENT='Holds the last activity datetime for each connector.'
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
;
