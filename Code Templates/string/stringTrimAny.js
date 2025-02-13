/**
    TCL has a nice trim characters from start and end method, so this is a replacement for that.
    Copied from https://stackoverflow.com/a/55292366/505829. 

    @param {String} str - The string to trim start and end
    @param {String OR Array} chars - The string, or array of strings to trim start and end
	
    @return {String} return modified string
	

    Example:
    stringTrimAny('|hello|world   ', [ '|', ' ' ]); 		// => 'hello|world'
	
    stringTrimAny('|hello| world  ', '| '); 			// => 'hello|world'			// because '.indexOf' is used, you could also pass a string for the 2nd parameter:
*/
function stringTrimAny(str, chars) {
    var start = 0,
        end = str.length;

    while (start < end && chars.indexOf(str[start]) >= 0)
        ++start;

    while (end > start && chars.indexOf(str[end - 1]) >= 0)
        --end;

    return (start > 0 || end < str.length) ? str.substring(start, end) : str;
}