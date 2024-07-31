// Convert the maps to one json object
var mapLoop = {
    "channel": msg.mapChannel,
    "response": msg.mapResponse,
    "source": msg.connectors[0].mapSource,
    "connector": msg.connectors[0].mapConnector
};
var maps = [];
Object.keys(mapLoop).forEach(function (map) {
    var mapV = mapLoop[map];
    Object.keys(mapV).forEach(function (key) {
        var v = mapV[key];
        maps.push({
            k: key,
            v: v,
            map: map
        });
    });
});

// Build query to insert the message into the fridge
var sql = "INSERT INTO fridge_message_history ( \
		message_id,  \
		channel_id, \
		channel_name, \
		connector_id,  \
		connector_name,  \
		send_state,  \
		transmit_time, \
		maps,  \
		message,  \
		response) \
	VALUES (?,?,?,?,?,?,?,?,?,?)";

// Get seconds from epoch, not milli
var transmitDate = msg.connectors[0].transmitDate / 1000;

// Build param list
var param = [
    msg.messageId,
    msg.channelId,
    msg.channelName,
    msg.connectors[0].connectorId,
    msg.connectors[0].connectorName,
    msg.connectors[0].processingState,
    transmitDate,
    JSON.stringify(maps),
    msg.connectors[0].message,
    msg.connectors[0].response
];

// Insert into message history
var result = db_exec("dbMirthExt", sql, { query_parameters: param });
echo("Effected Rows:", result);

// Now insert into the last activity table
var activitySQL = "INSERT INTO last_activity \
                        (channel_id, channel_name, connector_id, connector_name, estimated_transmit, actual_transmit) \
                    VALUES \
                        (?,?,?,?,?,?) \
                    ON DUPLICATE KEY UPDATE \
                    channel_name = VALUES(channel_name), \
                        connector_name = VALUES(connector_name), \
                        estimated_transmit = VALUES(estimated_transmit), \
                        actual_transmit = VALUES(actual_transmit);";

// Build param list
var activityParam = [
    msg.channelId,
    msg.channelName,
    msg.connectors[0].connectorId,
    msg.connectors[0].connectorName,
    transmitDate
];

return true;