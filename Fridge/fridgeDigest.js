var debug = false;

// Convert the maps to one JSON object
var mapLoop = {
    "channel": msg.mapChannel,
    "response": msg.mapResponse,
    "source": msg.connectors[0].mapSource,
    "connector": msg.connectors[0].mapConnector
};
var maps = [];
Object.keys(mapLoop).forEach(function (map) {
    var mapV = mapLoop[map];
    if (mapV == null) {
        return;
    }
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
var sql = "INSERT INTO fridge_message_history ( message_id,  channel_id, channel_name, connector_id,  connector_name,  send_state,  transmit_time, maps, message,  response) \
VALUES ('" + msg.messageId + "', '" + msg.channelId + "', '" + msg.channelName + "', '" + msg.connectors[0].connectorId + "', '" + msg.connectors[0].connectorName + "', '" + msg.connectors[0].processingState + "', " + (msg.connectors[0].transmitDate / 1000) + ", '" + JSON.stringify(maps) + "', '" + msg.connectors[0].message + "', '" + msg.connectors[0].response + "');";

msg.connectors.forEach(function (conn) {
    var field_list = "channel_id, channel_name, connector_id, connector_name, updated";
    var value_list = "'" + msg.channelId + "', '" + msg.channelName + "', '" + conn.connectorId + "', '" + conn.connectorName + "', NOW()";
    var duplicate_list = "";

    if (typeof conn.transmitDate != "undefined" && conn.transmitDate != 0) {
        field_list += ", actual_transmit";
        value_list += ", " + Math.floor(conn.transmitDate / 1000);
        duplicate_list += " actual_transmit = VALUES(actual_transmit), ";
    }

    if (typeof conn.estimatedDate != "undefined" && conn.estimatedDate != 0) {
        field_list += ", estimated_transmit";
        value_list += ", " + Math.floor(conn.estimatedDate / 1000);
        duplicate_list += " estimated_transmit = VALUES(estimated_transmit), ";
    }

    sql += "INSERT INTO last_activity (" + field_list + ") VALUES (" + value_list + ") ON DUPLICATE KEY UPDATE " + duplicate_list + " updated = NOW();";
});

if (debug) {
    echo("Executing combined SQL:");
    echo(sql);
}

// Execute the combined SQL
var result = db_exec("dbMirthExt", sql);

if (debug) {
    echo("Effected Rows:" + result);
}

return true;