/**
    Performs an SFTP PUT for a single file

    Will connect to the specified server and secure ftp a string OR a file. To secure ftp a string set the 'data' to your string in the 
            object parameter. To send a file set the 'data' to the filename and change type to 'file'.

    @param {Object} obj - {
        @param {String} server				- REQUIRED			- The server to connect to 
        @param {Number} port				- Default:22			- The port to use
        @param {String} username				- REQUIRED			- The username to use
        @param {String} password				- REQUIRED			- The users password	
        @param {String} directory 		    						- The directory on the server to change to
        @param {String} type				- Default:"file"		- The type of item being transmitted. Options are "string" or "file"
        @param {String} data				- REQUIRED			- If type is string, this is the string to sftp, if type is file, this is the location of the file on disk
        @param {String} destinationFileName	- REQUIRED			- The name of the file on the server
        @param {Boolean} throwOnError			- Default: true		- Determines whether or not to send an error back to Mirth
        @param {Boolean} deleteSource			- Default: false		- Determines whether to delete the source file or not
        @param {Boolean} moveSource			- Default: false		- Determines whether to move the source file or not
        @param {String} moveSourcePath							- New path (not including file name) for the source file to be moved to
        @param {Boolean} moveSourceAppendEpoch	- Default: false		- When moving the file, rename it by adding epoch (originalfilename_epoch.originalextension)
    }

    Example:
        // SFTP only sending in the five req parameters
        sftpPut({
            server: server,
            username: un,
            password: pw,
            data: filePath,
            destinationFileName: fileName
        });
    ChangeLog:
    2024/11/01 - Steve  - Initial
	
*/


function sftpPut(obj) {

    // Define default parameters
    obj = Object.assign({}, {
        port: 22,
        type: "file",
        data: "",
        destinationFileName: "",
        throwOnError: true,
        deleteSource: false,
        moveSource: false,
        moveSourceAppendEpoch: false
    }, obj);

    // Import the necessary Java classes
    importPackage(com.jcraft.jsch);
    var JSch = Packages.com.jcraft.jsch.JSch;
    var ChannelSftp = Packages.com.jcraft.jsch.ChannelSftp;
    var session = null;
    var channel = null;

    try {
        // Initialize JSch and create a new session
        var jsch = new JSch();
        session = jsch.getSession(obj.username, obj.server, obj.port); // Replace with your SFTP username and server address

        // Set password (or use public key authentication if preferred)
        session.setPassword(obj.password);

        // Configure session properties to skip host key checking (not recommended for production)
        var config = new java.util.Properties();
        config.put("StrictHostKeyChecking", "no");
        config.put("server_host_key", "ssh-rsa");
        session.setConfig(config);

        // Connect to the session
        session.connect();

        // Open SFTP channel
        channel = session.openChannel("sftp");
        channel.connect();

        // Cast to ChannelSftp and change to the desired directory on the SFTP server
        var sftp = channel;
        sftp.cd(obj.directory); // Replace with your remote directory

        if (obj.destinationFileName.trim() == "") {
            if (obj.throwOnError) {
                throw "No destination filename provided."
            }
        }

        if (obj.type.toLowerCase() == "string") {
            // Upload string
            sftp.put(new java.io.ByteArrayInputStream(obj.data.getBytes(StandardCharsets.UTF_8)), obj.destinationFileName);
        } else {
            // Upload file
            var file = new java.io.File(obj.data); // Replace with your local file path
            sftp.put(new java.io.FileInputStream(file), obj.destinationFileName);
            if (obj.moveSource) {
                var fileName = fileNameFromPath(obj.data);
                if (!obj.moveSourcePath.endsWith("/")) {
                    obj.moveSourcePath += "/";
                }
                if (obj.moveSourceAppendEpoch) {
                    var split = fileName.split(".");
                    var extension = fileName.split(".").pop();
                    split.pop();
                    var fileNameWithoutExtension = split.join(".");
                    var epoch = Date.now();
                    fileMove(obj.data, obj.moveSourcePath + fileNameWithoutExtension + "_" + epoch + "." + extension);
                } else {
                    fileMove(obj.data, obj.moveSourcePath + fileName);
                }
            } else if (obj.deleteSource) {
                fileDelete(obj.data);
            }
        }

        // (Optional) Download file
        // var outputFile = new java.io.FileOutputStream("/local/path/to/downloadedfile.txt");
        // sftp.get("remoteFileName.txt", outputFile);

        //logger.info("File uploaded successfully!");

    } catch (e) {
        if (obj.throwOnError) {
            throw e;
        }
        //logger.error("SFTP error: " + e);	
    } finally {
        // Close the SFTP channel and session
        if (channel != null) {
            channel.disconnect();
        }
        if (session != null) {
            session.disconnect();
        }
    }

}