/**
    This template is an ACK for an X12 interface.  These include 270/271, 278, Coverage Discovery, etc.... 

    @param {String} arg1 - arg1 description
    @return {String} return description
*/
function ack_x12(msg) {
    let field_delim = "*",
        spData = msg.split("~"),
        ISA = spData[0],
        spISA = ISA.split(field_delim),
        msgId = spISA[13],
        sender = spISA[8],
        reply_date = "",
        reply_time = "",
        reply_data = "",
        now = "",
        currentDT,
        year = "",
        monthDay = "";

    //create the data for the outbound reply
    now = dtNow();
    currentDT = dtToHL7(now);
    year = currentDT.substring(2, 4);
    monthDay = currentDT.substring(4, 8);
    reply_date = year + monthDay;
    reply_time = currentDT.substring(8, 12);

    //Build the ISA segment for the reply
    //Add empty segment for extra return at the end
    reply_data = "ISA*00*0000000000*00*0000000000*ZZ*" + sender + "*ZZ*XXXXXXXX      *" + reply_date + "*" + reply_time + "*^*00501*000000001*1*T*:~TA1*" + msgId + "*" + reply_date + "*" + reply_time + "*A*000*~IEA*1*000000001~";

    //create the reply message and put into Response map. 
    responseMap.put("ack_x12", reply_data);
    return reply_data;
}