/**
 Delete a file.
 
 @param {string} filePath - The path to the file.
 @returns {boolean} - Returns output of the deleteFile command
 */
function fileDelete(filePath) {
    var file = new java.io.File(filePath);
    return FileUtil.deleteFile(file);
}