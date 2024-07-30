/*
    Code Template
    Accessible to: All channels response transformer
        
    This script should be called on the response transformer of any destination
    where you would like to save the outbound encoded data, and last activity
    datetime.

    https://docs.nextgen.com/bundle/Mirth_User_Guide_4_5_0/page/connect/connect/topics/c_Response_TransformersResponse_Transformers_connect_ug.html
    Note: Response transformers will only execute if there is an actual response payload to transform. 
    For example if you are using an HTTP Sender destination and it fails to connect to the remote server, 
    then obviously there is no response payload. The one exception to this rule is if the response inbound 
    data type is set to Raw. In that case, because the Raw data type does not need to perform any serialization, 
    the response transformer will always execute even if there is no response payload.
	
    We also have access to responseStatusMessage and responseErrorMessage in this 
    scope if needed.
*/
function fridgeResponseTransformer() {
    // Init information on message and connector
    var messageId = "";
    var connectorId = "";

    try {
        // Where we should save the files
        // We have a `serverInstallDir` stored in the configuration map, because we may have
        // different roots depending on the version of the installation.
        var serverInstallDir = $cfg("serverInstallDir");
        var dir = serverInstallDir + "/_in/channels/system/fridge";

        // Start the timer
        timerStart("conn" + connectorId);

        // Get information on message and connector
        messageId = connectorMessage.getMessageId();
        connectorId = connectorMessage.getMetaDataId();
        //channelName already declared

        // Determine where to save the file and Open file for writing
        var fileName = dir + "/" + channelName + "." + messageId + ".destination." + connectorId + ".json";

        // Build the object to save, match the same keys as the source
        var saveObj = {
            channelId: channelId,
            channelName: channelName,
            messageId: messageId,
            mapChannel: null,
            mapResponse: null,
            connectors: [{
                connectorId: connectorId,
                connectorName: connector,
                processingState: stringFromJava(responseStatus),
                message: connectorMessage.getEncodedData(),
                transmitDate: connectorMessage.getSendDate().getTimeInMillis(),
                mapConnector: mapParse(connectorMessage.getConnectorMap()),
                mapSource: null,
                response: msg,
            }]
        };

        // How long has the script taken to execute
        var execTime = timerStop("conn" + connectorId);
        saveObj.executionTime = execTime;

        // Save the file
        var jsonString = JSON.stringify(saveObj);
        FileUtil.write(fileName, true, jsonString);

    } catch (exceptionVar) {
        logger.error('Error in fridgeResponseTransformer on channel: ' + channelName + ' on connector id: ' + connectorId);
        logger.error(exceptionVar);
    } finally { }

    return;
}