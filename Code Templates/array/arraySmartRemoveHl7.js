/**
    For prepared fields.  It can match on multiple sections and use wildcards(*)

    @param {Array} arr - segList to be modified
    @param {Array} segs - segments to kill
	
    @return {String} return description

    Example:
    arraySmartRemoveHl7(segs,["OBX|*|ST|&FL"]);  // This will match "OBX|1|ST|&FL"

    ChangeLog:
    Jeff - Initial Version
*/
function arraySmartRemoveHl7(arr, segs) {

    var i;
    var j;
    var compareString = ""
    var compare = [];
    var segsSplit
    //this loop starts looping through the parameters imported from the script
    for (i = 0; i < segs.length; i++) {
        //foreach of those params we split on the | to know how many segments to pull from the message
        segsSplit = segs[i].split("|").length
        //since the message is parsed we use this loop to piece it back together based on the length of the params
        for (var k = arr.length - 1; k >= 0; k--) {
            //this is where we pull from the message and start building our compare
            for (j = 0; j < segsSplit; j++) {
                compare.push(arr[k][j])
            }

            compareString = compare.join("|")

            //Pass in the compare string built from the original message and compare from the parameters
            //if it matches we delete it from the message.
            var match = regexMatchRuleShort(compareString, segs[i])
            if (match === true) {
                arr.splice(k, 1);
            }
            compare = [];
        }
    }

    return arr;
};