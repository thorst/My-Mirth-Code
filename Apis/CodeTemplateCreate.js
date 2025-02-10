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
    if (!parameters.hasOwnProperty("library_guid") ||
        !parameters.hasOwnProperty("library_name") ||
        !parameters.hasOwnProperty("template_guid") ||
        !parameters.hasOwnProperty("template_name")
    ) {
        throw new Error("Required parameters not set.");
    }


    // First thing is to check to see if there is a template with this name already
    // Check to see if there is a code template already by this name or id
    var sql = <myxml>
        SELECT
        COUNT(*)
        FROM code_template
        WHERE
        id = ?
        OR name = ?
        ;
    </myxml>;

    // Execute the query
    var result = db_exec("dbLocalhost", sql.toString(), {
        query_parameters: [
            parameters.template_guid,
            parameters.template_name
        ]
    });

    // Get the first result
    result.next();

    // Get the first column (the count of matching rows)
    var length = parseInt(result.getString(1));

    // We found a match so dont insert into the db
    // but its not an error, because the code executed
    // as expected.
    if (length != 0) {
        //json.inserted = false;
        //  json.message = "Code Template Name or Id already exists."
        //break my_code;
        throw "Code Template Name or Id already exists.";
    }




    // First get the code template library
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
            parameters.library_guid,
            parameters.library_name
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

    // Update the revision 
    xml.revision = revision;


    // Lets populate the optional parameters
    parameters = Object.assign({
        lastModified: new Date().getTime(),
        mirthVersion: com.mirth.connect.server.controllers.DefaultConfigurationController.create().getServerVersion(),
        open: "{",
        close: "}"
    }, parameters);

    var code_template = <codeTemplate version={parameters.mirthVersion}>
        <id>{parameters.template_guid}</id>
        <name>{parameters.template_name}</name>
        <revision>1</revision>
        <lastModified>
            <time>{parameters.lastModified}</time>
            <timezone>America/New_York</timezone>
        </lastModified>
        <contextSet>
            <delegate>
                <contextType>SOURCE_RECEIVER</contextType>
                <contextType>DESTINATION_RESPONSE_TRANSFORMER</contextType>
                <contextType>DESTINATION_DISPATCHER</contextType>
                <contextType>SOURCE_FILTER_TRANSFORMER</contextType>
                <contextType>DESTINATION_FILTER_TRANSFORMER</contextType>
            </delegate>
        </contextSet>
        <properties class="com.mirth.connect.model.codetemplates.BasicCodeTemplateProperties">
            <type>FUNCTION</type>
            <code>/*
                Modify the description here. Modify the function name and parameters as needed. One function per
                template is recommended; create a new code template for each new function.

                @param {parameters.open}String{parameters.close} arg1 - arg1 description
                @return {parameters.open}String{parameters.close} return description
                */
                function {parameters.template_name}(arg1) {parameters.open}
	// TODO: Enter code here
                {parameters.close}</code>
        </properties>
    </codeTemplate>;


    // Insert the code template into the db
    var sql = <myxml>
        INSERT INTO code_template
        (id, name, code_template, revision)
        VALUES
        (?, ?, ?, ?)
        ;
    </myxml>;

    // Execute the query
    var result = db_exec("dbLocalhost", sql.toString(), {
        query_parameters: [
            parameters.template_guid,
            parameters.template_name,
            XmlUtil.prettyPrint(code_template.toXMLString()),
            1
        ]
    });

    var short_code_template = <codeTemplate version={parameters.mirthVersion}>
        <id>{parameters.template_guid}</id>
    </codeTemplate>;

    // Now add the new code template to the codeTemplates node
    xml.codeTemplates.appendChild(short_code_template);

    // Create query to update db
    var sql = <myxml>
        UPDATE code_template_library
        SET
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
            XmlUtil.prettyPrint(xml.toXMLString()),
            revision,
            parameters.library_guid,
            parameters.library_name
        ]
    });


}
catch (error) {
    json.error = error;
    json.success = false;
}

// Return
var content = JSON.stringify(json);
channelMap.put('responseContentType', 'application/json');
channelMap.put('responseStatusCode', 200);
responseMap.put('processedResponse', content);
return true;