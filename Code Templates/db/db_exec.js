/**
    db_exec
    
    This houses all the database functions for mirth, because only db_exec should be called.
    The other functions are for internal use only. This is the second iteration of db functions
    from me. The first one was a single proc called db_execute. These functions supercede that 
    function in every way.
	

    Parameters:
    
        @param {String}             settingsName    - This is the key of a db setting in configuration map
        @param {String}             statement
        @param {Boolean}            isQuery         - Default:true; Do you want results back
        @param {java.ArrayList}     paramList       - Arguments you are passing
        @param {Boolean}            isglobalConn	- Default:true; Do you want this connection to stay open and be reused
        
        @return {String}                            - return list of results from query
    

    
    Examples:
    
        Beacuse of the number of examples and size of the library Ive moved documentation to the EI Onenote
        Documentation > Mirth > Code Tmpl Docs > db_exec
        
        Here is the direct link:
        https://wellspan.sharepoint.com/sites/EnterpriseIntegration/_layouts/15/Doc.aspx?sourcedoc={f416ae9f-eda5-4642-a390-f7f591c5dbbf}&action=edit&wd=target%28DOCUMENTATION%2FMirth%2FCode%20Tmpl%20Docs.one%7Cd593fb58-6a64-4545-8ecb-aff076807d19%2Fdb_exec%7Ca62202f2-2b1c-43d9-85e3-f17eba196727%2F%29&wdorigin=703


    Tutorial for use in java:
        https://www.tutorialspoint.com/jdbc/jdbc-db-connections.htm
    
    Code heavily borrowed from:
        https://forums.mirthproject.io/forum/mirth-connect/support/16507-configuration-map?p=93365#post93365
    
    Mirths built in java methods:
        https://github.com/nextgenhealthcare/connect/blob/02232293c65921082678f0c05d913cf6eff2d903/server/src/com/mirth/connect/server/userutil/DatabaseConnection.java#L136
	
    Version History:
        11/11/2020 TMH
            -Initial, named db_execute
        01/19/2024 TMH
            -Added ability to send timeout with query
            -Added ability to dictate if channel is shut down (default to NOT shut down)
            -Added ability loop to ensure you get the data you need (previoulsy it tried 2 times)
            -Added sleep between executions - we are still learning how sleep effects mirth
            -Added ability to have an array (of arrays) of parameters for your query
            -Removed need to send in if data is returned. I will detect this and return data if there is any.
            -Changed parameters for query to be native js (previously was a java list)
            -Created examples, previously had just a select and an update
                -Added Parameterized queries select
                -Added Parameterized queries select with multplie parameter sets
                -Added Parameterized Update
                -Added Timeouts
                -Added Multiple queries in one
                -Added calling stored procedure without parameters
                -Added calling stored procedure with parameters
                -Added query with a sub query in a loop
                -Moved to onenote
        5/14/2024 TMH
            -Added timeout default. Change from null to 30 seconds


*/

importPackage(Packages.java.sql); //prepareStatement
importPackage(Packages.org.apache.commons.dbutils); //DbUtils


function db_exec(connection_name, sql_statement, settings) {

    // Define default parameters
    settings = Object.assign({}, {

        // If you want your persistent connection to be at the channel level, set to false
        global_connection: true,

        // If you have a parameterized query, this should be an array of arrays. Consult samples.
        // Because of the way the code is structured, with a loop over this value, I will default
        // it, and if its still the default, it will be ignored and not sent to the query
        query_parameters: [],

        // The number of milliseconds to sleep between queries
        sleep: null,

        // The time allotted for the query to execute, default is set by the server
        // Was null, but its possible that maybe some servers arent set or something
        // so we do this on our side now, now sure if this is long enough.
        // This should be in seconds.
        timeout: 30,

        // NOT RECOMENDED. Shutting a channel down usually causes confusion
        shut_down: false,

        // Keep trying until query is successful
        loop: true,

        // We dont loop in non-prod environments
        isProd: serverIsProd(),

    }, settings);


    // Quick check to ensure the connection_name is found in config
    if (typeof $cfg(connection_name) == "undefined") {
        throw new Error('The connection name was not found in the config');
    }


    // Get persistent connection to use, channel or server level
    var dbConn = settings["global_connection"] ? $g(connection_name) : $gc(connection_name);
    var connection = null;

    do {

        // If its not connected we will go ahead and do that awhile
        if (typeof dbConn == "undefined" || dbConn == null) {
            dbConn = db_connect(connection_name, settings)
        }


        // Get the jdbc connection from mirths wrapper
        connection = dbConn.getConnection();

        // Pre-define the statement
        var statement = null;

        // Did you know you can label any block, and this allows me  
        // to break; if needed.
        c_execute: try {

            // Exit if no connection
            if (typeof dbConn == "undefined" || dbConn == null) {
                break c_execute;
            }


            statement = connection.prepareStatement(sql_statement);

            // Add timeout
            if (settings.timeout != null) {
                statement.setQueryTimeout(settings.timeout);
            }

            // Define the return object
            var results = [];

            // They didnt send in parameters
            if (settings.query_parameters.length == 0) {

                // Execute the statement and get the results
                results = db_perform(statement, [], settings);

            }

            // If they sent parameters
            if (settings.query_parameters.length > 0) {

                // First get the first parameter
                var first = settings.query_parameters[0];
                var type = varType(first);

                // If its not an array of arrays, wrap it
                if (type != "Array") {
                    settings.query_parameters = [settings.query_parameters];
                }

                // For each group of parameters
                settings.query_parameters.forEach(function (element, i) {

                    // Using concat, we create a nice flat array of reults
                    // No matter if this one query returns multiple data sets
                    // or there are multiple parameter sets, or any combination thereof
                    results = results.concat(db_perform(statement, element, settings));
                });
            }

            // Detmine what to return
            return results.length == 1 ? results[0] : results;



        } catch (error) {
            if (!settings.isProd) {
                echo(error);
            }
        } finally {

            // Clean up the statement handle
            try {
                DbUtils.closeQuietly(statement);
            } catch (exceptionVar) { }

        }

        // Query failed, lets try to connect again

        // But first lets close the previous connection
        db_close(dbConn, !settings.isProd);

        // Try to connect to the db again if we made it this far
        dbConn = db_connect(connection_name, settings)

        // Sleep if the user wants it
        if (settings["sleep"] != null) {
            sleep(settings["sleep"]);
        }

        // Loop in prod if desired (default)
    } while (settings.isProd && settings.loop);
}



