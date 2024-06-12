/**
    Given a javaascript Date return a LocalDateTime java object
    This shouldnt be used frequently because all dt methods use strings or
    LocalDateTime.

    @param {Date} myJsDate - The js date object to be converted to LocalDateTime
    @return {java.time.LocalDateTime} return a LocalDateTime
	
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
function dtFromJs(myJsDate) {
    return java.time.LocalDateTime.ofInstant(java.time.Instant.ofEpochMilli(myJsDate), java.time.ZoneId.systemDefault());
}