CREATE TABLE `{{channelId}}_history` (
    history_id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
    message_id BIGINT(20) UNSIGNED NOT NULL DEFAULT '0',
    connector_id TINYINT(3) NOT NULL DEFAULT '0',
    send_state VARCHAR(15) NOT NULL DEFAULT '' COLLATE 'utf8mb4_unicode_ci',
    transmit_time BIGINT(20) NOT NULL DEFAULT '0',
    maps LONGTEXT NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
    message MEDIUMTEXT NOT NULL COLLATE 'utf8mb4_unicode_ci',
    response MEDIUMTEXT NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
    inserted TIMESTAMP NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`history_id`) USING BTREE,
    INDEX `idx_{{channelId}}_history_connector_time` (`connector_id`, `transmit_time`) USING BTREE,
    INDEX `idx_{{channelId}}_history_send_state` (`send_state`) USING BTREE,
    INDEX `idx_{{channelId}}_history_message_id` (`message_id`) USING BTREE,
    INDEX `idx_{{channelId}}_history_inserted` (`inserted`) USING BTREE
) ENGINE = InnoDB;