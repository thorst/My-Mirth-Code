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



    // Your Code Here

    // At this point we have our parameters, lets check if the required ones are
    // there
    if (!parameters.hasOwnProperty("guid") ||
        !parameters.hasOwnProperty("name")) {
        throw new Error("Required parameters not set.");
    }

    // Check to see if there is a code template already by this name or id
    var sql = <myxml>
        DELETE
        FROM code_template_library
        WHERE
        id = ?
        AND name = ?
        ;
    </myxml>;

    // Execute the query
    var result = db_exec("dbLocalhost", sql.toString(), {
        query_parameters: [
            parameters.guid,
            parameters.name
        ]
    });

} catch (error) {
    json.error = error;
}

// Return
var content = JSON.stringify(json);
channelMap.put('responseContentType', 'application/json');
channelMap.put('responseStatusCode', 200);
responseMap.put('processedResponse', content);
return true;