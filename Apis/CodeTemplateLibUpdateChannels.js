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
        !parameters.hasOwnProperty("channels_enabled") ||
        !parameters.hasOwnProperty("channels_disabled") ||
        !parameters.hasOwnProperty("channels_new")
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
            parameters.lib_id
        ]
    });


    // There can only be one record, so we will grab that
    result.next();

    // Get the revision from the db record
    let revision = result.getString('revision');
    revision = parseInt(revision);
    revision += 1;

    // Get library code from the db
    let code_template = result.getString('library');
    let xml = new XML(code_template);

    // Update the revision 
    xml.revision = revision;
    xml.includeNewChannels = parameters.channels_new;
    xml.lastModified.time = parameters.lastModified;

    // Find the disabledChannelIds node, and remove children
    // var disabledChannelIds = xml.disabledChannelIds;
    // for each (channel in xml.disabledChannelIds.children()) {
    //     delete channel;
    // }

    //json.disabledChannelIdCount = disabledChannelIds.children().length();

    //disabledChannelIds.children().remove();
    // for (var i = disabledChannelIds.children().length() - 1; i >= 0; i--) {
    //     //disabledChannelIds.children()[i].remove();
    //     //json.x = disabledChannelIds[i].toXMLString();
    //     // Remove each child node
    //     // disabledChannelIds[i].remove();
    //     echo("remove " + disabledChannelIds.children()[i].toXMLString() );

    //     disabledChannelIds.children()[i].remove();
    // }

    // Find the enabledChannelIds node, and remove children
    //var enabledChannelIds = xml.enabledChannelIds;
    delete xml.enabledChannelIds;
    delete xml.disabledChannelIds;


    // Create an empty node named "emptyNode"
    //var emptyNode = ;

    // Append the empty node as a child of the enabledChannelIds node
    xml.appendChild(<enabledChannelIds />);
    xml.appendChild(<disabledChannelIds />);

    // .addChild('enabledChannelIds');
    // xml.addChild('disabledChannelIds');

    //  for each (channel in xml.enabledChannelIds.children()) {
    //     delete channel;
    // }
    //enabledChannelIds.children().remove();
    // for (var i = enabledChannelIds.children().length() - 1; i >= 0; i--) {
    //     // Remove each child node
    //     ///enabledChannelIds[i].remove();
    //   // enabledChannelIds.children()[i].remove();
    // }

    json.current = xml.toXMLString();



    // Now loop over these two and add them back in

    parameters.channels_enabled.forEach(function (guid) {

        // Populate the template and append to list
        var enaTemplate = <string>{guid}</string>;
        xml.enabledChannelIds.appendChild(enaTemplate);

    });

    parameters.channels_disabled.forEach(function (guid) {

        // Populate the template and append to list
        var enaTemplate = <string>{guid}</string>;
        xml.disabledChannelIds.appendChild(enaTemplate);

    });



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