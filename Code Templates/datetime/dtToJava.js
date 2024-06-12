/**
    This takes a java.time.LocalDateTime and converts it to a java.util.Date.
    This shouldnt be used frequently because all dt methods use strings or
    LocalDateTime.

    @param {java.util.Date} myDateTime - Date to be converted
    @return {java.time.LocalDateTime} return New java.util.Date object
	
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
function dtToJava(myDateTime) {
    return java.util.Date.from(myDateTime.atZone(java.time.ZoneId.systemDefault()).toInstant());
}