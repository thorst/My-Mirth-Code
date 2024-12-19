# The Fridge #
***A Cold Storage Solution For Message History***

The Fridge is a long term storage solution for message history. The purpose is to offload the data to cheaper disk, or at least a seperate db from your primary db.

We use postgresql for our primary db, as many do, and then send the message history to mariadb. This secondary db can be on the same host, or a seperate one.

With this we can upgrade postgres quicker due to a smaller db size, have message history get pulled forward when we upgrade to a new server, and only save the transaction states we care about.

## Goals:
* Never slow the engine down
* Never error out a transaction
* Gracefully handle downtime of the fridge db
* Save less data that what would normally be stored in postgres (only raw inbound, and encoded outbound)
* Ability to resend to the channel, specific destination, and even a different server (in case of a server migration)
* Also store last sent datetime for each destination https://github.com/nextgenhealthcare/connect/issues/6022
* Minimal effort for developers to enable

## Limitations:
* There is no built in solution for message archiving for this purpose. The archiving feature included in the pruner only outputs to a file, this is a good potential first step, but would delay the data in the cold storage by the age in the prune setting. This may be fine for your use case, but we would like to use this system as the only message history, keeping the workflow the same whether the transaction is 30 minutes old or 30 days old.
* Currently there is no way to access the encoded outbound transaction on the global postprocessor if the channels destination is set to `queue always` (our standard)
* There is no global response transformer https://github.com/nextgenhealthcare/connect/issues/6265
* Compiled code blocks will not execute unless there is code on the respones transformer https://github.com/nextgenhealthcare/connect/issues/4941
* Scraping the database directly is possible but messy and suffers from triggering issues and how long it executes as its bulk loading
* Could potentially use a mirrored db, but then it would be the full db
* Granular message storage would help reduce the size of the db, but doesn't exist yet https://github.com/nextgenhealthcare/connect/issues/6255


## Components:
1. Global Post Processor Code Template - This will save the inbound raw message
1. Response Transformer Code Template - This will save the outbound encoded message
1. Reading Channel - A channel to read in the files that are output from #1 and #2
1. Purge Channel - A channel to purge the db of transactions older than X number of days
1. Api Channel - A channel to house a restful api
   1. Last Activity - Returns a list of channels, thier connectors, and the last datetime a transaction was actually sent to the destination
   1. Retreive Message Headers - Returns a list of transaction for a channel. Optionally take several parameters for filtering, paging, etc.
   1. Retreive Message Body - Returns the message, response, and maps
   1. Retreive Map Keys - This grabs the most recent message for a channel/connector, and returns all the map keys, which we can use for filtering


## Datebase:
```sql
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
```

## Additional Funcitonality:
Because we are getting all the data running throuhg the engine, and mirth doesnt have last activity data and times (which we use for inactivity monitoring)
we can use this integation to track that.
1. We Need an extra db table
2. In the reading channel, we also insert activity information into the activity table
3. We need an Api to return the activity read from the database
4. We need the purge channel to remove items in the activity table that havent been updated. This would mean the channel/connector was renamed, or deleted

```sql
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
```