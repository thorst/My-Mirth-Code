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
        !parameters.hasOwnProperty("oldname") ||
        !parameters.hasOwnProperty("newname")) {
        throw new Error("Required parameters not set.");
    }

    // Get the current lib


    // Check to see if there is a code template already by this name or id
    var sql = <myxml>
        SELECT *
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
            parameters.oldname
        ]
    });


    // There can only be one record, so we will grab that
    result.next();

    // Get the revision from the db record
    let revision = result.getString('revision');
    revision = parseInt(revision);
    revision += 1;

    // Get library code from the db
    let library = result.getString('library');
    let xml = new XML(library);

    // Update the name
    xml.name = parameters.newname;

    // Update the revision 
    xml.revision = revision;

    // Create query to update db
    var sql = <myxml>
        UPDATE code_template_library
        SET
        name = ?,
        library = ?,
        revision = ?
        WHERE
        id = ?
        AND name = ?
        ;
    </myxml>;

    // Execute the query
    var result = db_exec("dbLocalhost", sql.toString(), {
        query_parameters: [
            parameters.newname,
            XmlUtil.prettyPrint(xml.toXMLString()),
            revision,
            parameters.guid,
            parameters.oldname
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