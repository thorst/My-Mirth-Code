/**
 * Decrypts PGP-encrypted data using a private key and passphrase.
 * This function supports caching the private key and passphrase in the global channel map
 * to avoid redundant file reads, improving efficiency for repeated transactions.
 * 
 * @param {Object} settings - Configuration for the decryption process.
 * @param {string|byteArray} settings.input - The data to be decrypted (string, byte array, or file path).
 * @param {string} settings.inputType - Type of input: 'string', 'byteArray', or 'filename'.
 * @param {string} settings.privateKeyPath - Path to the private key file.
 * @param {string} settings.passphrase - The passphrase (or its file path, if passphraseType is 'filename').
 * @param {string} [settings.passphraseType="filename"] - Passphrase type: 'string' or 'filename'.
 * @param {boolean} [settings.log=false] - Whether to log detailed decryption steps.
 * @param {string|byteArray} [settings.outputDestination="byteArray"] - Output format: 'byteArray', 'string', or file path for direct output.
 * @returns {string|byteArray} Decrypted data or file path, depending on the outputDestination.
 * @throws {Error} If required parameters are missing, or decryption fails.
 * 
 * ## Examples
 * ### Example 1: Decrypting Data from a File with Cached Passphrase and Private Key
 * ```javascript
 * var settings = {
 *     input: "/path/to/encrypted-file.pgp",
 *     inputType: "filename",
 *     privateKeyPath: "/path/to/private-key.asc",
 *     passphrase: "/path/to/passphrase.txt", // Filepath by default
 *     outputDestination: "/path/to/decrypted-output.txt",
 *     log: true
 * };
 * 
 * var decryptedFilePath = pgpDecrypt(settings);
 * console.log("Decrypted file saved at:", decryptedFilePath);
 * ```
 * 
 * ### Example 2: Decrypting Data from a String with Inline Passphrase
 * ```javascript
 * var encryptedData = "Encrypted string data here";
 * var settings = {
 *     input: encryptedData,
 *     inputType: "string",
 *     privateKeyPath: "/path/to/private-key.asc",
 *     passphrase: "mySecretPassphrase",
 *     passphraseType: "string", // Explicitly treat passphrase as a literal string
 *     outputDestination: "string",
 *     log: true
 * };
 * 
 * var decryptedData = pgpDecrypt(settings);
 * console.log("Decrypted string:", decryptedData);
 * ```
 */
