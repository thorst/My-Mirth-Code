/**
    Given a java.time.LocalDateTime format it like yyyyMMddHHmmss

    @param {java.time.LocalDateTime} myDateTime - The date to be converted
    @return {String} return The HL7 string reprenatation of myDateTime
	
    Example:
        specDate = dtFromHL7(seg[7]);
        specDate = dtAdd(specDate,-1,"minutes");
        seg[7] = dtToHL7(specDate);
*/
function dtToHL7(myDateTime) {
    var formatter = java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    return myDateTime.format(formatter);
}