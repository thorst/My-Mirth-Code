/*
    Modify the description here. Modify the function name and parameters as needed. One function per
    template is recommended; create a new code template for each new function.

    @param {String} arg1 - arg1 description
    @return {String} return description
*/
function fileWrite(filePath, str, append) {
    if (typeof append == "undefined") {
        append = false;
    }
    return FileUtil.write(filePath, append, str);
}