function pgpDecrypt(settings) {
    settings = Object.assign({}, {
        input: null,
        inputType: "string",
        privateKeyPath: null,
        passphrase: null,
        passphraseType: "filename",
        log: false,
        outputDestination: "byteArray"
    }, settings);

    // Validate required parameters
    if (!settings.input || !settings.privateKeyPath || !settings.passphrase) {
        throw new Error("Input data, privateKeyPath, and passphrase are required.");
    }

    // Add BouncyCastle provider
    java.security.Security.addProvider(new org.bouncycastle.jce.provider.BouncyCastleProvider());

    if (settings.log) {
        logger.info("Initializing decryption process...");
    }

    // Handle private key caching
    if ($gc('pgp_privateKey')) {
        settings.privateKey = $gc('pgp_privateKey');
    } else {
        settings.privateKey = fileReadString(settings.privateKeyPath);
        $gc('pgp_privateKey', settings.privateKey);
    }

    // Handle passphrase caching
    if (settings.passphraseType === "filename") {
        if ($gc('pgp_passphrase')) {
            settings.passphrase = $gc('pgp_passphrase');
        } else {
            settings.passphrase = fileReadString(settings.passphrase);
            $gc('pgp_passphrase', settings.passphrase);
        }
    } else if (settings.passphraseType === "string") {
        $gc('pgp_passphrase', settings.passphrase); // Cache inline passphrase for consistency
    } else {
        throw new Error("Invalid passphraseType. Accepted values are 'string' and 'filename'.");
    }

    // Step 1: Convert input into a byte array
    var inputBytes;
    switch (settings.inputType) {
        case "string":
            inputBytes = java.lang.String(settings.input).getBytes("UTF-8");
            break;
        case "filename":
            var file = new java.io.File(settings.input);
            inputBytes = new java.nio.file.Files.readAllBytes(file.toPath());
            break;
        case "byteArray":
            inputBytes = settings.input;
            break;
        default:
            throw new Error("Invalid input type. Accepted values are 'string', 'byteArray', and 'filename'.");
    }

    // Step 2: Prepare streams for PGP processing
    var inputStream = new java.io.ByteArrayInputStream(inputBytes);
    var pgpObjectFactory = new org.bouncycastle.openpgp.jcajce.JcaPGPObjectFactory(
        org.bouncycastle.openpgp.PGPUtil.getDecoderStream(inputStream)
    );

    if (settings.log) {
        logger.info("Reading private key...");
    }

    var pgpSec = new org.bouncycastle.openpgp.jcajce.JcaPGPSecretKeyRingCollection(
        org.bouncycastle.openpgp.PGPUtil.getDecoderStream(
            new java.io.ByteArrayInputStream(settings.privateKey.getBytes("UTF-8"))
        )
    );

    // Step 3: Process the encrypted data
    var pgpObj = pgpObjectFactory.nextObject();
    var encList = (pgpObj instanceof org.bouncycastle.openpgp.PGPEncryptedDataList)
        ? pgpObj
        : pgpObjectFactory.nextObject();

    var encryptedData = encList.getEncryptedDataObjects();
    var privateKey = null;
    var encryptedPacket = null;

    while (encryptedData.hasNext() && !privateKey) {
        encryptedPacket = encryptedData.next();
        privateKey = pgpFindSecretKey({
            pgpSec: pgpSec,
            keyID: encryptedPacket.getKeyID(),
            passphrase: settings.passphrase
        });
    }

    if (!privateKey) {
        throw new Error("Unable to find the corresponding private key for decryption.");
    }

    if (settings.log) {
        logger.info("Decrypting data...");
    }

    var decryptor = new org.bouncycastle.openpgp.operator.jcajce.JcePublicKeyDataDecryptorFactoryBuilder()
        .setProvider("BC")
        .build(privateKey);
    var clearStream = encryptedPacket.getDataStream(decryptor);

    // Step 4: Process the decrypted data
    var plainFactory = new org.bouncycastle.openpgp.jcajce.JcaPGPObjectFactory(clearStream);
    var message = plainFactory.nextObject();

    // Auto-detect compression
    if (message instanceof org.bouncycastle.openpgp.PGPCompressedData) {
        if (settings.log) {
            logger.info("Decompressing encrypted data...");
        }
        var compressedData = message;
        var decompressedStream = compressedData.getDataStream();
        var decompressedFactory = new org.bouncycastle.openpgp.jcajce.JcaPGPObjectFactory(decompressedStream);
        message = decompressedFactory.nextObject();
    }

    var outputStream = new java.io.ByteArrayOutputStream();

    if (message instanceof org.bouncycastle.openpgp.PGPLiteralData) {
        if (settings.log) {
            logger.info("Extracting literal data...");
        }
        var literalData = message;
        var inputStream = literalData.getInputStream();
        var ch;
        while ((ch = inputStream.read()) >= 0) {
            outputStream.write(ch);
        }
    } else {
        throw new Error("Unsupported PGP message type. Unable to process.");
    }

    // Auto-detect and verify integrity
    if (encryptedPacket.isIntegrityProtected() && !encryptedPacket.verify()) {
        throw new Error("Integrity check failed for the encrypted data.");
    }

    if (settings.log) {
        logger.info("Decryption successful.");
    }

    // Step 6: Return the decrypted data in the requested format
    var decryptedBytes = outputStream.toByteArray();
    if (settings.outputDestination === "byteArray") {
        return decryptedBytes;
    } else if (settings.outputDestination === "string") {
        return new java.lang.String(decryptedBytes, "UTF-8");
    } else {
        if (settings.log) {
            logger.info("Writing to " + settings.outputDestination);
        }
        var outputFile = new java.io.File(settings.outputDestination);
        var fileOutputStream = new java.io.FileOutputStream(outputFile);
        fileOutputStream.write(decryptedBytes);
        fileOutputStream.close();
        return outputFile.getAbsolutePath();
    }
}