/*
    Close a connection to a sqlite db

    @param {String} arg1 - arg1 description
    @return {String} return description
	
    History:
    5/8/2024 - tmh
        -Initial Version
*/
function sqliteClose(dbConn) {
    try {

        // Exit if no connection, cant close a null object
        if (typeof dbConn == "undefined" || dbConn == null) {
            return;
        }

        // try closing
        dbConn.close();

    } catch (error) { }
}