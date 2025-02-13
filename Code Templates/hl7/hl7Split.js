/**
    This will take a hl7 message string and split it,
    it will return the hl7 message split BY FIELDS as
    well as information on delimeters.

    @param {String} msg - The hl7 message needing to be split
	
    @return {Object} return A new object 
    @return {Object.String} dField - The field delimiter char 
    @return {Object.String} dComp - The comp delimiter char
    @return {Object.String} dField - The repetition delimiter char
    @return {Object.Array} segList - An array of arrays, of segments of fields
*/
function hl7Split(msg) {
    let dField = msg.substr(3, 1),
        dComp = msg.substr(4, 1),
        dRep = msg.substr(5, 1),
        cEsc = msg.substr(6, 1),
        dSub = msg.substr(7, 1),
        segList = msg.split(/\r?\n|\r/); // /\r?\n/ matches /r/n or /n OR "\r" matches \r OR /\r?\n|\r/ matches \r \n \r\n

    // Pre-dice
    segList.forEach(function (o, i, a) {
        a[i] = o.split(dField);
    });

    return {
        dField: dField,
        dComp: dComp,
        dRep: dRep,
        cEsc: cEsc,
        dSub: dSub,
        segList: segList
    };
}