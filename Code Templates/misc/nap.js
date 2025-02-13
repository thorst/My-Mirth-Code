/**
    A thread safe sleep....maybe. Im not sure its every recomended to sleep,
    yet here we are...

    @param {Number} delay - I'm pretty sure this is the milliseconds you want to sleep
	
    @return {Undefined} return nothing

    Example:
    nap(1000);
*/
function nap(delay) {
    //channelMap.put("Beforetime", new Date().getTime().toString());
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
    //channelMap.put("aftertime", new Date().getTime().toString());
}