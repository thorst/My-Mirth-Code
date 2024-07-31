CREATE TABLE `fridge_message_history` (
	`fridge_message_history_id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
	`message_id` BIGINT(20) UNSIGNED NOT NULL DEFAULT '0',
	`channel_id` UUID NOT NULL,
	`channel_name` VARCHAR(100) NOT NULL DEFAULT '' COLLATE 'latin1_swedish_ci',
	`connector_id` TINYINT(3) UNSIGNED NOT NULL DEFAULT '0',
	`connector_name` VARCHAR(100) NOT NULL DEFAULT '' COLLATE 'latin1_swedish_ci',
	`send_state` VARCHAR(15) NOT NULL DEFAULT '' COLLATE 'latin1_swedish_ci',
	`transmit_time` BIGINT(20) NOT NULL DEFAULT '0',
	`maps` LONGTEXT NULL DEFAULT NULL COLLATE 'utf8mb4_bin',
	`message` TEXT NOT NULL COLLATE 'latin1_swedish_ci',
	`response` TEXT NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`inserted` TIMESTAMP NOT NULL DEFAULT current_timestamp(),
	PRIMARY KEY (`fridge_message_history_id`) USING BTREE
)
COLLATE='latin1_swedish_ci'
ENGINE=InnoDB
AUTO_INCREMENT=855
;
