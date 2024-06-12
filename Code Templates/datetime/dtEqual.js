/**
    Given two dates, and a level of precision, determine if they
    are equal. So if I send in "days" but the hours are different, it would still
    say they are equal, because we are ignoring the smaller units within the time.

    @param {java.time.LocalDateTime} myDateTime1 - The first date
    @param {java.time.LocalDateTime} myDateTime2 - The seconds date
    @param {String} precision - The precision which you wish to compare. Defaults: nano. Possible values: years, months, days, hours, minutes, seconds
	
    @return {Boolean} returns whether they are equal
	
    Example:
        var n = dtNow();
        var o = dtParse("20230809164005","yyyyMMddHHmmss");
        echo(dtEqual(n,n,"seconds"));
        echo(dtEqual(n,o,"seconds"));
*/
function dtEqual(myDateTime1, myDateTime2, precision) {
    if (precision == "years") {
        return myDateTime1.getYear() == myDateTime1.getYear();
    } else if (precision == "months") {
        return myDateTime1.getYear() == myDateTime1.getYear() && myDateTime1.getMonthValue() == myDateTime2.getMonthValue();
    } else if (precision == "days") {
        return myDateTime1.toLocalDate().equals(myDateTime2.toLocalDate());
    } else if (precision == "hours") {
        var t1 = myDateTime1.truncatedTo(java.time.temporal.ChronoUnit.HOURS)
        var t2 = myDateTime2.truncatedTo(java.time.temporal.ChronoUnit.HOURS)
        return t1.equals(t2);
    } else if (precision == "minutes") {
        var t1 = myDateTime1.truncatedTo(java.time.temporal.ChronoUnit.MINUTES)
        var t2 = myDateTime2.truncatedTo(java.time.temporal.ChronoUnit.MINUTES)
        return t1.equals(t2);
    } else if (precision == "seconds") {
        var t1 = myDateTime1.truncatedTo(java.time.temporal.ChronoUnit.SECONDS)
        var t2 = myDateTime2.truncatedTo(java.time.temporal.ChronoUnit.SECONDS)
        return t1.equals(t2);
    } else {
        // Test if they are exactly equal
        return myDateTime1.equals(myDateTime2);
    }
}