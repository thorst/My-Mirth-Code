/*
    The function you call to execute a query in sqlite

    @param {String} arg1 - arg1 description
    @return {String} return description
*/
function sqliteExec(conn, sql_statement, settings) {

    // Define default parameters
    settings = Object.assign({}, {
        query_parameters: [],
    }, settings);

    // Get the jdbc connection from mirths wrapper
    var connection = conn.getConnection();

    // Pre-define the statement
    var statement = connection.prepareStatement(sql_statement);

    // Define the return object
    var results = [];

    // They didnt send in parameters
    if (settings.query_parameters.length == 0) {

        // Execute the statement and get the results
        results = sqlitePerform(statement, [], settings);

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
            results = results.concat(sqlitePerform(statement, element, settings));
        });
    }

    // Detmine what to return
    return results.length == 1 ? results[0] : results;

}


/*
    This is a sub proc that you shouldnt call directly, it is called from the 
    above proc
*/
function sqlitePerform(statement, parameters, settings) {
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