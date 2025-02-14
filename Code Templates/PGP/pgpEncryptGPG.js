/*
    Calls gpg at the command line. Supports both file-based and string-based.

    Parameters:
        - inputString (string): Plaintext message to encrypt (use either inputString or inputFile).
        - inputFile (string): Path to file to be encrypted.
        - outputFile (string): Path to save the encrypted output (only applicable for file encryption).
        - recipient (string): Email, key ID, or fingerprint of the recipient's public key.
        - encryptionAlgo (string): Cipher algorithm (e.g., "AES256").
        - compressionAlgo (string): Compression algorithm (e.g., "ZIP").
        - integrityCheck (boolean): Enables MDC integrity protection.
        - armor (boolean): If true, outputs in ASCII-armored format.

    // Example usage:
    var encryptOptions = {
        inputString: "Hello, this is a secret message.",
        recipient: "recipient@example.com",
        armor: true,
        encryptionAlgo: "AES256"
    };
    var encryptedText = pgpEncryptGPG(encryptOptions);
    logger.info("Encrypted Message:\n" + encryptedText);

*/


function pgpEncryptGPG(options) {
    var command = "gpg --encrypt";

    if (options.armor) command += " --armor";
    if (options.compressionAlgo) command += " --compress-algo " + options.compressionAlgo;
    if (options.encryptionAlgo) command += " --cipher-algo " + options.encryptionAlgo;
    if (options.integrityCheck) command += " --force-mdc";

    command += " --trust-model always --recipient " + JSON.stringify(options.recipient);

    if (options.inputFile) {
        command += " --output " + JSON.stringify(options.outputFile) + " --encrypt " + JSON.stringify(options.inputFile);
    } else {
        command = "echo " + JSON.stringify(options.inputString) + " | " + command;
    }

    var processBuilder = new java.lang.ProcessBuilder("/bin/sh", "-c", command);
    processBuilder.redirectErrorStream(true);
    var process = processBuilder.start();

    var reader = new java.io.BufferedReader(new java.io.InputStreamReader(process.getInputStream()));
    var encryptedOutput = "";
    var line;
    while ((line = reader.readLine()) !== null) {
        encryptedOutput += line + "\n";
    }
    process.waitFor();

    return encryptedOutput.trim();
}