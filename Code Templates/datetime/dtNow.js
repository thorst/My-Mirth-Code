/**
    Returns the current datetime

    @return {java.time.LocalDateTime} return The current datetime
	
    Example:
        var now = dtNow();
        echo(varType(now));   //java.time.LocalDateTime
        var formattedNow = dtToHl7(now); 
*/
function dtNow() {
    return java.time.LocalDateTime.now();
}