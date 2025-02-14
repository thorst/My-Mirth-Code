/*
    Calls gpg at the command line. Supports both file-based and string-based.
  
    Parameters:
        - encryptedString (string): Encrypted message to decrypt (use either encryptedString or inputFile).
        - inputFile (string): Path to encrypted file.
        - outputFile (string): Path to save the decrypted output (only applicable for file decryption).
        - armor (boolean): If true, outputs in ASCII-armored format.

    // Example usage:
    var decryptOptions = {
        encryptedString: encryptedText,
        armor: true
    };
    var decryptedText = pgpDecryptGPG(decryptOptions);
    logger.info("Decrypted Message:\n" + decryptedText);
*/

function pgpDecryptGPG(options) {
    var command = "gpg --decrypt";

    if (options.armor) command += " --armor";

    if (options.inputFile) {
        command += " --output " + JSON.stringify(options.outputFile) + " " + JSON.stringify(options.inputFile);
    } else {
        command = "echo " + JSON.stringify(options.encryptedString) + " | " + command;
    }

    var processBuilder = new java.lang.ProcessBuilder("/bin/sh", "-c", command);
    processBuilder.redirectErrorStream(true);
    var process = processBuilder.start();

    var reader = new java.io.BufferedReader(new java.io.InputStreamReader(process.getInputStream()));
    var decryptedOutput = "";
    var line;
    while ((line = reader.readLine()) !== null) {
        decryptedOutput += line + "\n";
    }
    process.waitFor();

    return decryptedOutput.trim();
}