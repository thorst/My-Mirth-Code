/**
    Given a filename or directory, itll return the directory path

    @param {String} arg1 - arg1 description
    @return {String} return description
	
    History:
    5/8/2024 - TMH
     * Initial Version
*/
function dirNameFromPath(filePath) {
    // Normalize the path to handle both Linux and Windows separators
    var normalizedPath = filePath.replace(/\\/g, '/');

    // Use regular expression to extract the directory path
    var regex = /^(.*\/)[^/]*$/;
    var match = regex.exec(normalizedPath);

    // Check if a match is found
    if (match && match.length > 1) {
        return match[1];
    } else {
        // Handle the case where the path doesn't contain a directory
        return null;
    }
}