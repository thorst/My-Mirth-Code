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
        -I cannot save the ack that we send back on the source connector unless you generate it with the ack() code template.
                This is because the ack is generated after the post processesor and the global post processor. You may be able
                to get around this by setting the source to queued and autogenerate before processing, but I think this only works
                with hl7 data type. If your using raw i think the autogenerate is just empty. There is a User API ACK Generator 
                that basically does the same thing as the auto generator, so you would need to plop that into the ack response 
                map value, and not use the auto generate

    	
*/

// mapParse is a code template, but since this script is self-contained with no code library dependencies, Im including here.

try {

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
    function createDirectoryIfNotExists(directory) {
        var file = new java.io.File(directory);
        if (!file.exists()) {
            file.mkdirs();
        }
    }

    var thread_count = 10;
    var destination_dir = generateRandomNumber(thread_count);


    // Where we should save the files
    // We have a `serverInstallDir` stored in the configuration map, because we may have
    // different roots depending on the version of the installation.
    var serverInstallDir = $cfg("serverRoot");
    var dir = serverInstallDir + "/mirthconnect/_in/channels/system/fridge/" + destination_dir;



    // Create a list of channels to exclude from saving
    var shouldIgnoreChannels = true;
    var ignoreChannels = [
        "fridgeLoad",
        "Channel 2"
    ];

    // Create a list of channels to include for saving
    var shouldIncludeChannels = false;
    var includeChannels = [
        "TestV2Test Middle",
        "TestV2Test Middle 2",
        "Channel 4"
    ];



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


    // Create directory after we know whether we are actually continuing
    // Doesnt really matter in normal conditions, but in testing, its nice
    // to not create all the directories
    createDirectoryIfNotExists(dir);


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

    var connectorEntries = message.getConnectorMessages().entrySet().toArray();

    // Now iterate over the snapshot
    for (var i = 0; i < connectorEntries.length; i++) {
        var record = connectorEntries[i];
        var connector = record.getValue();
        var connectorId = record.getKey();
        var connectorName = connector.getConnectorName();
        var processingState = connector.getStatus() + ''; // coerce to string
        var ReceivedDate = connector.getReceivedDate().getTimeInMillis();
        var SendDate = connector.getSendDate();

        if (connectorName == "Source") {

            // These are transactional level, and transcend connectors
            // Getting them on the source because I know theres only ever one
            saveObj.mapChannel = mapParse(connector.getChannelMap());
            saveObj.mapResponse = mapParse(connector.getResponseMap());

            var ConnectorMap = mapParse(connector.getConnectorMap());
            var SourceMap = mapParse(connector.getSourceMap());

            // The raw data is always available
            var raw = connector.getRawData();
            saveObj.connectors.push({
                connectorId: -1,
                connectorName: "RawSource",
                processingState: "RECEIVED",
                message: raw,
                transmitDate: ReceivedDate,
                estimatedDate: ReceivedDate,
                mapConnector: ConnectorMap,
                mapSource: SourceMap,
                response: response && response.getContent ? response.getContent() : "",
            });

            if (response && response.getContent) {
                logger.info("Response found in global post processor");
                logger.info(response.getContent());
            }

            // Available in most cases, except when message is filtered
            var encoded = connector.getEncodedData();
            if (encoded != null) {
                saveObj.connectors.push({
                    connectorId: connectorId,
                    connectorName: connectorName,
                    processingState: processingState,
                    message: encoded,
                    transmitDate: ReceivedDate,
                    estimatedDate: ReceivedDate,
                    mapConnector: null,
                    mapSource: null,
                    response: null,
                });
            }

            // Exit current loop
            continue;
        }

        // Throw the destinations estimated sent time, this will be the same as what we have today
        // where we dont require the response transformer script
        saveObj.connectors.push({
            connectorId: connectorId,
            connectorName: connectorName,
            processingState: processingState,
            message: null,
            transmitDate: SendDate ? SendDate.getTimeInMillis() : 0,
            estimatedDate: ReceivedDate,
            mapConnector: null,
            mapSource: null,
            response: null
        });


    } // End iterator



    // Save the file
    var jsonString = JSON.stringify(saveObj);
    FileUtil.write(fileName, true, jsonString);

} catch (exceptionVar) {
    logger.error('There is an error with the global postprocessor.');
    logger.error(exceptionVar);
} finally {
}

return;