/**
    This function returns true or false.  It allows us to use a * as a wildcard for matching.
    it is used in the smart remove hl7

    @param {String} str - The string to test
    @param {String} rule - Regex to test against
	
    @return {Boolean} return true if theres a match

    Example:
    regexMatchRuleShort("OBX|1|ST|&FL", "OBX|*|ST|&FL")

    Changelog:
    Jeff - Initial Version
*/
function regexMatchRuleShort(str, rule) {
    var escapeRegex = (str) => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    return new RegExp("^" + rule.split("*").map(escapeRegex).join(".*") + "$").test(str);
}