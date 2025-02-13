/**
    Renumber specified segments of a seglist

    @param {Array} arr 	- segList
    @param {Array} segs - segments to renumber
	
    @return {Array} return modified segList

    Example:
    arrayRenumberHl7(segList, ["OBX"]);
*/
// This should be raw compliant
function hl7RenumberSegs(arr, segs, options) {

    // Define default parameters
    options = Object.assign({}, {
        resetAfterOBR: false,
        segsToReset: ["OBX", "NTE"]
    }, options);

    let cnt = {};

    segs.forEach(e => cnt[e] = 0); // Convert array to dict

    arr.forEach(function (o, i, a) {
        // Get the segment type
        let seg = o[0];

        // If this is the obr and they want to reset 
        if (seg == "OBR" && options.resetAfterOBR) {
            options.segsToReset.forEach(function (toReset) {
                if (cnt.hasOwnProperty(toReset)) {
                    cnt[toReset] = 0;
                }
            });
        }

        // Now get to resetting the count
        if (segs.indexOf(seg) >= 0) {
            o[1] = ++cnt[seg];
        }
    });

    return arr;
};