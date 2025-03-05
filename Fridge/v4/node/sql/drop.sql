-- Execute at command line 
SET SESSION sql_log_bin = 0;
DROP TABLE IF EXISTS fridge_message_history;
RENAME TABLE fridge_message_history_new TO fridge_message_history;