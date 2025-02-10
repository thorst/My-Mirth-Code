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
        !parameters.hasOwnProperty("lib_guid_old") ||
        !parameters.hasOwnProperty("lib_guid_new") ||
        !parameters.hasOwnProperty("template_guid")
    ) {
        throw new Error("Required parameters not set.");
    }

    // Lets populate the optional parameters
    parameters = Object.assign({
        lastModified: new Date().getTime(),
        mirthVersion: com.mirth.connect.server.controllers.DefaultConfigurationController.create().getServerVersion()
    }, parameters);


    // First get the code template library
    // Check to see if there is a code template already by this name or id
    var sql = <myxml>
        SELECT *
        FROM code_template_library
        WHERE
        id = ?
        ;
    </myxml>;


    // Execute the query
    var result = db_exec("dbLocalhost", sql.toString(), {
        query_parameters: [
            parameters.lib_guid_old
        ]
    });


    // There can only be one record, so we will grab that
    result.next();

    // Get the revision from the db record
    var revision = result.getString('revision');
    revision = parseInt(revision);
    revision += 1;

    // Get library code from the db
    var code_template_lib = result.getString('library');
    var xml = new XML(code_template_lib);

    // Update the revision 
    xml.revision = revision;
    xml.lastModified.time = parameters.lastModified;


    // Find the codeTemplate element with the matching ID
    var codeTemplateToRemove = xml.codeTemplates.codeTemplate.(id == parameters.template_guid);

    // Check if the codeTemplate element was found
    if (codeTemplateToRemove.length() > 0) {
        json.found = true;
        // Remove the codeTemplate element
        delete codeTemplateToRemove[0];
    }

    // Insert the code template into the db
    var sql = <myxml>
        UPDATE code_template_library
        SET
        revision = ?,
        library = ?
        WHERE
        id = ?
        ;
    </myxml>;

    // Execute the query
    var result = db_exec("dbLocalhost", sql.toString(), {
        query_parameters: [
            revision,
            XmlUtil.prettyPrint(xml.toXMLString()),
            parameters.lib_guid_old,
        ]
    });
    json.oldguid = xml.toXMLString();

    /*
        NOW MOVING ON TO THE NEW LIBRARY
    */

    // First get the code template library
    // Check to see if there is a code template already by this name or id
    var sql = <myxml>
        SELECT *
        FROM code_template_library
        WHERE
        id = ?
        ;
    </myxml>;


    // Execute the query
    var result = db_exec("dbLocalhost", sql.toString(), {
        query_parameters: [
            parameters.lib_guid_new
        ]
    });


    // There can only be one record, so we will grab that
    result.next();

    // Get the revision from the db record
    var revision = result.getString('revision');
    revision = parseInt(revision);
    revision += 1;

    // Get library code from the db
    var code_template_lib = result.getString('library');
    var xml = new XML(code_template_lib);

    // Update the revision 
    xml.revision = revision;
    xml.lastModified.time = parameters.lastModified;


    var short_code_template = <codeTemplate version={parameters.mirthVersion}>
        <id>{parameters.template_guid}</id>
    </codeTemplate>

    // Now add the new code template to the codeTemplates node
    xml.codeTemplates.appendChild(short_code_template);


    // Insert the code template into the db
    var sql = <myxml>
        UPDATE code_template_library
        SET
        revision = ?,
        library = ?
        WHERE
        id = ?
        ;
    </myxml>;

    // Execute the query
    var result = db_exec("dbLocalhost", sql.toString(), {
        query_parameters: [
            revision,
            XmlUtil.prettyPrint(xml.toXMLString()),
            parameters.lib_guid_new,
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