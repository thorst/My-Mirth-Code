/**
    This function takes a javascript Date object as an argument and returns true
    if it is in the duplicated hour from the change from EDT to EST, false 
    otherwise. In November, when you "Fall Back", we are moving to 
    standard time. The hours will go 12am, 1am, 1am, 2am. At 
    1:59am the clock will roll back to 1:00am, but you are
    now in standard time.
	
    This method functions with a very simple principle. Was the last hour 
    timezone different from the current hour? If so we switched. We only 
    care about the fall back, so is the timezone moving from 240 to 300?
    Meaning now it will be MORE, or greater than it was.
	
    To be more user friendly, and more compatible with other "dt" methods I've 
    written, this will take a java.time.LocalDateTime instead of the js Date
    object IF NEEDED. However, for performance reasons, and because I expect
    the standard use case to not pass in any date, it will use normal js
    methods within the function.
	
    From the examples below, you will see if you want to pass in a date, js is a
    little picky. Either using UTC, or the format 'November 5, 2023 1:30:00 AM EST'
    will produce the results you expect. A proper java date would as well, but
    Im sure there are gotchas there, but havent tested. If you need to go the
    Java route, id abide by the same rules, pass in the timezone and double check
    it, or just use UTC 6:30am.
	
    Standard Time:
        Is 5 hours behind UTC
        Occurs from the first Sunday in November to the second Sunday in March
        date.getTimezoneOffset() == 300 (60*5)
    Daylight Savings Time::
        Is 4 hours behid utc
        Occurs from the second Sunday in March to the first Sunday in November
        date.getTimezoneOffset() == 240 (60*4)
        

    @param {Date OR java.time.LocalDateTime} date - Optional - Defaults to Now - The date to see if its in the duplicated hour
    @return {Bool} returns true if this is the second, duplicated, 1'oclock hour, false for the rest 

    Example:
        echo(dtIsDuplicatedHour(new Date('Sun Nov 07 2023 01:30:00 GMT-0400 (Eastern Daylight Time)')));
        >> false
        echo(dtIsDuplicatedHour(new Date('Sun Nov 07 2023 02:30:00 GMT-0500 (Eastern Standard Time)')));  <-- unreliable
        >> false
        echo(dtIsDuplicatedHour(new Date('2023-11-05T01:30:00'))); // Nov 5, 2023 at 1:30 AM EST <-- unreliable
        >> false
        echo(dtIsDuplicatedHour(new Date('2023-11-05T02:30:00'))); // Nov 5, 2023 at 2:30 AM EST
        >> false

        // Create a date objects with the UTC time equivalent to 1:30 EDT & EST
        var dateEST = new Date(Date.UTC(2023, 10, 5, 6, 30, 0)); // Nov 5, 2023 at 6:30 UTC
        echo("dateEST local",dateEST.toLocaleString()); // November 5, 2023 1:30:00 AM EST
        echo("dateEST",  dtIsDuplicatedHour(dateEST));
        >> true
        
        var dateEDT = new Date(Date.UTC(2023, 10, 5, 5, 30, 0)); // Nov 5, 2023 at 5:30 UTC
        echo("dateEDT local",dateEDT.toLocaleString()); // November 5, 2023 1:30:00 AM EDT
        echo("dateEDT",  dtIsDuplicatedHour(dateEDT));
        >> false
        
        echo(dtIsDuplicatedHour(new Date('November 5, 2023 1:30:00 AM EST')));
        >> true
        
*/
function dtIsDuplicatedHour(date) {

    // If paramater is empty put in now
    if (typeof date == "undefined") {
        date = new Date();

        // If they sent in java.time.LocalDateTime    
    } else if (varType(date) == "java.time.LocalDateTime") {
        date = dtToJs(date);
    }

    // Get the UTC offset of the date in minutes
    var offset = date.getTimezoneOffset();

    // Get the UTC offset of the previous hour in minutes
    // 3600000 is the number of milliseconds in an hour
    var prevOffset = new Date(date - 3600000).getTimezoneOffset();

    // If the offset is equal to the previous offset, it means the clock was not moved yet
    // Therefore, the date is the first 1:00 hour (or any other hour of the year).
    // If the offset is greater than the previous offset, it means the clock was moved back one hour
    // Therefore, the date is the second 1:00 hour
    return offset > prevOffset;
}