/*
    Saves the start time to the channel map. Optionally send in key, so you can
    have multiple timers per script

    @param {String} key - Name of the timer
    @return {String} return start time epoch
*/
function timerStart(key) {
    key = key || '';
    var startTime = new Date().getTime();
    channelMap.put(key + '_startTime', startTime);
    return startTime;
}