/*
    This will make sure the file exists, create it if it doesnt already.

    @param {String} arg1 - arg1 description
    @return {String} return description
	
    History:
    5/8/2024 - TMH
     * Initial Version
    5/13/2024 - TMH
        - Added createIfNotExists, if your issuing a select, and the file doesnt 
            exist, you dont really wanna create the file, since the other proc
            which is doing the inserts, creates the table.
*/
function sqliteConnect(path, settings) {
    // Define the settings
    settings = Object.assign({}, {
        username: "",
        password: "",
        createIfNotExists: true,
    }, settings);

    // Create the directory, if you try to save a file and the dir
    // doesnt exist itll error
    var dir = dirNameFromPath(path);
    dirCreateIfNotExists(dir);

    // If the file didnt exist save it
    var existed = fileExists(path);

    // If the file exists 
    // OR
    // If it doesnt exist, but createIfNotExists is true
    var dbConn = null;
    if (existed || (!existed && settings.createIfNotExists)) {

        // This will return the connection and create the db if needed
        dbConn = DatabaseConnectionFactory.createDatabaseConnection('org.sqlite.JDBC', 'jdbc:sqlite:' + path, settings.username, settings.password);
    }


    return {
        conn: dbConn,
        existed: existed,
    };
}