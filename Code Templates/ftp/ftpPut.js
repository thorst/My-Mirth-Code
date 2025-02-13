/**
    Contains a list of ftp methods

    ::put - Will connect to momentum by default and ftp a string OR a file. To ftp a string set the 'data' to your string in the 
            object parameter. To send a file set the 'data' to the filename and change type to 'file'.

    @param {Object} obj - {
        @param {String} server 			- Default:"" - The server to connect to 
        @param {Number} port 			- Default:21					- The port to use
        @param {String} username 		- Default:""		- The username to use
        @param {String} password 		- Default:""			- The users password	
        @param {String} directory 		- Default:""				- The directory on the server to change to
        @param {String} type 			- Default:"string"				- The type of item being transmitted. Options are "string" or "file"
        @param {String} data 			 - REQUIRED					- If type is string, this is the string to ftp, if tpye is file, this is the location of the file on disk
        @param {String} destinationFileName - REQUIRED					- The name of the file on the server
    }
    @return {String} return description

    Example:
      
        ftp.put({
            data: header + "\r\n" + body,
            destinationFileName: filename
        });

    ChangeLog:
    2022/03/16 - Todd Horst - Initial
	
*/


function ftpPut(obj) {

    // Define default parameters
    obj = Object.assign({}, {
        server: "",
        port: 21,
        username: "",
        password: "",
        directory: "",
        type: "string",
        data: "",
        destinationFileName: ""
    }, obj);

    // connect to the FTP server
    var client = new org.apache.commons.net.ftp.FTPClient();
    try {
        client.connect(obj.server, obj.port);
        client.enterLocalPassiveMode();
    } catch (ex) {
        throw ex.message;
    }

    // login
    var login = client.login(obj.username, obj.password);
    if (!login) {
        throw "login failed";
    }

    // binary file type
    var fileType = client.setFileType(org.apache.commons.net.ftp.FTP.BINARY_FILE_TYPE);
    if (!fileType) {
        throw "Couldn't switch to binary";
    }

    // Change directory
    if (obj.directory.trim() != "") {
        var cd = client.changeWorkingDirectory(obj.directory)
        if (!cd) {
            throw "cd failed";
        }
    }

    // They didnt fill out everything
    if (obj.destinationFileName.trim() == "") {
        throw "No destination filename provided";
    }

    // Get the string or the file into bytes
    let myBytes = "";
    if (obj.type.toLowerCase() == "string") {
        myBytes = new java.lang.String(obj.data).getBytes('UTF-8');
        // FTP string to a file on ftp server
        //var targetStream = new java.io.ByteArrayInputStream(new java.lang.String("Test").getBytes('UTF-8'));
        //client.storeFile(obj.destinationFileName, targetStream);
    } else {
        //var b = FileUtil.readBytes(obj.data);
        myBytes = FileUtil.readBytes(obj.data);
    }

    // Turn bytes into stream
    var inputStream = new java.io.ByteArrayInputStream(myBytes);

    // Write stream to the ftp
    var write = client.storeFile(obj.destinationFileName, inputStream);
    if (!write) {
        throw "write failed";
    }

    // cleanly exit
    client.logout();
    client.disconnect();

}
