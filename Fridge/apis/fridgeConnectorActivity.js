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

    // Define and execute query 
    var sql = "SELECT * FROM `last_activity`;";
    var result = db_exec("dbMirthExt", sql);

    // Loop over each db record and show into an array of objects
    var activities = [];
    while (result && result.next()) {

        // Actual is nullaable, so if its NOT null or 0, turn into milliseconds
        var actual = result.getString('actual_transmit');
        if (actual != null && actual != 0) {
            actual = parseInt(actual) * 1000;
        }

        // And push to array
        activities.push({
            channel_id: result.getString('channel_id'),
            channel_name: result.getString('channel_name'),
            connector_id: parseInt(result.getString('connector_id')),
            connector_name: result.getString('connector_name'),
            estimated_transmit: parseInt(result.getString('estimated_transmit')) * 1000,
            actual_transmit: actual,
        });
    }

    // Next we want to conform this to the output that steve is expecting

    // Needed variables
    var results = [];
    var lastChannel = "";
    var curObj = {
        name: "",
        channel_id: "",
        connectors: [],
    };

    // For each record
    activities.forEach(function (activity) {

        // If this is a new channel, commit it to the results
        if (lastChannel != "" && lastChannel != activity.channel_id) {
            results.push(curObj);
            curObj = {
                name: "",
                channel_id: "",
                connectors: [],
            };
        }

        // Add the data to be inserted once this channel is complete
        // This is needed because each connector is on its own row in the db
        // but we are returning as one object at the channel level, so we 
        // need to combine all the connectors into one larger object
        lastChannel = activity.channel_id;
        curObj["name"] = activity.channel_name;
        curObj["channel_id"] = activity.channel_id;
        curObj["connectors"].push({
            name: activity.connector_name,
            metadata_id: activity.connector_id,
            receivedDate: activity.estimated_transmit,
            sendDate: activity.actual_transmit || activity.estimated_transmit,
        });
    });

    // Push the last one
    results.push(curObj);

    // Return data in response
    json.results = results;


} catch (error) {
    json.error = error;
}

// Return
var content = JSON.stringify(json);
channelMap.put('responseContentType', 'application/json');
channelMap.put('responseStatusCode', 200);
responseMap.put('processedResponse', content);
return true;