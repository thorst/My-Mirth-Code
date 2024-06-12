/**
    This method takes a date string, an input format, and an output format.
    It will then return the date string in the new format. This is a nice all
    in one method, instead of calling dtFromHL7 & dtFormat
    
    Dates are terrible in js. Mirth include java which has better 
    libraries for this. 
	
    For any formats DateUtil uses "SimpleDateFormat". A simple google search
    will give you a plethora of information. Some good sources are:
        https://docs.oracle.com/javase/8/docs/api/java/text/SimpleDateFormat.html
        https://www.digitalocean.com/community/tutorials/java-simpledateformat-java-date-format
	
    Letter for Pattern	Date or Time component	Examples
    G	Era designator	                        AD
    y	Year	                                2018 (yyyy), 18 (yy)
    M	Month in year	                        July (MMMM), Jul (MMM), 07 (MM)
    w	Results in week in year	                16
    W	Results in week in month	            3
    D	Gives the day count in the year	        266
    d	Day of the month	                    09 (dd), 9(d)
    F	Day of the week in month	            4
    E	Day name in the week	                Tuesday, Tue
    u	Day number of week where 1 represents Monday, 2 represents Tuesday and so on	2
    a	AM or PM marker	                        AM
    H	Hour in the day (0-23)	                12
    k	Hour in the day (1-24)	                23
    K	Hour in am/pm for 12 hour format (0-11)	0
    h	Hour in am/pm for 12 hour format (1-12)	12
    m	Minute in the hour	                    59
    s	Second in the minute	                35
    S	Millisecond in the minute	            978
    z	Timezone	Pacific Standard Time; PST; GMT-08:00
    Z	Timezone offset in hours (RFC pattern)	-0800
    X	Timezone offset in ISO format	        -08; -0800; -08:00

    @param {String} DateString - The string date you wish to format
    @param {String} InFormat - The 'SimpleDateFormat' (its java) string format that the date uses coming into the function
    @param {String} OutFormat - The 'SimpleDateFormat' string format you want the date to be converted to
	
    @return {String} return The date in the OutFormat
	
    Example
        seg[5] = dtConvert(seg[5],"yyyyMMddHHmmss","MM/dd/yyyy HH:mm:ss"); // Converts an hl7 date to a nice formatted one
        
*/
function dtConvert(DateString, InFormat, OutFormat) {
    return DateUtil.convertDate(InFormat, OutFormat, DateString);
}