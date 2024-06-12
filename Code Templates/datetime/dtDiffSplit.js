/**
    Given two LocalDateTimes, return the difference in integers for each unit.
    In most cases you would use dtDiff to get one unit back, to determine, that
    the difference between the two dates is 10 days as an example. If you tried
    to use this method to determine if two dates were more than 10 days apart
    you would need to check if year>0 || month>0 || day >=10. Whereas the other
    method would return x number of days, and so you only need to compare that.
    But if you were trying to form a human readable date, say how old someone
    is as of today, this method would be ideal to say you are 36 years, 2 months,
    x days etc.
	
    Source:
    https://stackoverflow.com/a/25760725/505829

    @param {java.time.LocalDateTime} dtFrom - The start dates
    @param {java.time.LocalDateTime} dtTo - The end dates
	
    @return {String} return Object containing years, months, days, hours, minutes, and seconds
	
    Example:
        var o1 = dtParse("20220322074705","yyyyMMddHHmmss");
        var o2 = dtParse("20230810145432","yyyyMMddHHmmss");
        echo(dtDiffSplit(o1,o2));
        
        {
            "years": 1,
            "months": 4,
            "days": 19,
            "hours": 7,
            "minutes": 7,
            "seconds": 27
        }
*/
function dtDiffSplit(dtFrom, dtTo) {

    var tempDateTime = java.time.LocalDateTime.from(dtFrom);

    var years = tempDateTime.until(dtTo, java.time.temporal.ChronoUnit.YEARS);
    tempDateTime = tempDateTime.plusYears(years);

    var months = tempDateTime.until(dtTo, java.time.temporal.ChronoUnit.MONTHS);
    tempDateTime = tempDateTime.plusMonths(months);

    var days = tempDateTime.until(dtTo, java.time.temporal.ChronoUnit.DAYS);
    tempDateTime = tempDateTime.plusDays(days);


    var hours = tempDateTime.until(dtTo, java.time.temporal.ChronoUnit.HOURS);
    tempDateTime = tempDateTime.plusHours(hours);

    var minutes = tempDateTime.until(dtTo, java.time.temporal.ChronoUnit.MINUTES);
    tempDateTime = tempDateTime.plusMinutes(minutes);

    var seconds = tempDateTime.until(dtTo, java.time.temporal.ChronoUnit.SECONDS);

    return {
        years: years,
        months: months,
        days: days,
        hours: hours,
        minutes: minutes,
        seconds: seconds
    }
}