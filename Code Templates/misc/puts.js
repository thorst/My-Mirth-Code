/**
    This allows you to quickly log something to the global log.
    I wouldnt really advise doing this, at least not in prod
    as it will pollute the log. Better to use echo which places
    the value in the channelMap.

    @param {String} str - The string to log
	
    @return {Undefined} return nothing

    Example:
    puts("I want this available for the world to see");
    //messageObject.getConnectorName()
*/
function puts(str) {
    var conName = "";
    if (typeof connector != "undefined") {
        conName = '>>' + connector;
    }
    logger.info(channelName + conName + ': ' + str);
}