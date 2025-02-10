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

    // At this point we have our parameters, lets check if the required ones are
    // there
    if (
        !parameters.hasOwnProperty("template_guid") ||
        !parameters.hasOwnProperty("template_name_old") ||
        !parameters.hasOwnProperty("template_name_new")
    ) {
        throw new Error("Required parameters not set.");
    }

    // First get the code template library
    // Check to see if there is a code template already by this name or id
    var sql = <myxml>
        SELECT *
        FROM code_template
        WHERE
        id = ?
        AND name = ?
        ;
    </myxml>;


    // Execute the query
    var result = db_exec("dbLocalhost", sql.toString(), {
        query_parameters: [
            parameters.template_guid,
            parameters.template_name_old
        ]
    });


    // There can only be one record, so we will grab that
    result.next();

    // Get the revision from the db record
    let revision = result.getString('revision');
    revision = parseInt(revision);
    revision += 1;
    json.revision = revision;

    // Get library code from the db
    let code_template = result.getString('code_template');
    let xml = new XML(code_template);

    // Update the revision 
    xml.revision = revision;
    xml.name = parameters.template_name_new;





    // Lets populate the optional parameters
    parameters = Object.assign({
        lastModified: new Date().getTime(),
        mirthVersion: com.mirth.connect.server.controllers.DefaultConfigurationController.create().getServerVersion()
    }, parameters);




    // Insert the code template into the db
    var sql = <myxml>
        UPDATE code_template
        SET
        name = ?,
        revision = ?,
        code_template = ?
        WHERE
        id = ?
        AND name = ?
        ;
    </myxml>;

    // Execute the query
    var result = db_exec("dbLocalhost", sql.toString(), {
        query_parameters: [
            parameters.template_name_new,
            revision,
            XmlUtil.prettyPrint(xml.toXMLString()),
            parameters.template_guid,
            parameters.template_name_old,
        ]
    });






}
catch (error) {
    json.error = error;
}

// Return
var content = JSON.stringify(json);
channelMap.put('responseContentType', 'application/json');
channelMap.put('responseStatusCode', 200);
responseMap.put('processedResponse', content);
return true;