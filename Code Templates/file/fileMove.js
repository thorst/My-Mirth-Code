/**
 Move a file.
 
 @param {string} filePath - The path to the file.
 @param {string} newPath - The path of the new location for the file.
 */
function fileMove(filePath, newPath) {
    FileUtil.write(newPath, false, FileUtil.readBytes(filePath));
    fileDelete(filePath);
}