/*
    Saves the end and execution times to channel map. Optionally takes name of
    timer.

    @param {String} key - Optionally the name of the timer, must match timerStart
    @return {String} return execution time IN MILLISECONDS or -1 if failed
*/
function timerStop(key) {
    key = key || '';
    var endTime = new Date().getTime();
    var startTime = channelMap.get(key + '_startTime');

    if (startTime != null) {
        var executionTime = endTime - startTime;
        channelMap.put(key + '_endTime', endTime);
        channelMap.put(key + '_executionTime', executionTime);
        return executionTime;
    } else {
        channelMap.put("Timer Error:", key + '_startTime was not found.');
    }
    return -1;
}