/*
    WAPI API Template 
    
    This is the template you should be using when you create a new destination
    which is an api endpoint. Please keep the version in your copy so we know
    what changes there have been.
    
    Template Version: 1
    
    Change Log:
    12/19/2024 - Initial version

    Required parameters:
    channel_name
    connector_name

    Optional Parameters without defaults:
    start_time
    end_time
    text search
    count
    filters
    send_state 

    Optional Parameters with defaults:
    limit: 50
    offset: 0
        
*/

// Starting the response
var json = {
    success: true,
    error: ""
};

// Label our try block for early exit
my_code: try {

    // Currently this method only allows POST or GET
    accept_methods(["GET", "POST"]);

    // Initialize the parameters object
    var parameters = {};

    // If it's a GET then the parameters will be in the query string 
    if ($s("method") == "GET") {
        parameters = queryParams();
    }

    // If this is a POST then we just need to get the body and parse 
    // it (it's a string)
    if ($s("method") == "POST") {
        parameters = bodyParam();
    }

    // Double check there are parameters
    if (objectIsEmpty(parameters)) {
        throw new Error("Must send in parameters.");
    }

    // Required Parameters
    if (!parameters.hasOwnProperty("channel_name") ||
        !parameters.hasOwnProperty("connector_name")) {
        throw new Error("Required parameters not set.");
    }

    // Optional Parameters, with defaults
    if (!parameters.hasOwnProperty("limit")) {
        parameters.limit = 50;
    }
    if (!parameters.hasOwnProperty("offset")) {
        parameters.offset = 0;
    }

    // Check if count is requested
    var countOnly = parameters.hasOwnProperty("count") && parameters.count === true;

    // Function to validate and sanitize limit and offset
    function validateAndSanitize(value, defaultValue) {
        var intValue = parseInt(value, 10);
        if (isNaN(intValue) || intValue < 0) {
            return defaultValue;
        }
        return intValue;
    }

    var limit = validateAndSanitize(parameters.limit, 50); // Default to 50 if invalid
    var offset = validateAndSanitize(parameters.offset, 0); // Default to 0 if invalid

    // Prepare the query parameters
    var queryParams = [
        parameters.channel_name,
        parameters.connector_name
    ];

    var sql = "SELECT " + (countOnly ? "COUNT(*) AS total_count" : "`fridge_message_history_id`, `message_id`, `send_state`, `transmit_time`, `maps`, `inserted`") + " \
               FROM `fridge_message_history` \
               WHERE `channel_name` = ? \
                 AND `connector_name` = ? ";

    // Add conditions for start_time and end_time if provided
    if (parameters.start_time) {
        sql += " AND `transmit_time` >= ? ";
        queryParams.push(parameters.start_time);
    }
    if (parameters.end_time) {
        sql += " AND `transmit_time` <= ? ";
        queryParams.push(parameters.end_time);
    }
    // Add condition for send_state if provided
    if (parameters.send_state && Array.isArray(parameters.send_state) && parameters.send_state.length > 0) {
        var placeholders = parameters.send_state.map(() => '?').join(',');
        sql += "AND `send_state` IN (" + placeholders + ") ";
        queryParams = queryParams.concat(parameters.send_state);
    }

    // Add condition for text_search if provided
    if (parameters.text_search) {
        sql += " AND `message` LIKE ? ";
        queryParams.push('%' + parameters.text_search + '%');
    }

    // Add conditions for JSON filters if provided
    if (parameters.filters && Array.isArray(parameters.filters) && parameters.filters.length > 0) {
        parameters.filters.forEach(function (filter) {
            var condition = "";

            switch (filter.operator) {
                case '=':
                    condition = "JSON_CONTAINS(maps, ?, '$')";
                    queryParams.push(JSON.stringify({ k: filter.key, v: filter.value }));
                    break;
                case '!=':
                    condition = "NOT JSON_CONTAINS(maps, ?, '$')";
                    queryParams.push(JSON.stringify({ k: filter.key, v: filter.value }));
                    break;
                case 'contains':
                    condition = "JSON_UNQUOTE(JSON_EXTRACT(maps, '$[*].v')) LIKE ?";
                    queryParams.push("%" + filter.value + "%");
                    break;
                case 'does not contain':
                    condition = "JSON_UNQUOTE(JSON_EXTRACT(maps, '$[*].v')) NOT LIKE ?";
                    queryParams.push("%" + filter.value + "%");
                    break;
                case 'starts with':
                    condition = "JSON_UNQUOTE(JSON_EXTRACT(maps, '$[*].v')) LIKE ?";
                    queryParams.push(filter.value + "%");
                    break;
                case 'does not start with':
                    condition = "JSON_UNQUOTE(JSON_EXTRACT(maps, '$[*].v')) NOT LIKE ?";
                    queryParams.push(filter.value + "%");
                    break;
                case 'ends with':
                    condition = "JSON_UNQUOTE(JSON_EXTRACT(maps, '$[*].v')) LIKE ?";
                    queryParams.push("%" + filter.value);
                    break;
                case 'does not end with':
                    condition = "JSON_UNQUOTE(JSON_EXTRACT(maps, '$[*].v')) NOT LIKE ?";
                    queryParams.push("%" + filter.value);
                    break;
                default:
                    throw new Error("Invalid operator");
            }

            sql += "AND " + condition + " ";
        });
    }

    if (!countOnly) {
        sql += " ORDER BY `message_id` DESC \
                 LIMIT " + limit + " \
                 OFFSET " + offset + ";";
    }

    //    echo(sql);
    //    echo(queryParams);
    //return true;
    var result = db_exec("dbMirthExt", sql, {
        query_parameters: queryParams
    });

    if (countOnly) {
        if (result && result.next()) {
            json.total_count = result.getInt('total_count');
        }
    } else {
        var headers = [];
        while (result && result.next()) {
            headers.push({
                fridge_message_history_id: parseInt(result.getString('fridge_message_history_id')),
                message_id: parseInt(result.getString('message_id')),
                send_state: result.getString('send_state'),
                transmit_time: parseInt(result.getString('transmit_time')),
                maps: result.getString('maps'),
                inserted: result.getString('inserted'),
            });
        }
        json.headers = headers;
    }

} catch (error) {
    json.error = error;
}

// Return
var content = JSON.stringify(json);
channelMap.put('responseContentType', 'application/json');
channelMap.put('responseStatusCode', 200);
responseMap.put('processedResponse', content);
return true;