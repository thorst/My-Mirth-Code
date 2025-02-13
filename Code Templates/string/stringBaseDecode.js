/**
    Decodes a string of data which has been encoded using Base64 encoding
    https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/atob

    @param {String} str - Base 64 encoded string your looking to decode
    @param {Object} param - Optional - Object with values 
    @param {String} param.encoding - Optional - The character encoding to use, defaults to 'UTF-8'
	
    @return {String} return decoded string

	
    Example:
    let encoded = stringBaseDecode("bXkgc3RyaW5n"); // Results in "my string"
*/

function stringBaseDecode(str, param) {
    // Populate param with default values
    param = Object.assign({
        encoding: 'UTF-8'
    }, param);


    return String(new java.lang.String(FileUtil.decode(str), param.encoding));
}