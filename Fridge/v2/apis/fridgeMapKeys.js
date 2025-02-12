/*
    WAPI API Tempalte 
    
    This is the template you should be using when you create a new destination
    which is an api endpoint. Please keep the version in your copy so we know
    what changes there have been.
    
    Template Version: 1
    
    Change Log:
    03/19/2024 TMH -
        - New template, before I just copied and pasted, trying to be more 
            official here, standardize things, and bring things up to newest
            standards.
        
*/




// Starting the response
var json = {
    success: true,
    error: ""
};

// Label our try block for early exit
my_code: try {

    // Currently this method only allows POST or GET
    accept_methods(["Get", "POST"]);

    // Initialize the parameters object
    var parameters = {};

    // If its a GET then the parameters will be in the query string 
    if ($s("method") == "GET") {
        parameters = queryParams();
    }

    // If this is a POST then we just need to get the body and parse 
    // it (its a string)
    if ($s("method") == "POST") {
        parameters = bodyParam();
    }

    // Double check there are parameteres
    if (objectIsEmpty(parameters)) {
        throw new Error("Must send in parameters.");
    }

    // Required Parameters
    if (!parameters.hasOwnProperty("channel_name") ||
        !parameters.hasOwnProperty("connector_name")) {
        throw new Error("Required parameters not set.");
    }




    // Prepare the query parameters
    var queryParams = [
        parameters.channel_name,
        parameters.connector_name
    ];


    var sql = "SELECT   `maps` \
			FROM `fridge_message_history` \
			WHERE `channel_name` = ? \
			  AND `connector_name` = ? \
			  ORDER BY `inserted` DESC \
			LIMIT 1 ;";


    var result = db_exec("dbMirthExt", sql, {
        query_parameters: queryParams
    });
    var keys = [];
    while (result && result.next()) {
        var maps = JSON.parse(result.getString('maps'));
        maps.forEach(function (map) {
            keys.push(map.k);
        });
    }
    //keys.sort();
    keys.sort(function (a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
    });
    json.keys = keys;

} catch (error) {
    json.error = error;
}

// Return
var content = JSON.stringify(json);
channelMap.put('responseContentType', 'application/json');
channelMap.put('responseStatusCode', 200);
responseMap.put('processedResponse', content);
return true;