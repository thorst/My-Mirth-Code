/**
    Given two java.time.LocalDateTime, compare if the one is before or after the 
    other. It will also return 0 if they are exactly equal.
	
    What gets returned?
        0 (Zero) if both the date-times represent the same time instance of the day.
        Positive integer if given date-times is later than the otherDate.
        Negative integer if given date-times is earlier than the otherDate.

    @param {java.time.LocalDateTime} myDateTime1 - First date
    @param {java.time.LocalDateTime} myDateTime1 - Seconds date
    @return {Number} return how the compare (see above)
	
    Example:
        var o1 = dtParse("20220322074705","yyyyMMddHHmmss");
        var o2 = dtParse("20230810145432","yyyyMMddHHmmss");
        echo(dtCompare(o1,o2));   // -1
*/
function dtCompare(myDateTime1, myDateTime2) {
    return myDateTime1.compareTo(myDateTime2)
}