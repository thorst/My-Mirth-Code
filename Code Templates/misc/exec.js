/**
    Allows you to execute command line commands

    @param {String} args - 	The command to execute at command line
    @param {String} charset - OPTIONAL character set to use if not default
	
    @return {Object} {
        @return {String?} exitValue - The exit value
        @return {String} stdo - Any output that was captured
        @return {String?} stderr - Any errors that were captured
    }

    Example:
        cmd = "df -h /cl";
        result = exec(cmd);
        var line = result.stdout.split("\n")[1];
*/
//https://forums.mirthproject.io/forum/mirth-connect/support/7041-mirth-tools-user-defined-functions?p=79849#post79849

function exec(args, charset) {
    var process = java.lang.Runtime.getRuntime().exec(["/bin/sh", "-c", args]);
    var stdoutConsumer = new StreamConsumer(process.getInputStream(), charset);
    var stderrConsumer = new StreamConsumer(process.getErrorStream(), charset);
    return {
        exitValue: process.waitFor(),
        stdout: stdoutConsumer.getOutput(),
        stderr: stderrConsumer.getOutput()
    };
}

// Do not call this directly
function StreamConsumer(is, charset) {
    var output = '';

    var thread = new java.lang.Thread({
        run: function () {
            if (typeof charset !== 'undefined') {
                output = org.apache.commons.io.IOUtils.toString(is, charset);
            } else {
                output = org.apache.commons.io.IOUtils.toString(is);
            }
        }
    });

    this.interrupt = function () {
        thread.interrupt();
    }

    this.getOutput = function () {
        thread.join();
        return output;
    };

    thread.start();
}