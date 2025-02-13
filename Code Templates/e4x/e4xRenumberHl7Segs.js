/**
    If youre using e4x, this will allow you to renumber segments

    @param {XML} msg - The current message
    @param {Array} segs - The array of segment names to renumber
	
    @return {String} return modified hl7 xml

    Example:
    ---untested---
    e4xRenumberHl7Segs(msg, ["OBR","OBX"])

    Potential Bug:
    -Do we need to return msg here?
*/

// This is e4x compatible
function e4xRenumberHl7Segs(msg, segs) {
    let cnt = {};

    segs.forEach(e => cnt[e] = 0);
    for each(var o in msg.children()) {
        let seg = o.name().toString();

        if (segs.indexOf(seg) >= 0) {
            echo(o.toString());
            o[seg + ".1"] = ++cnt[seg];
        }
    }
};