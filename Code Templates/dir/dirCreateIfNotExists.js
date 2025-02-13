/**
 * Creates a directory if it doesn't exist.
 *
 * @param {string} directoryPath - The path to the directory.
 * @returns {boolean} - True if the directory exists (or was successfully created), false otherwise.
 */
function dirCreateIfNotExists(directoryPath) {
    var directory = new java.io.File(directoryPath);

    // Check if the directory exists
    if (!directory.exists()) {
        // Create the directory
        return directory.mkdirs();
    }

    // Directory already exists
    return true;
}