/**
    Modify the description here. Modify the function name and parameters as needed. One function per
    template is recommended; create a new code template for each new function.

    @param {String} str - The base64'd byte array
    @return {ByteArray} - The byte array, **java object**
*/
function byteBaseDecode(str) {
    return FileUtil.decode(str);
}