/**
    Generic table lookup function. Given a table name and a lookup key,
    this will return the value. Your table can be defined inline in your
    proc, or in a code template if its reused.

    @param {Object} table - The value of the table you are passing in
    @param {String} inVal - The key you are trying the look up
    @param {Object} param - The value of the parameters
    @param {String} param.defaultVal - Default: undefined - The value to return if inVal key is not found
    @param {Boolean} param.shouldError - Default: false - The value of the parameters
	
    @return {String} The value of the key, or the default value if defined

    example table code template:
    var mytable = {
    "x":"y",
    }

    Examples:

    // Normal calling, will return undefined if not found
    tableLookup(myTable,"In1")
	
    // Example calling it with a default value of an empty string
    tableLookup(myTable,"In1",{defaultVal:""})
    tableLookup(myTable,"In1",{defaultVal:"In1"})
	
    // Example of calling it, where error if value not found
    tableLookup(myTable,"In1",{shouldErrorld:true})
	
*/
function tableLookup(table, inVal, param) {
    // Ensure table they sent is a dictionary
    if (typeof table != "object") {
        return "table " + table + " is of type " + typeof table + " and should be object (dictionary)";
    }

    // Populate param with default values
    param = Object.assign({
        defaultVal: undefined,
        shouldError: false
    }, param);

    // Get the return value, will be undefined if not found, then it will populate with param.defaultVal
    //	which if that isnt defined then it will also be undefined
    let ret = table[inVal] || param.defaultVal;

    // If its undefined and user wants us to error, do so
    if (typeof (ret == "undefined" || ret == param.defaultVal) && param.shouldError) {
        throw ("Value: " + inVal + " not found in lookup table.");
    }

    // Returned the found value
    return ret;
}