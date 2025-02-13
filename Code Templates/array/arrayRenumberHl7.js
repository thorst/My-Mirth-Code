/**
    Renumber specified segments of a seglist

    @param {Array} arr 	- segList
    @param {Array} segs - segments to renumber
	
    @return {Array} return modified segList

    Example:
    arrayRenumberHl7(segList, ["OBX"]);
*/
// This should be raw compliant
function arrayRenumberHl7(arr, segs) {

    let cnt = {};

    segs.forEach(e => cnt[e] = 0);                      // Convert array to dict

    arr.forEach(function (o, i, a) {
        let seg = o[0];
        if (segs.indexOf(seg) >= 0) {
            o[1] = ++cnt[seg];
        }
    });

    return arr;
};