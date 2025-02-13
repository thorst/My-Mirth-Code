/**
 * Checks if a file exists at the specified path.
 *
 * @param {string} filePath - The path to the file.
 * @returns {boolean} - True if the file exists, false otherwise.
 */
function fileExists(filePath) {
    var file = new java.io.File(filePath);
    return file.exists();
}