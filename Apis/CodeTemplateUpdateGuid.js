/*
    This will Update the list of enabled, disabled channels as well as the 
    apply to new channels boolean. It will clear these values and put in
    what you send in. Its not an add or subtract, its an overwrite. That said,
    if nothing is listed in the enabled or disabled channels, mirth defaults it
    to being disabled everywhere. So it doesnt REALLY seem like disabled channels
    is being used. But I will populate it because thats what mirth does.
    
    Template Version: 1
    
    Method(s):
        POST
    
    Required Parameters:
        lib_id - string - the guid of the code template library that you are editing
        channels_enabled - array - guids of channels that have access to this code template library
        channels_disabled - array - guids of channels that will NOT have access to this code template library
        channels_new - boolean - will new channels have access to this channel?
        
    
    Change Log:
    03/19/2024 TMH -
        - Given a name and guid itll delete a code template lib
        
*/

//JsonUtil.toXml(jsonString)
//XmlUtil.toJson(xmlString)

// Starting the response
var json = {
    success: true,
    error: ""
};

// Label our try block for early exit
my_code: try {

    // Currently this method only allows POST or GET
    accept_methods(["POST"]);

    // Initialize the parameters object
    var parameters = {};

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
        !parameters.hasOwnProperty("lib_id") ||
        !parameters.hasOwnProperty("channel_name") ||
        !parameters.hasOwnProperty("new_id")
    ) {
        throw new Error("Required parameters not set.");
    }

    // var populate the optional parameters
    parameters = Object.assign({
        lastModified: new Date().getTime(),
        mirthVersion: com.mirth.connect.server.controllers.DefaultConfigurationController.create().getServerVersion()
    }, parameters);



    // Verify the new guid doesnt exist
    var sql = <myxml>
        SELECT *
        FROM code_template
        WHERE
        id = ?
        ;
    </myxml>;


    // Execute the query
    var result = db_exec("dbLocalhost", sql.toString(), {
        query_parameters: [
            parameters.new_id
        ]
    });

    if (result.size() > 0) {
        throw "New UUID is taken";
    }

    json.here = 1;

    // Now get the code template 
    var sql = <myxml>
        SELECT *
        FROM code_template
        WHERE
        name = ?
        ;
    </myxml>;

    var result = db_exec("dbLocalhost", sql.toString(), {
        query_parameters: [
            parameters.channel_name
        ]
    });

    if (result.size() > 1) {
        throw "More than one template with this name";
    }


    // There can only be one record, so we will grab that
    result.next();

    // Get the revision from the db record
    var revision = result.getString('revision');
    revision = parseInt(revision);
    revision += 1;
    //json.revision = revision;

    // Get library code from the db
    var code_template = result.getString('code_template');
    var xml = new XML(code_template);
    var old_code_template_id = xml.id;

    // Update the revision 
    xml.revision = revision;
    xml.id = parameters.new_id;

    json.here = 2;

    // Insert the code template into the db
    var sql = <myxml>
        UPDATE code_template
        SET
        revision = ?,
        code_template = ?,
        id = ?
        WHERE
        name = ?
        ;
    </myxml>;
    var result = db_exec("dbLocalhost", sql.toString(), {
        query_parameters: [
            revision,
            XmlUtil.prettyPrint(xml.toXMLString()),
            parameters.new_id,
            parameters.channel_name
        ]
    });

    json.here = 3;

    // now grab library
    // Now update the library
    var sql = <myxml>
        SELECT name, revision, library
        FROM code_template_library
        WHERE
        id = ?
        ;
    </myxml>;

    // Execute the query
    var result = db_exec("dbLocalhost", sql.toString(), {
        query_parameters: [
            parameters.lib_id,
        ]
    });

    // There can only be one record, so we will grab that
    result.next();

    // Get the revision from the db record
    var revision = result.getString('revision');
    revision = parseInt(revision);
    revision += 1;

    // Get library code from the db
    var code_template = result.getString('library');
    var xml = new XML(code_template);

    // Update the revision 
    xml.revision = revision;


    for each(codeTemplate in xml.codeTemplates.children()) {
        if(codeTemplate.id == old_code_template_id) {
            codeTemplate.id = parameters.new_id;
        }
    }




    // Now update the library
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
        parameters.lib_id,
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