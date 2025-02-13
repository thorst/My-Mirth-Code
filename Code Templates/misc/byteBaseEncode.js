/**
    Modify the description here. Modify the function name and parameters as needed. One function per
    template is recommended; create a new code template for each new function.

    @param {ByteArray} byteArray - Java byte array
    @return {String} return the base64'd byte array
*/
function byteBaseEncode(byteArray) {
    return FileUtil.encode(byteArray);
}