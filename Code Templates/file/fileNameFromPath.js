/*
    Modify the description here. Modify the function name and parameters as needed. One function per
    template is recommended; create a new code template for each new function.

    @param {String} arg1 - arg1 description
    @return {String} return description
*/
function fileNameFromPath(filePath) {
    // TODO: Enter code here

    // var filePath = 'C:\\path\\to\\your\\file.txt'; // Example file path for Windows
    // var filePath = '/path/to/your/file.txt'; // Example file path for Linux

    // Determine the path separator based on the operating system
    var pathSeparator = filePath.includes('\\') ? '\\' : '/';

    // Extract the filename
    var fileName = filePath.substring(filePath.lastIndexOf(pathSeparator) + 1);

    //logger.info('Extracted filename: ' + fileName);

    return fileName;

}