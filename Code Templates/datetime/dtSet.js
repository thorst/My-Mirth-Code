/**
    This function will override parts of the time

    @param {java.time.LocalDateTime} myDateTime - The base date (date not modified directly)
    @param {object} parts - The parts of the date you want to update, all optional, all ints
    {
      year : int,
      month : int,
      day : int,
      hour : int,
      minute : int,
      second : int,
      nano : int
    }
	
	
    @return {java.time.LocalDateTime} new java.time.LocalDateTime with modification
*/
function dtSet(myDateTime, parts) {

    // set year
    if (parts.hasOwnProperty('year')) {
        myDateTime = myDateTime.withYear(parts.year);
    }

    // set month
    if (parts.hasOwnProperty('month')) {
        myDateTime = myDateTime.withMonth(parts.month);
    }

    // set day
    if (parts.hasOwnProperty('day')) {
        myDateTime = myDateTime.withDayOfMonth(parts.day);
    }

    // set hour
    if (parts.hasOwnProperty('hour')) {
        myDateTime = myDateTime.withHour(parts.hour);
    }

    // set minute
    if (parts.hasOwnProperty('minute')) {
        myDateTime = myDateTime.withMinute(parts.minute);
    }

    // set second
    if (parts.hasOwnProperty('second')) {
        myDateTime = myDateTime.withSecond(parts.second);
    }

    // set nano
    if (parts.hasOwnProperty('nano')) {
        myDateTime = myDateTime.withNano(parts.nano);
    }

    return myDateTime;
}