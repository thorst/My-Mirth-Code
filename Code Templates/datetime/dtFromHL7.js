/**
    This method takes an HL7 date string, and returns a JAVA LocalDateTime.
    
    Date must be in yyyyMMddHHmmss format, if not use dtParse

    @param {String} myDateString - The HL7 date string (assuming its in yyyyMMddHHmmss)
    @return {java.time.LocalDateTime} return a java localdatetime object
	
    Example:
        let d = dtFromHL7(seg[7]);
*/
function dtFromHL7(myDateString) {
    var formatter = java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    return java.time.LocalDateTime.parse(myDateString, formatter);
}