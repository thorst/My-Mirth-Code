/**
    Given a LocalDateTime java object, return a js Date object
    This shouldnt be used frequently because all dt methods use strings or
    LocalDateTime.

    @param {java.time.LocalDateTime} myDateTime - The LocalDateTime to be converted to a js date
    @return {Date} return a js date object
	
    Example:
    	
        // Get LocalDateTime
        var n = dtNow();
        echo(varType(n));
        echo(n.toString());
        
        //Convert to js
        var jd = dtToJs(n);
        echo(jd.toString());
        echo(varType(jd));
        
        //Convert back to LocalDateTime
        var nn = dtFromJs(jd);
        echo(nn.toString());
        echo(varType(nn));
*/
function dtToJs(myDateTime) {
    return new Date(myDateTime.atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli());
}