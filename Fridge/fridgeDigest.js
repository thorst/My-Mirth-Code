
var debug = false;

// Convert the maps to one json object
var mapLoop = {
    "channel": msg.mapChannel,
    "response": msg.mapResponse,
    "source": msg.connectors[0].mapSource,
    "connector": msg.connectors[0].mapConnector
};
var maps = [];
Object.keys(mapLoop).forEach(function (map) {

    // Sometimes the map is empty
    var mapV = mapLoop[map];
    if (mapV == null) {
        return;
    }

    // Create a standardized object for db field
    Object.keys(mapV).forEach(function (key) {
        var v = mapV[key];
        maps.push({
            k: key,
            v: v.toString(),
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

if (debug) {
    echo("Inserting into the message history.");
    echo(sql);
    echo(param);
    echo(db_DebugQuery(sql, param));
}

// Insert into message history
var result = db_exec("dbMirthExt", sql, { query_parameters: param });

if (debug) {
    echo("Effected Rows:" + result);
}



msg.connectors.forEach(function (conn) {

    // Build param list
    var activityParam = [
        msg.channelId,
        msg.channelName,
        conn.connectorId,
        conn.connectorName,
    ];

    // Default values
    var duplicate_list = "";
    var field_list = "channel_id, channel_name, connector_id, connector_name, updated";
    var value_list = "?,?,?,?,NOW()";

    // If there is a transmitDate that means this connector doesn't use queueing so we will add it
    // to the query
    if (typeof conn.transmitDate != "undefined" && conn.transmitDate != 0) {
        activityParam.push(Math.floor(conn.transmitDate / 1000));
        duplicate_list += " actual_transmit = CASE WHEN VALUES(actual_transmit) > actual_transmit THEN VALUES(actual_transmit) ELSE actual_transmit END, ";
        field_list += ", actual_transmit";
        value_list += ",?";
    }

    if (typeof conn.estimatedDate != "undefined" && conn.estimatedDate != 0) {
        activityParam.push(Math.floor(conn.estimatedDate / 1000));
        duplicate_list += " estimated_transmit = CASE WHEN VALUES(estimated_transmit) > estimated_transmit THEN VALUES(estimated_transmit) ELSE estimated_transmit END, ";
        field_list += ", estimated_transmit";
        value_list += ",?";
    }

    // Now insert into the last activity table
    var activitySQL = "INSERT INTO last_activity \
	                        ("+ field_list + ") \
	                    VALUES \
	                        ("+ value_list + ") \
	                    ON DUPLICATE KEY UPDATE \
	                        channel_name = VALUES(channel_name), \
	                        connector_name = VALUES(connector_name), \
	                        " + duplicate_list + " \
	                        updated = CASE WHEN VALUES(actual_transmit) > actual_transmit OR VALUES(estimated_transmit) > estimated_transmit THEN NOW() ELSE updated END;";

    if (debug) {
        echo("About to insert connector activity.");
        echo(activitySQL);
        echo(activityParam);
        echo(db_DebugQuery(activitySQL, activityParam));
    }

    // Do the insert for this connector
    var result = db_exec("dbMirthExt", activitySQL, { query_parameters: activityParam });

    if (debug) {
        echo("con: " + conn.connectorId + " Effected Rows:" + result);
    }
});



return true;