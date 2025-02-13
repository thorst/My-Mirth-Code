/**
    This modifies segList and keeps only the segments that you
    list in the array. The list uses a string match to see if
    its a match.

    @param {Array} arr 	- seglist Array
    @param {Array} segs - Array of segments to keep
	
    @return {Array} - Returns modified seglist

    Example:
    // Keep only "MSH","EVN","PID","PV1","PV2","MRG" segments from the segList array
    arrayKeepHl7Segs(segList,["OBR|1|"]);
*/

function arrayKeepHl7Segs(arr, segs) {
    for (var i = arr.length - 1; i >= 0; i--) {
        if (segs.indexOf(arr[i][0]) == -1) {
            arr.splice(i, 1);
        }
    }
    return arr;
};