/**
    Depending on how you have your channels configured depends on how sleep effects it.

    If source, and `threads` set to 1, it'll stop receiving new messages.
	
    If destination, and checked `wait for previous`, it'll freeze that connector, and any connectors above
    that are checked, UNLESS you have multiple threads. If queue on failure, it's processing on source thread  
    and therefore would freeze the source and stop receiving new messages.

    In any case it WON'T be at the server level, but you may have unintended consequences.

    @param {String} milliseconds  - The number of milliseconds to sleep
    @return {String} return description
*/
function sleep(milliseconds) {
    java.lang.Thread.sleep(milliseconds);
    return true;
}