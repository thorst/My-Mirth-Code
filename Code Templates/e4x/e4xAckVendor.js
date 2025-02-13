/**

    validate if the vendor's ack is exactly AA or CA, not case sensitive. if not email whomever was sent in as the TO.
    if the calling procedure does not send a to or from, an error will send to the server log and the function will terminate.

    TMH - 10/25/2022- I dont have issues with this being used, if needed, but its logging to logger, using e4x. I did change
    to return a proper boolean. If we do start to use this we should call it ackVendor to float near ack
        TBY: logger is onlyused if the calling proc didn't enter an email.  Otherwise, nothing is logged.

    TBY - 10/26/22 The manual page 314 states validating the response only works with data type HL7 v2.x. 
                _ackVendor works, but since the ack code isn't validated, a few things:
                    -d5 respone mapping is incorrect.  says success, when it was a NACK.  could overwrite, but why?
                    -no error when NACK comes back.  again, could use the error msg in MSA to write an error, but why?
                    -with these two issues and ones i may havne't come across yet, i feel using the Mirth deprecated way of e4x may be best.
                	
    @param {String} to - The to address for the email
    @param {String} from - The from address for the email

    @return {Boolean} return true

*/
function e4xAckVendor(to, from) {

    // declare block-scoped local variables.  these vars should not conflict with other procs due to let.
    let ackCd = "",
        cc = "",
        subject = "",
        body = "",
        errMsg = "",
        env = "",
        regEx = new RegExp(/^CA|AA$/i); // i means not case sensitive.

    // if to or from is missing, the email code template errors.
    if (typeof to == "undefined") {
        logger.error("vendorAck code template missing TO parameter on connector " + connectorMessage.getChannelName());
        return false;
    }
    if (typeof from == "undefined") {
        logger.error("vendorAck code template missing FROM parameter on connector " + connectorMessage.getChannelName());
        return false;
    }

    // get ack code.  
    //use if response data type on teh Summary tab is set to HL7 V2
    ackCd = msg['MSA']['MSA.1']['MSA.1.1'].toString();

    // if not CA or AA (accpets), email.
    // the test() method tests for a match in a string. If it finds a match, it returns true, otherwise it returns false.
    env = serverEnv()
    if (!regEx.test(ackCd)) {
        subject = env + " - " + "Connector: " + connectorMessage.getChannelName() + " - msgId: " + connectorMessage.getMessageId();
        body = response.getError() + "\n\n" + connectorMessage.getRawData();
        email(to, cc, from, subject, body);
    }
    return true;
}
