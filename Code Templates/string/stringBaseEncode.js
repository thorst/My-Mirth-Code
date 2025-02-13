/**
        Encode string to base64
	
    https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/btoa

    @param {String} str 	- The string you wish to encode
    @param {Object} param - Optional - Object with values 
    @param {String} param.encoding - Optional - The character encoding to use, defaults to 'UTF-8'
	
    @return {String} return Base 64 encoded string

    Example:
    let encoded = stringBaseEncode("my string"); // Results in bXkgc3RyaW5n
*/
function stringBaseEncode(str, param) {
    // Populate param with default values
    param = Object.assign({
        encoding: 'UTF-8'
    }, param);

    return Packages.org.apache.commons.codec.binary.Base64.encodeBase64String(new java.lang.String(str).getBytes(param.encoding));
}