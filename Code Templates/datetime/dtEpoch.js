/**
    Gives you the seconds since epoch. JS uses milliseconds from epoch under the
    hood for dates. So we simply get a new date and divide.

    @param {java.time.LocalDateTime} myDateTime - OPTIONAL - The date to convert to seconds epoch - Defaults to now()
	
    @return {Number} return the seconds since epoch

    Example:
        let epoch = dateEpoch();
	
    Change Log:
        5/6/2024 - TMH 
            - Moved to use java instead of js
            - Accept parameter, will return the epoch of THAT date
*/
function dtEpoch(myDateTime) {

    // They passed a date
    if (typeof myDateTime == "undefined") {
        myDateTime = java.time.LocalDateTime.now();
    }

    var zone = java.time.ZoneId.systemDefault();
    return myDateTime.atZone(zone).toEpochSecond();
}