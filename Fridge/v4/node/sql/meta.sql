CREATE TABLE `{{channelId}}_meta` (
    `meta_id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
    `history_id` BIGINT(20) UNSIGNED NOT NULL,
    `key_string` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_unicode_ci',
    `value_string` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_unicode_ci',
    `map_string` LONGTEXT NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
    PRIMARY KEY (`meta_id`) USING BTREE,
    INDEX `idx_meta_history_id` (`history_id`) USING BTREE,
    INDEX `idx_meta_key_value` (`key_string`, `value_string`) USING BTREE,
    CONSTRAINT `fk_{{channelId}}_history` FOREIGN KEY (`history_id`) REFERENCES `{{channelId}}_history` (`history_id`) ON UPDATE CASCADE ON DELETE CASCADE
) COLLATE = 'utf8mb4_unicode_ci' ENGINE = InnoDB;