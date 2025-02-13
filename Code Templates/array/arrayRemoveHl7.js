/**
    Remove hl7 segments from segList

    @param {String} arr 	- arg1 description
    @param {String} segs 	- arg1 description
	
    @return {String} return modified segList

    Example:
    // Remove just the MRG segment
    arrayRemoveHl7(segList, ["MRG"]);

    // Remove multiple segments
    arrayRemoveHl7(segList, ["CON","ZIN"]);
*/
function arrayRemoveHl7(arr, segs) {

    for (var i = arr.length - 1; i >= 0; i--) {
        if (segs.indexOf(arr[i][0]) >= 0) {
            arr.splice(i, 1);
        }
    }

    return arr;
};