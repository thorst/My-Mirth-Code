/**
    Given two datetimes, what is the given interval difference as a float.
    This is ideal for most scenarios we have, where we want to check if a date
    is > x number of days, as an example. If your looking for a more human
    readable date breakdown, look at dtDiffSplit.

    @param {java.time.LocalDateTime} dtFrom - The start date
    @param {java.time.LocalDateTime} dtTo - The end date
    @param {String} retUnit - The unit you want to have returned. Defaults: days. Possible values: years, months, weeks, days, hours, minutes, seconds
	
    @return {float} return A float value of the difference according to the interval unit parameter
	
    Examples:
        var o1 = dtParse("20220322074705","yyyyMMddHHmmss");
        var o2 = dtParse("20230810145432","yyyyMMddHHmmss");
        
        echo("1. years",dtDiff(o1,o2,"years"));         // 1.3861652026770097
        echo("2. months",dtDiff(o1,o2,"months"));       // 16.612903225806452
        echo("3. weeks",dtDiff(o1,o2,"weeks"));         // 72.32812003968255
        echo("4. days",dtDiff(o1,o2,"days"));           // 506.2968402777778
        echo("5. hours",dtDiff(o1,o2,"hours"));         // 12151.124166666666
        echo("6. minutes",dtDiff(o1,o2,"minutes"));     // 729067.45
        echo("7. seconds",dtDiff(o1,o2,"seconds"));     // 43744047
*/
function dtDiff(dtFrom, dtTo, retUnit) {

    // Just as with pure js, there are some special cases we will handle first
    if (retUnit == "years") {
        return java.time.Duration.between(dtFrom, dtTo).toNanos() / java.time.Duration.of(1, java.time.temporal.ChronoUnit.DAYS).toNanos() / 365.25;
    } else if (retUnit == "months") {
        // https://stackoverflow.com/a/73947644
        var lastDayOfStartMonth = dtFrom.with(java.time.temporal.TemporalAdjusters.lastDayOfMonth());
        var firstDayOfEndMonth = dtTo.with(java.time.temporal.TemporalAdjusters.firstDayOfMonth());
        var startMonthLength = dtFrom.toLocalDate().lengthOfMonth();
        var endMonthLength = dtTo.toLocalDate().lengthOfMonth();
        if (lastDayOfStartMonth.isAfter(firstDayOfEndMonth)) { // same month
            return java.time.temporal.ChronoUnit.DAYS.between(dtFrom, dtTo) / startMonthLength;
        }
        var months = java.time.temporal.ChronoUnit.MONTHS.between(lastDayOfStartMonth, firstDayOfEndMonth);
        var startFraction = java.time.temporal.ChronoUnit.DAYS.between(dtFrom, lastDayOfStartMonth.plusDays(1)) / startMonthLength;
        var endFraction = java.time.temporal.ChronoUnit.DAYS.between(firstDayOfEndMonth, dtTo) / endMonthLength;
        return months + startFraction + endFraction;
    } else if (retUnit == "weeks") {
        return java.time.Duration.between(dtFrom, dtTo).toNanos() / java.time.Duration.of(1, java.time.temporal.ChronoUnit.DAYS).toNanos() / 7;
    }

    // The rest can be handled with the same methodology
    // Default to days
    var unit = java.time.temporal.ChronoUnit.DAYS;
    if (retUnit == "hours") {
        unit = java.time.temporal.ChronoUnit.HOURS;
    } else if (retUnit == "minutes") {
        unit = java.time.temporal.ChronoUnit.MINUTES;
    } else if (retUnit == "seconds") {
        unit = java.time.temporal.ChronoUnit.SECONDS;
    }

    return java.time.Duration.between(dtFrom, dtTo).toNanos() / java.time.Duration.of(1, unit).toNanos();
}