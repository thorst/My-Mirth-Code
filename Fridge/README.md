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
   1. Retreive Transactions - Returns a list of transaction for a channel. Optionally take several parameters for filtering, paging, etc.
   1. Resend Transaction - Resends a transaction


## Datebase: