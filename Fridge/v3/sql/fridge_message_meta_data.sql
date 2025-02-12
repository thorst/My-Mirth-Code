CREATE TABLE `fridge_message_meta_data` (
    `fridge_message_meta_data_id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
    `fridge_message_history_id` BIGINT(20) UNSIGNED NOT NULL, -- Foreign key to fridge_message_history
    `key_string` VARCHAR(255) NOT NULL,
    `value_string` VARCHAR(255) NOT NULL,
    `map_string` LONGTEXT NULL,
    PRIMARY KEY (`fridge_message_meta_data_id`),
    
    -- Optimized indexes:
    INDEX `idx_meta_history_id` (`fridge_message_history_id`),  -- Fast JOIN on fridge_message_history_id
    INDEX `idx_meta_key_value` (`key_string`, `value_string`),   -- Optimized WHERE filtering on key & value

    -- Foreign key constraint:
    CONSTRAINT `fk_message_meta_history`
        FOREIGN KEY (`fridge_message_history_id`)
        REFERENCES `fridge_message_history` (`fridge_message_history_id`)
        ON DELETE CASCADE
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB;
