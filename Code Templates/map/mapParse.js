/**
    Convert java maps to js dict
	
    Java maps, or not very accessible in js. This is that wierd middle ground between mirth java and js,
    so this simple foreach will allow you better access to as a ChannelMap.
	
    @param {Java Map} arg1 - The Java map you would like to convert to a JS dictionary
	
    @return {Object} return converted object

    Example:
        var pCM = parseMap(channelMap);

    Changelog:
    2020.10.26 TMH 
        - Initial version, used for the fiddle I beleive.
*/
function mapParse(arg1) {
    var obj = {};
    for (var e in Iterator(arg1.entrySet())) {
        obj[e.key] = String(e.value);
    }
    return obj;
}