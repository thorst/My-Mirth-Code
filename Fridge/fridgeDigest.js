// Insert the message into the fridge
var sql = "INSERT INTO fridge_message_history ( \
		message_id,  \
		channel_id, \
		channel_name, \
		connector_id,  \
		connector_name,  \
		send_state,  \
		transmit_time, \
		map_channel,  \
		map_response,  \
		map_source,  \
		map_connector, \
		message,  \
		response) \
	VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";

// Get seconds from epoch, not milli
var transmitDate = msg.connectors[0].transmitDate / 1000;

var param = [
    msg.messageId,
    msg.channelId,
    msg.channelName,
    msg.connectors[0].connectorId,
    msg.connectors[0].connectorName,
    msg.connectors[0].processingState,
    transmitDate,
    JSON.stringify(msg.mapChannel),
    JSON.stringify(msg.mapResponse),
    JSON.stringify(msg.connectors[0].mapSource),
    JSON.stringify(msg.connectors[0].mapConnector),
    msg.connectors[0].message,
    msg.connectors[0].response
];


var result = db_exec("dbMirthExt", sql, { query_parameters: param });
echo("Effected Rows:", result);

// Now insert into the last activity table

return true;