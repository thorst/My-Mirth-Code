/**
    This uses JAVA to replace all instances of a string. Does not work with regex, 
    just replaces one stirng with another.

    var s1 = "Test \e";
    var s2 = stringReplaceAll2(s1,"\\","");

    @param {String} arg1 - arg1 description
    @return {String} return description
*/
function stringReplaceAll2(originalString, find, replace) {
    if (typeof originalString == "undefined" || originalString == "") {
        return originalString;
    }

    return new java.lang.String(originalString).replaceAll(find, replace);
}