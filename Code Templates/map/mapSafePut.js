/*
    This is a safe way to put a value onto a map. Bote, you need to pass in the 
    full map varibale, not the shortcut.
	
    Example:
    mapSafePut(globalMap,"TestKey","TestValue");
	
	
    Largely stolen from:
    https://github.com/nextgenhealthcare/connect-examples/tree/master/Code%20Templates/Thread-safe%20get%20or%20create%20from%20globalMap

    @param {String} arg1 - arg1 description
    @return {String} return description
*/
function mapSafePut(map, key, value) {
    if (!map.containsKeySync(key)) {
        map.putSync(key, value);
    } else {
        try {
            map.lock(key);
            map.putSync(key, value);
        } finally {
            map.unlock(key);
        }
    }
    return value;
}