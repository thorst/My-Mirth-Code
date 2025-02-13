/**
    General function to send an email. All parameters must be valued. If you
    dont have a cc, the you can pass in null or an empty string "".

    @param {String} to - The email address you would like to send to
    @param {String} cc -  The email address you would like to cc
    @param {String} from -  The email address you would like to send from
    @param {String} subject -  The subject of the email
    @param {String} body -  The body of the email
	
    @return {Boolean} returns true

    Example:
        var to = "";
        var cc = "";
        var from = "";
        var subject = "";
        var body = "";
        email(to, cc, from, subject, body)
        attachment = path and file name. 
                     check the file exists.
                       tested .txt (var emailTxt = java.io.File(txtPath + txtFileNm);) and .pdf (var altixPdf = java.io.File(altixPdfPath + altixPdfFileNm);). Both worked.

     Change Log:
     8/20/2024 - TMH
          - Updated to be send html messages
    10/22/2024 - TBY     	
        - Updated to send attachments     	
*/
function email(to, cc, from, subject, body, isHTML, file) {
    var smtpConn = SMTPConnectionFactory.createSMTPConnection();

    if (typeof isHTML == "undefined") {

        smtpConn.send(to, cc, from, subject, body);
        return;
    }

    // Prepare the MIME message
    var mimeMessage = new Packages.org.apache.commons.mail.HtmlEmail();
    mimeMessage.setHostName(smtpConn.getHost());
    mimeMessage.setSmtpPort(smtpConn.getPort());
    mimeMessage.setAuthentication(smtpConn.getUsername(), smtpConn.getPassword());
    mimeMessage.setFrom(from);
    mimeMessage.setSubject(subject);
    mimeMessage.setHtmlMsg(body); // Set the body as HTML content

    if (to) {
        var toAddresses = to.split(",");
        toAddresses.forEach(function (address) {
            mimeMessage.addTo(address.trim());
        });


    }

    if (cc) {
        var ccAddresses = cc.split(",");
        ccAddresses.forEach(function (address) {
            mimeMessage.addTo(address.trim());
        });
    }

    if (file) {
        var attachment = new Packages.org.apache.commons.mail.EmailAttachment();
        attachment.setPath(file);
        attachment.setDisposition(attachment.ATTACHMENT);
        attachment.setDescription("attachment");
        mimeMessage.attach(attachment);
    }

    mimeMessage.send();
    return;
}