/**
    Given a java.time.LocalDateTime this method will return a string according
    to the specified format.
	
    Formatter	    Description	                Example
    BASIC_ISO_DATE	Basic ISO date	            '20111203'
    ISO_LOCAL_DATE	ISO Local Date	            '2011-12-03'
    ISO_OFFSET_DATE	ISO Date with offset	    '2011-12-03+01:00'
    ISO_DATE	ISO Date with or without offset	'2011-12-03+01:00'; '2011-12-03'
    ISO_LOCAL_TIME	Time without offset	        '10:15:30'
    ISO_OFFSET_TIME	Time with offset	        '10:15:30+01:00'
    ISO_TIME	Time with or without offset	    '10:15:30+01:00'; '10:15:30'
    ISO_LOCAL_DATE_TIME	ISO Local Date and Time	'2011-12-03T10:15:30'
    ISO_OFFSET_DATE_TIME	Date Time with Offset	'2011-12-03T10:15:30+01:00'
    ISO_ZONED_DATE_TIME	Zoned Date Time	        '2011-12-03T10:15:30+01:00[Europe/Paris]'
    ISO_DATE_TIME	Date and time with ZoneId	'2011-12-03T10:15:30+01:00[Europe/Paris]'
    ISO_ORDINAL_DATE	Year and day of year	'2012-337'
    ISO_WEEK_DATE	Year and Week	            '2012-W48-6'
    ISO_INSTANT	Date and Time of an Instant	    '2011-12-03T10:15:30Z'
    RFC_1123_DATE_TIME	RFC 1123 / RFC 822	    'Tue, 3 Jun 2008 11:05:30 GMT'
    
        Symbol  Meaning                     Presentation      Examples
      ------  -------                     ------------      -------
       G       era                         text              AD; Anno Domini; A
       u       year                        year              2004; 04
       y       year-of-era                 year              2004; 04
       D       day-of-year                 number            189
       M/L     month-of-year               number/text       7; 07; Jul; July; J
       d       day-of-month                number            10
    
       Q/q     quarter-of-year             number/text       3; 03; Q3; 3rd quarter
       Y       week-based-year             year              1996; 96
       w       week-of-week-based-year     number            27
       W       week-of-month               number            4
       E       day-of-week                 text              Tue; Tuesday; T
       e/c     localized day-of-week       number/text       2; 02; Tue; Tuesday; T
       F       week-of-month               number            3
    
       a       am-pm-of-day                text              PM
       h       clock-hour-of-am-pm (1-12)  number            12
       K       hour-of-am-pm (0-11)        number            0
       k       clock-hour-of-am-pm (1-24)  number            0
    
       H       hour-of-day (0-23)          number            0
       m       minute-of-hour              number            30
       s       second-of-minute            number            55
       S       fraction-of-second          fraction          978
       A       milli-of-day                number            1234
       n       nano-of-second              number            987654321
       N       nano-of-day                 number            1234000000
    
       V       time-zone ID                zone-id           America/Los_Angeles; Z; -08:30
       z       time-zone name              zone-name         Pacific Standard Time; PST
       O       localized zone-offset       offset-O          GMT+8; GMT+08:00; UTC-08:00;
       X       zone-offset 'Z' for zero    offset-X          Z; -08; -0830; -08:30; -083015; -08:30:15;
       x       zone-offset                 offset-x          +0000; -08; -0830; -08:30; -083015; -08:30:15;
       Z       zone-offset                 offset-Z          +0000; -0800; -08:00;
    
       p       pad next                    pad modifier      1
    
       '       escape for text             delimiter
       ''      single quote                literal           '
       [       optional section start
       ]       optional section end
       #       reserved for future use
       {       reserved for future use
       }       reserved for future use


    @param {java.time.LocalDateTime} arg1 - arg1 description
    @param {String} format - The format, using the above symbols
    @return {String} return description
	
    Example:
        echo(dtFormat(dtNow(),"ISO_DATE"));
	
*/
function dtFormat(myDateTime, format) {
    if (format == "BASIC_ISO_DATE") {
        return myDateTime.format(java.time.format.DateTimeFormatter.BASIC_ISO_DATE);
    } else if (format == "ISO_LOCAL_DATE") {
        return myDateTime.format(java.time.format.DateTimeFormatter.ISO_LOCAL_DATE);
    } else if (format == "ISO_OFFSET_DATE") {
        return myDateTime.format(java.time.format.DateTimeFormatter.ISO_OFFSET_DATE);
    } else if (format == "ISO_DATE") {
        return myDateTime.format(java.time.format.DateTimeFormatter.ISO_DATE);
    } else if (format == "ISO_LOCAL_TIME") {
        return myDateTime.format(java.time.format.DateTimeFormatter.ISO_LOCAL_TIME);
    } else if (format == "ISO_OFFSET_TIME") {
        return myDateTime.format(java.time.format.DateTimeFormatter.ISO_OFFSET_TIME);
    } else if (format == "ISO_TIME") {
        return myDateTime.format(java.time.format.DateTimeFormatter.ISO_TIME);
    } else if (format == "ISO_LOCAL_DATE_TIME") {
        return myDateTime.format(java.time.format.DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    } else if (format == "ISO_OFFSET_DATE_TIME") {
        return myDateTime.format(java.time.format.DateTimeFormatter.ISO_OFFSET_DATE_TIME);
    } else if (format == "ISO_ZONED_DATE_TIME") {
        return myDateTime.format(java.time.format.DateTimeFormatter.ISO_ZONED_DATE_TIME);
    } else if (format == "ISO_DATE_TIME") {
        return myDateTime.format(java.time.format.DateTimeFormatter.ISO_DATE_TIME);
    } else if (format == "ISO_ORDINAL_DATE") {
        return myDateTime.format(java.time.format.DateTimeFormatter.ISO_ORDINAL_DATE);
    } else if (format == "ISO_WEEK_DATE") {
        return myDateTime.format(java.time.format.DateTimeFormatter.ISO_WEEK_DATE);
    } else if (format == "ISO_INSTANT") {
        return myDateTime.format(java.time.format.DateTimeFormatter.ISO_INSTANT);
    } else if (format == "RFC_1123_DATE_TIME") {
        return myDateTime.format(java.time.format.DateTimeFormatter.RFC_1123_DATE_TIME);
    } else {
        var formatter = java.time.format.DateTimeFormatter.ofPattern(format);
        return myDateTime.format(formatter);
    }
}