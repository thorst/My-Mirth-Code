// This script executes once after a message has been processed
// This script applies across all channels
// Responses returned from here will be stored as "Postprocessor" in the response map
// You have access to "response", if returned from the channel postprocessor
//cacheLastSent();


/*
    cacheLastSent - Saves the last time a message was sent, per connector, into 
    global map 'connector_lastactivity'. Caveat is that if destination is set to
    queue, its actually the time something was added to the queue unfortunately.
	
    This method gets called on the global postprocessesor. Since it gets called
    after every message on every channel, we need to be very fast and error proof.
    It will save the last activity information if its a sent or transformed state.
    There are two other peices of the puzzle:
    1. A cache channel that runs at a scheduled interval. It writes data out to
        a file, and cleans up the in-memory object of deleted channels/connectors.
    2. A wapi api that returns the in memory object.

    No data is returned.
 
    Change Log:
    05/16/2024 - TMH
        -Updated to move initialization of global to top of script if its empty
        -I lock the global for the life of the scripts execution
        -I now clone the object instead of editing in memory
        -I use .putsync instead of .put. putsync is synchronous and will wait until
            its on the map before proceeding, which seems like a good idea here
            since we were having concurrency issues.
    05/21/2024 - TMH
        -putsync and containsKeySync dont seem to be working. Reverted to put and containsKey
    06/19/2024 - TMH
        -Trying to put the lock back in - still happened
        -trying to put directly on postprocessor - still happened
        - ensuring NO code templates are enabled on the postprocessor- still happened
         - reenable the lock 5/20 at 10.01

        next steps
    	
        reenable the clone
*/

try {
    //logger.info("hey");
    //globalMap.lock('connector_lastactivity');

    // Blow away global
    // Youll also have to delete the cache file /ei/mirthconnect/_cache/connector_lastactivity.txt
    // globalMap.put('connector_lastactivity', '');
    // globalMap.remove('connector_lastactivity');
    // return;

    // If the lastactivity key doesnt exist, load it in from cache
    if (!globalMap.containsKey('connector_lastactivity')) {

        // Bad way to build the cache file location
        var cacheDir = '/cl/mirthconnect/_cache';
        var globalKey = 'connector_lastactivity';
        var cacheFile = cacheDir + '/' + globalKey + ".txt";

        // If file exists, read it, otherwise default to a new object
        var file = new java.io.File(cacheFile);
        var content = {};
        if (file.exists()) {
            content = JSON.parse(String(FileUtil.read(cacheFile)));
        }

        // Put that contents into global, and update the monitoring var
        globalMap.put('connector_lastactivity', content);
    }

    // Grab the value, Im tryign to clone it here and then putsync at the end
    // But not sure if thats better or worse, or if it isnt needed, compared
    // to before where I would just get a reference and modify it directly.
    var monitoring = globalMap.get('connector_lastactivity');
    //monitoring = JSON.parse(JSON.stringify(monitoring));



    // Get the channel ID
    var channelId = message.getChannelId();

    // Iiterator for looping over this message for all connectors
    var iterator = message.getConnectorMessages().entrySet().iterator();

    while (iterator.hasNext()) {

        // Get record, and the state of the message
        var record = iterator.next();
        var connector = record.getValue();
        var processingState = connector.getStatus() + ''; // coerce to string

        // Source will always be transformed, and destination should be sent
        // No need to move further if its not one of these states
        if (processingState == "TRANSFORMED" || processingState == "SENT" || processingState == "QUEUED") {


            // Check if this channel is already in object
            if (!monitoring.hasOwnProperty(channelId)) {

                // Its not, so initialize, and retrieve name
                monitoring[channelId] = {
                    name: ChannelUtil.getDeployedChannelName(channelId),
                    connectors: {}
                };
            }

            // Get needed data
            var connectorId = record.getKey();
            var connectorName = connector.getConnectorName();
            var receivedDate = connector.getReceivedDate().getTimeInMillis();
            var sendDate = connector.getSendDate() ? connector.getSendDate().getTimeInMillis() : receivedDate;
            var sendDateActual = connector.getSendDate() ? connector.getSendDate().getTimeInMillis() : null;

            // Save the connector stat
            monitoring[channelId]["connectors"][connectorId] = {
                name: connectorName,
                sendDate: sendDate,
                receivedDate: receivedDate,
                sendDateActual: sendDateActual,
            };

        }
    }

    //globalMap.put('connector_lastactivity', monitoring);

} catch (err) {
    logger.error('There is an error with the global postprocessor.');
    logger.error(err);
} finally {
    //globalMap.unlock('connector_lastactivity');
}




return;