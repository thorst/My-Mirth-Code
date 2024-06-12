/**
    Add the interval to a java.time.LocalDateTime.
	
    This method could alternatively use .plus, however, Id still have to have blocks for
    resolving the interval to TemporalUnits, OR require the user to send in
    the TemporalUnit, which would not be as ideal in my head.

    @param {java.time.LocalDateTime} myDateTime - The base date (date not modified directly)
    @param {Number} amount 		                - Value to add
    @param {String} interval 	                - The interval to add, default: minutes, Possible Values: years, months, weeks, days, hours, minutes, seconds
	
    @return {java.time.LocalDateTime} new java.time.LocalDateTime with modification
	
    Example:
        var n = dtNow();
        echo(dtAdd(n,10,"years").toString());
        echo(dtAdd(n,10,"months").toString());
        echo(dtAdd(n,10,"weeks").toString());
        echo(dtAdd(n,10,"days").toString());
        echo(dtAdd(n,10,"hours").toString());
        echo(dtAdd(n,10,"minutes").toString());
        echo(dtAdd(n,10,"seconds").toString());
        echo(dtAdd(n,10).toString());
    	
*/

function dtAdd(myDateTime, amount, interval) {
    if (interval == "years") {
        return myDateTime.plusYears(amount);
    } else if (interval == "months") {
        return myDateTime.plusMonths(amount);
    } else if (interval == "weeks") {
        return myDateTime.plusWeeks(amount);
    } else if (interval == "days") {
        return myDateTime.plusDays(amount);
    } else if (interval == "hours") {
        return myDateTime.plusHours(amount);
    } else if (interval == "seconds") {
        return myDateTime.plusSeconds(amount);
    } else {
        return myDateTime.plusMinutes(amount);
    }
}