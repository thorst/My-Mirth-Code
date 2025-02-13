/**
    Returns an array of file names in a specific directory.

    @param {String} filePath - Directory to search
    @param {Object} param - An object with additional optional parameters
    @param {Boolean} param.recursive - Default: false - This determines whether to look in subdirectories or not
    @param {Boolean} param.excludeHidden - Default: true - This determines whether to return hidden files or not
    @param {Boolean} param.excludeFilesStartingWithDot - Default: true - Self Explanatory
    @return {String Array} - Array containing file names
*/
importPackage(java.io);
importPackage(java.nio.file);
importPackage(java.util);

function dirList(filePath, param) {
    // Define default parameters
    param = Object.assign({}, {
        recursive: false,
        excludeDirectories: true,
        excludeHidden: true
    }, param);

    var directory = new File(filePath);
    var fileNames = [];
    var fileName = "";

    // Get list of files and directories in current directory
    if (directory.isDirectory()) {
        var files = directory.listFiles();

        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var fileName = file.getName();
            if (param.excludeHidden && fileName.startsWith(".")) {
                continue;
            }
            if (file.isDirectory()) {
                // If a directory, include directory name in file list (if excludeDirectories parameter is false)
                if (!param.excludeDirectories) {
                    filenames.push(file.getAbsolutePath());
                }
                // If a directory, call recursively to list contents (if recursive parameter is true)
                if (param.recursive) {
                    fileNames = fileNames.concat(dirList(file.getAbsolutePath(), param));
                }
            } else {
                // If a file, add to the list
                fileNames.push(file.getAbsolutePath());
            }
        }
    } else {
        fileNames.push(dir.getAbsolutePath());
    }

    return fileNames;
}