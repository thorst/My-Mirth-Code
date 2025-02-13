/**
    This will get a value from a map in a thread safe manner
	
    Example:
    mapSafeGet(globalMap,"safetest");
	
    Largely borrowed from: 
    https://github.com/nextgenhealthcare/connect-examples/tree/master/Code%20Templates/Thread-safe%20get%20or%20create%20from%20globalMap

    @param {String} arg1 - arg1 description
    @return {String} return description
*/
function mapSafeGet(map, key) {
    return map.get(key);
}