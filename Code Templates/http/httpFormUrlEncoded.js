/**
    This isnt needed, but you can call this to convert a
    js dictionary to a url formatted string.

    I know js has things like encodeURI and encodeURIComponent,
    it also has URLSearchParams which is exactly what we want, 
    however mirth doesnt have URLSearchParams.

    This is NOT recursive, which means, it'll expect a simple
    object, with a simple string set of values. Now sub dictionaries
    or arrays.

    Source:
    https://stackoverflow.com/a/39787203/505829

    @param {String} obj - A simple object of string keys and values
    @return {String} return joined string
*/
function httpFormUrlEncoded(obj) {
    var str = [];
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]));
        }
    }
    return str.join("&");
}