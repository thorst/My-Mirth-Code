/*
    This code shouldn't be dependent on any code templates.    

    Generally speaking this will save a json file per transaction for all channels. There are two ways you can effect this:
    1. ignoreChannels - If you set shouldIgnoreChannels to true, it will ignore all channels in the list.
    2. includeChannels - If you set shouldIncludeChannels to true, it will ignore all channels NOT in the list.
    
    The intention is that one is set to to true, and the other is set to false.

    After the file is saved, a channel reads the files back in, saves them to a MariaDB database, and also saves the timestamps
    to a lastActivity table. Then an api service will return these timestamps for consumption.
	
    Limitations:
        -If you have a destination set to queue, as is our standard, I will not be able to save the ack or the actual
            sent date and time. Instead I will only be able to save the time it was received. You will have the option
            to include a code template on the response transformer for any destinations where you need the ack or actual
            sent datetime.

    Potential additions:
        -Add filter for channel readers, where I dont save the raw, since that could be found on the sending destination <- more effort than its worth
        -Add option to include destination data, for people who dont use queue and/or dont care about the sent datetime etc <- this is outdated, i do this now

    	
*/

// mapParse is a code template, but since this script is self-contained with no code library dependencies, Im including here.
function mapParse(arg1) {
    var obj = {};
    for (var e in Iterator(arg1.entrySet())) {
        obj[e.key] = String(e.value);
    }
    return obj;
}
function generateRandomNumber(max) {
    return Math.floor(Math.random() * (max + 1));
}

// Function to create a directory if it doesn't exist
function createDirectoryIfNotExists(directory) {
    var file = new java.io.File(directory);
    if (!file.exists()) {
        file.mkdirs();
    }
}
try {

    var thread_count = 10;
    var destination_dir = generateRandomNumber(thread_count);


    // Where we should save the files
    // We have a `serverInstallDir` stored in the configuration map, because we may have
    // different roots depending on the version of the installation.
    var serverInstallDir = $cfg("serverRoot");
    var dir = serverInstallDir + "/mirthconnect/_in/channels/system/fridge/" + destination_dir;
    createDirectoryIfNotExists(dir);


    // Create a list of channels to exclude from saving
    var shouldIgnoreChannels = true;
    var ignoreChannels = [
        "fridgeLoad",
        "Channel 2"
    ];

    // Create a list of channels to include for saving
    var shouldIncludeChannels = false;
    var includeChannels = [
        "Channel 3",
        "Channel 4"
    ];


    //var startTime = new Date().getTime();

    // Get the channel info
    var channelId = message.getChannelId();
    var channelName = String(ChannelUtil.getDeployedChannelName(channelId.toString()));

    // Abort if its an ignored channel
    if (shouldIgnoreChannels && ignoreChannels.indexOf(channelName.toString()) >= 0) {
        return;
    }
    if (shouldIncludeChannels && includeChannels.indexOf(channelName) == -1) {
        return;
    }




    // Get the message ID
    var messageId = message.getMessageId();

    // Determine where to save the file and Open file for writing
    var fileName = dir + "/" + channelName + "." + messageId + ".source.json";

    // Start the reponse object (that gets saved)
    var saveObj = {
        channelId: channelId,
        channelName: channelName,
        messageId: messageId,
        mapChannel: null,
        mapResponse: null,
        connectors: []
    };

    // Iterator for looping over this message for all connectors
    var iterator = message.getConnectorMessages().entrySet().iterator();
    while (iterator.hasNext()) {

        // Get record, and the state of the message
        var record = iterator.next();
        var connector = record.getValue();
        var connectorId = record.getKey();
        var connectorName = connector.getConnectorName();
        var processingState = connector.getStatus() + ''; // coerce to string

        if (connectorName == "Source") {

            // These are transactional level, and transcend connectors
            // Getting them on the source because I know theres only ever one
            saveObj.mapChannel = mapParse(connector.getChannelMap());
            saveObj.mapResponse = mapParse(connector.getResponseMap());

            saveObj.connectors.push({
                connectorId: connectorId,
                connectorName: connectorName,
                processingState: processingState,
                message: connector.getRawData(),
                transmitDate: connector.getReceivedDate().getTimeInMillis(),
                estimatedDate: connector.getReceivedDate().getTimeInMillis(),
                mapConnector: mapParse(connector.getConnectorMap()),
                mapSource: mapParse(connector.getSourceMap()),

                response: response && response.getContent ? response.getContent() : "",
            });

            // Exist current loop
            continue;
        }

        // Throw the destinations estimated sent time, this will be the same as what we have today
        // where we dont require the response transformer script
        saveObj.connectors.push({
            connectorId: connectorId,
            connectorName: connectorName,
            processingState: processingState,
            message: null,
            transmitDate: connector.getSendDate() ? connector.getSendDate().getTimeInMillis() : 0,
            estimatedDate: connector.getReceivedDate().getTimeInMillis(),
            mapConnector: null,
            mapSource: null,
            response: null
        });


    } // End iterator

    //var endTime = new Date().getTime();
    //saveObj.executionTime = endTime - startTime;

    // Save the file
    var jsonString = JSON.stringify(saveObj);
    FileUtil.write(fileName, true, jsonString);

} catch (exceptionVar) {
    logger.error('There is an error with the global postprocessor.');
    logger.error(exceptionVar);
} finally {
}

return;