/*
    db_connect
    
    Do not call this function directly. Call db_exec.
    
    This will attempt to connect to a server. It saves the 
    persistent connection to the globalMap or globalChannelMap
    depeding on your settings.
    
    It will also shut down the channel if your settings tell it
    this is not recomended as people dont ever think about the 
    db going down as the cause for a channel shutting down.
*/
function db_connect(connection_name, settings) {

    try {
        // Testing persistent connection
        echo("The connection needs reestablished");

        // Get settings from config, and connect
        var dbSettings = JSON.parse($cfg(connection_name).toString());
        dbConn = DatabaseConnectionFactory.createDatabaseConnection(dbSettings.driver, dbSettings.address, dbSettings.username, dbSettings.password);

        // Connection was successful
        echo("The connection was reestablished");

        // If successful, put new connection in global channel map
        settings["global_connection"] ? $g(connection_name, dbConn) : $gc(connection_name, dbConn);

        // Return dbConn if successfully connected
        return dbConn;

    } catch (error) {
        echo("The connection failed. Usually thats a bad connection string, but if your sure thats right, it must be a firewall?");

        // If this is not prod, then show the error with connecting
        if (!settings.isProd) {
            echo(error);
        }

        // If they want to shut down the channel go ahead and do that now
        if (settings["shut_down"]) {

            // If we falied this time, then shut the channel down, and return null
            ChannelUtil.stopChannel(channelId);

            // Does this maintain that last message? or did it process it?
            // If it processes it, we may need to error here, if user wants
            // that behavoir, so they don't lose a transaction.
            return null;

        }

    }
    return false;
}



/*
    db_perform
    
    Do not call this function directly. Call db_exec.
    
    Execute one query. The statement will already have
    the query and other settings in place, but we split
    this into a sub function, because you could be passing
    an array of parameters which will get looped over in the
    calling proc. In this case the same statement would be
    reused, but the parameters for each will make it unique.
*/
function db_perform(statement, parameters, settings) {

    // Init return array
    var results = [];

    // Add any query parameters that are avialable
    parameters.forEach(function (o, i) {
        statement.setObject(i + 1, o);
    });

    // Execute the query 
    var hasResults = statement.execute();

    // Loop over any result sets
    do {

        if (hasResults) {
            // There were results. If they wanted them cached we will
            // copy what mirth was doing to cache.

            var result = statement.getResultSet(); // Get results
            var crs = new MirthCachedRowSet(); // Declare a new Java CachedRowSet datatype
            crs.populate(result); // Populate the cachedrowset with the records
            DbUtils.closeQuietly(result); // Close the result set
            results.push(crs);

        } else {
            // There wasnt any data returned so we get how many 
            // rows were effected

            results.push(statement.getUpdateCount());

        }

        // Get boolean stating if there are more results to be had
        hasResults = statement.getMoreResults();

    } while (hasResults);

    // Return the array of results
    return results;
}



/*
    db_close
    
    Do not call this function directly. Call db_exec.

    Attempt to close a connection for cleanliness.
*/
function db_close(dbConn, settings) {
    try {

        // Exit if no connection, cant close a null object
        if (typeof dbConn == "undefined" || dbConn == null) {
            return;
        }

        // try closing
        dbConn.close();

    } catch (error) {

        // If they want to see errors then
        if (!settings.isProd) {
            echo(error);
        }
    }
}