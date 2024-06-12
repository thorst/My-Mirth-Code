/**
	This takes a java.util.Date and converts it to a java.time.LocalDateTime.
	This shouldnbt be used frequently, because all dt methods deal with strings
	or LocalDateTimes.

	@param {java.util.Date} arg1 - myJavaDate Date to be converted
	@return {java.time.LocalDateTime} return New LocalDateTime object
	
	Example:
	
    	// Get Now
    	var n = dtNow();
        echo(varType(n));
        echo(n.toString());
        
        // Convert to java.util.Date
        var jd = dtToJava(n);
        echo(jd.toString());
        echo(varType(jd));
        
        // Convert back to java.time.LocalDateTime
        var nn = dtFromJava(jd);
        echo(nn.toString());
        echo(varType(nn));
*/
function dtFromJava(myJavaDate) {
	return java.time.LocalDateTime.ofInstant(myJavaDate.toInstant(), java.time.ZoneId.systemDefault());
}