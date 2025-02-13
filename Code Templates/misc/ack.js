/**
This is called from the source connector, it will set the ack variable in the
response map which will allow it to be sent back to the recieving system.

Even if you have a code error, provided you do this early on in your code,
it will send the ack out.

This is a port of what we had in cloverleaf, allowing overrides. Im not sure of
all the use cases or if this is the best way to attack this, would be nice to
re-evaluate use cases

My understanding is that the ack will be sent out AFTER the message is sent to 
all destinations. IF your destination is set to queue, itll proceed to queue on
the next destination. IF queing is turned off on a destination, then it would 
wait until that destination finishes processing. At least this is my understanding
(and jonb).

@param {Object} m 		- this is the parsed message obect, created by String.splitHl7()
@param {Object} overRide - this is an array of arrays allowing you to override ACK Ex. {ORM: "ORR", MFN: "XYZ"}
@param {Object} ackCode 	- this is an array of arrays allowing you to override ACK code Ex. {ORM: "ORM", MFN: "CA"}

@return {String} return ack message 

Example:
ack(m, {"ADT":"to"},{"ADT":"blue"});
ack(m, {"ADT":"to"},{"*":"red"});
ack(m);

09-20-2022 TMH
    -Updated to be \r when joining segs and at end (had \n)
10-12-2022 TMH
    -Updated two date variables to use new standard functions
*/
function ack(m, replace_ack, replace_ackcode) {

    // Give the user a note to come see me
    if (typeof replace_ack != "undefined" || typeof replace_ackcode != "undefined") {
        echo("See Todd H. to talk about this ack use case.");
    }

    // Cloverleaf assumed MSH first, so I will too, assign all vars
    var [header, encode, snd_app, snd_fac, rec_app, rec_fac, data_time, sec, msg_type, mcid, pid, vid, seq] = m.segList[0];

    // Get our dates
    let reply_time = dtToHL7(dtNow()),
        reply_ID = dtEpoch();

    // We just want the first component of the message type
    if (msg_type) {
        msg_type = msg_type.split(m.dComp)[0];
    }
    // Allow ack overrides
    let ack = "ACK";
    if (typeof replace_ack != "undefined" && msg_type in replace_ack) {
        ack = replace_ack[msg_type]
    }

    // Allow code overrides
    let ackCode = "AA";
    if (typeof replace_ackcode != "undefined") {
        if (msg_type in replace_ackcode) {
            ackCode = replace_ackcode[msg_type];
        } else if ("*" in replace_ackcode) {
            ackCode = replace_ackcode["*"];
        }
    }

    // Putting it all together
    let ret = [];
    ret.push(["MSH", encode, rec_app, rec_fac, snd_app, snd_fac, reply_time, sec, ack, reply_ID, pid, vid].join(m.dField));
    ret.push(["MSA", ackCode, mcid].join(m.dField));
    ret = ret.join("\r") + "\r";
    responseMap.put("ack", ret);
    return ret;
}