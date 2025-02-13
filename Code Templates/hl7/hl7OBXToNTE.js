/**
    Modifies OBX segments for micro and pathology results
    @param {Array} segList - Array of segment arrays
    @return {Array} Returns the modified segList
*/
function hl7OBXToNTE(m) {
    let data = "",
        field_delim = "",
        comp_delim = "",
        rep_delim = "",
        obr4 = "",
        obr24 = "",
        isPath = false
    seg = "",
        segIndexes = "",
        segList = m.segList;

    // OBR segment
    seg = segList.find((e) => e[0] == "OBR");
    if (typeof seg != "undefined") {
        obr4 = seg[4];
        obr24 = seg[24].split(",")[0];
        isPath = obr24 == "Path" ? true : false;
    }

    // OBX Segment
    let first = true,
        zpl = "",
        prev3 = "",
        segIndex = -1,
        newSeg = [],
        nteSeg = [],
        newSegList = [],
        obx32 = "";

    for (var seg of segList) {
        if (seg[0] != "OBX") {
            newSegList.push(seg);
        } else {
            arrayExtend(seg, 5);

            // Any time obx.3 is blank, convert it to an NTE
            // This is probably a micro result
            if (seg[3].trim() == "" || isPath) {
                // If this is the first OBX, add a "See Note" OBX
                if (first) {
                    // Housekeeping
                    first = false;

                    // Create copy of seg
                    newSeg = seg.slice();

                    // Copy OBX, modify and push to array
                    newSeg[3] = obr4;
                    newSeg[5] = "See Note";
                    newSegList.push(newSeg);

                    // Grab the performing lab information
                    zpl = seg.slice(23);
                    echo("ZPL", zpl);
                }

                // For pathology, we need to use the 3rd component
                // for headers.
                obx32 = seg[3].split(m.dComp)[1];

                // Insert a spacer, if it's not the first section header
                if (isPath && prev3 != obx32 && prev3 != "") {
                    newSegList.push(["NTE", "", "", ""]);
                }

                // Insert the section header
                if (isPath && prev3 != obx32) {
                    prev3 = obx32;
                    newSegList.push(["NTE", "", "", obx32]);
                }

                // Convert original OBX to NTE and push to array
                seg[0] = "NTE";
                seg[2] = "";
                seg[3] = seg[5];
                nteSeg = seg.slice(0, 4);
                newSegList.push(nteSeg);
            } else {
                newSegList.push(seg);
            }
        }
    }

    // ZPL Segment
    if (zpl != "") {
        zpl.unshift("ZPL");
        newSegList.push(zpl);
    }

    // Renumber and remove segments
    arrayRemoveHl7(newSegList, ["TQ1"]);
    arrayRenumberHl7(newSegList, ["OBX", "NTE"]);
    m.segList = newSegList;
    return m;
}