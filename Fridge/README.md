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
* You do not have access to the auto-generated ack for HL7 data-type source connectors. The ack may be generated after both the post processor and global post processor. This doesnt entirely make sense
to me because you can choose to generate BEFORE processesing. If you set source the queue, that is the only ack option, you cannot even choose your own generated ack. There is a java User API to generate
acks, which probably is whats behind the scenes for that auto-generate feature.
* `var raw = connector.getRawData();` is always available 
* `var transformed = connector.getTransformedData();` is only available if there is a filter/transformer on the source
* `var encoded = connector.getEncodedData();` is only available if the message wasnt filtered

## Limitations of Solution:
* The source map is not available on the response transformer, so you can only search on source map data if you are seraching the database 
* 



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




## Example Json From global post processor
```json
{
  "channelId" : "f28a94dd-28b6-4178-93a0-aa51561dc3d7",
  "channelName" : "RawHL7",
  "messageId" : 29,
  "mapChannel" : {
    "MessageId" : "29"
  },
  "mapResponse" : {
    "ack" : "MSH|^~\\&|||EPIC|Todd Horst was here|20241219135245|IPMD|ACK|1734634365|T|2.3\rMSA|AA|245140\r"
  },
  "connectors" : [
    {
      "connectorId" : 0,
      "connectorName" : "Source",
      "processingState" : "TRANSFORMED",
      "message" : "MSH|^~\\&|EPIC|Todd Horst was here|||20240801093152|IPMD|ADT^A08|245140|T|2.3|||||||||||||||||||Todd Horst was also here\rEVN|A08|20240801093152\r",
      "transmitDate" : 1734634365724,
      "estimatedDate" : 1734634365724,
      "mapConnector" : { },
      "mapSource" : {
        "FridgeResend" : "0",
        "destinationSet" : [
          0,
          1,
          3,
          4
        ]
      },
      "response" : ""
    },
    {
      "connectorId" : 4,
      "connectorName" : "ClassicV3",
      "processingState" : "QUEUED",
      "message" : null,
      "transmitDate" : 0,
      "estimatedDate" : 1734634365728,
      "mapConnector" : null,
      "mapSource" : null,
      "response" : null
    },
    {
      "connectorId" : 1,
      "connectorName" : "Classic (Dont use)",
      "processingState" : "FILTERED",
      "message" : null,
      "transmitDate" : 0,
      "estimatedDate" : 1734634365728,
      "mapConnector" : null,
      "mapSource" : null,
      "response" : null
    },
    {
      "connectorId" : 3,
      "connectorName" : "ClassicV2 (Dont use)",
      "processingState" : "SENT",
      "message" : null,
      "transmitDate" : 1734634365734,
      "estimatedDate" : 1734634365728,
      "mapConnector" : null,
      "mapSource" : null,
      "response" : null
    }
  ],
  "executionTime" : 0
}
```

## Resonponse Transformer json output example
```json
{
  "channelId" : "f28a94dd-28b6-4178-93a0-aa51561dc3d7",
  "channelName" : "RawHL7",
  "messageId" : 29,
  "mapChannel" : null,
  "mapResponse" : null,
  "connectors" : [
    {
      "connectorId" : 4,
      "connectorName" : "ClassicV3",
      "processingState" : "SENT",
      "message" : "MSH|^~\\&|EPIC|Todd Horst was here|||20240801093152|IPMD|ADT^A08|245140|T|2.3|||||||||||||||||||Todd Horst was also here\rEVN|A08|20240801093152\r",
      "transmitDate" : 1734634365848,
      "mapConnector" : { },
      "mapSource" : null,
      "response" : ""
    }
  ],
  "executionTime" : -1
}
```


## Additional Funcitonality:
Because we are getting all the data running throuhg the engine, and mirth doesnt have last activity data and times (which we use for inactivity monitoring)
we can use this integation to track that.
1. We Need an extra db table
2. In the reading channel, we also insert activity information into the activity table
3. We need an Api to return the activity read from the database
4. We need the purge channel to remove items in the activity table that havent been updated. This would mean the channel/connector was renamed, or deleted




v1 was a proof of concept

v2 was pretty usable, but storing the maps in a json object in the table could not be indexed and therefor was slow. also its bulk loading was fast, but theres not resiliency. it deletes the file before inserting it, so its possible it was never inserted correctly, not that that couldnt be rectified. All of the out of engine scripts were in python, and I didnt love this because everything in mirth is js. This version had a major ui overhaul on the website, and started playing with indexes.

v3:
  -Switch to use node v20. This uses PM2 to restart the script on server reboot. This is because our team can control its settings, compared to systemd which our server team controls.
    Also, its nice to be in all js instead of switching between python and js.
  -We are using mariadb 10.11 on the same server as the mirth instance. Our main db is postgres.
  -All the transactions are stored in the same table, but we use partitions to limit the scope of the queries.
  -Loader is more robust now with inserting 1 record at a time. This is slower then the bulk inserts, but ensures acdcuracy, as files arent deleted until they are succesfully loaded into
    the database.
  -In order for map data to be indexed, it needs to be prefixed with "search" or suffixed with "Search" (case sensitive). It does NOT need to be in a channels `Custom Metadata` to be
    searchable
  -In order to display the map data on the Fridge gui (website), it DOES need to be in the `Custom Metadata`
