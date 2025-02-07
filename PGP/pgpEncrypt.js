/**
 * Encrypts data using one or more PGP public keys.
 * @param {Object} settings - Configuration for the encryption process.
 * @param {string|byteArray} settings.input - The data to be encrypted (string, byte array, or file path).
 * @param {string} settings.inputType - Type of input: 'string', 'byteArray', or 'filename'.
 * @param {string|string[]} settings.publicKeyPaths - Path(s) to the public key file(s). Can be a single path or an array for multiple recipients.
 * @param {boolean} [settings.armor=false] - Whether to output ASCII-armored encryption (true) or binary (false).
 * @param {boolean} [settings.withIntegrityCheck=true] - Whether to include an integrity check.
 * @param {boolean} [settings.compress=true] - Whether to compress the data before encryption.
 * @param {number} [settings.compressionAlgorithm=PGPCompressedData.ZIP] - Compression algorithm: ZIP, ZLIB, or BZIP2.
 * @param {number} [settings.encryptionAlgorithm=PGPEncryptedData.CAST5] - Encryption algorithm: CAST5, AES_128, AES_256, etc.
 * @param {string|byteArray} [settings.outputDestination="byteArray"] - Output format: 'byteArray', 'string', or file path for direct output.
 * @param {boolean} [settings.log=false] - Whether to log detailed encryption steps.
 * @returns {string|byteArray} Encrypted data or file path, depending on the outputDestination.
 * @throws {Error} If required parameters are missing or encryption fails.
 */

/*
    Read more about what to choose:
    https://wellspan.sharepoint.com/sites/EnterpriseIntegration/_layouts/15/Doc.aspx?sourcedoc={f416ae9f-eda5-4642-a390-f7f591c5dbbf}&action=edit&wd=target%28DOCUMENTATION%2FMirth%2FDevelop.one%7Ce49fe617-f198-4220-8215-726c21d5f76a%2FDetermine%20Compression%20and%20Algorithm%7Cefa9defd-0cb2-4d9c-93cb-f6e7bb07d9ef%2F%29&wdorigin=NavigationUrl
 */
/*
In Bouncy Castle's org.bouncycastle.openpgp.PGPCompressedData, the compression methods are defined by the OpenPGP standard. Here are the available compression algorithms:

Uncompressed: No compression is applied.
ZIP: Uses the ZIP compression algorithm.
ZLIB: Uses the ZLIB compression algorithm.
BZIP2: Uses the BZIP2 compression algorithm.
 */
/*
In Bouncy Castle's org.bouncycastle.openpgp.PGPEncryptedData, the possible encryption algorithms are defined by the OpenPGP standard. Here are the supported symmetric encryption algorithms:

IDEA (International Data Encryption Algorithm)
TripleDES (Triple Data Encryption Standard)
CAST5
Blowfish
AES-128 (Advanced Encryption Standard with 128-bit key)
AES-192 (Advanced Encryption Standard with 192-bit key)
AES-256 (Advanced Encryption Standard with 256-bit key)
Twofish
Camellia-128
Camellia-192
Camellia-256


should be able to send in: "PGPEncryptedData.CAST5"
 */
function pgpEncrypt(settings) {
    // Define default settings
    var defaultSettings = {
        input: null, // Data to encrypt
        inputType: "string", // Type of the input (string, filename, or byteArray)
        publicKeyPaths: null, // Path(s) to public key files
        armor: true, // Whether to use ASCII-armored output
        withIntegrityCheck: true, // Add an integrity check
        compress: true, // Enable compression
        compressionAlgorithm: org.bouncycastle.openpgp.PGPCompressedData.ZIP, // Compression algorithm https://downloads.bouncycastle.org/java/docs/bcpg-jdk14-javadoc/org/bouncycastle/openpgp/PGPCompressedData.html
        encryptionAlgorithm: org.bouncycastle.openpgp.PGPEncryptedData.CAST5, // Encryption algorithm https://downloads.bouncycastle.org/java/docs/bcpg-jdk15to18-javadoc/org/bouncycastle/openpgp/PGPEncryptedData.html
        outputDestination: "string", // Output format: string, byteArray, or file path
    };

    // Merge custom settings with defaults
    settings = Object.assign(defaultSettings, settings);

    // Validate required inputs
    if (!settings.input || !settings.publicKeyPaths) {
        throw new Error("Input data and public key path(s) are required.");
    }

    // Adjust compression settings if disabled
    if (!settings.compress) {
        settings.compressionAlgorithm = org.bouncycastle.openpgp.PGPCompressedData.UNCOMPRESSED;
    }

    // Add BouncyCastle security provider
    java.security.Security.addProvider(new org.bouncycastle.jce.provider.BouncyCastleProvider());

    // Ensure publicKeyPaths is an array
    var publicKeys = Array.isArray(settings.publicKeyPaths) ?
        settings.publicKeyPaths : [settings.publicKeyPaths];

    // Read public keys
    var encryptionKeys = {};
    publicKeys.forEach(function (keyPath) {
        encryptionKeys[keyPath] = pgpReadPublicKey({
            keyFilePath: keyPath
        });
    });

    // Initialize encryption generator with integrity check and algorithm
    var cPk = new org.bouncycastle.openpgp.PGPEncryptedDataGenerator(
        new org.bouncycastle.openpgp.operator.jcajce.JcePGPDataEncryptorBuilder(3) // Use appropriate encryption algorithm constant
            .setProvider("BC") // Set provider
            .setWithIntegrityPacket(settings.withIntegrityCheck)
    );

    // Add encryption methods for each public key
    publicKeys.forEach(function (keyPath) {
        cPk.addMethod(
            new org.bouncycastle.openpgp.operator.bc.BcPublicKeyKeyEncryptionMethodGenerator(encryptionKeys[keyPath])
        );
    });

    // Convert input to byte array based on input type
    var clearData;
    switch (settings.inputType) {
        case "string":
            clearData = java.lang.String(settings.input).getBytes("UTF-8");
            break;
        case "filename":
            var file = new java.io.File(settings.input);
            if (!file.exists()) {
                throw new Error("Input file does not exist: " + settings.input);
            }
            clearData = java.nio.file.Files.readAllBytes(file.toPath());
            break;
        case "byteArray":
            clearData = settings.input;
            break;
        default:
            throw new Error("Invalid input type. Must be 'string', 'byteArray', or 'filename'.");
    }

    // Create output stream for encrypted data
    var encOut = new Packages.java.io.ByteArrayOutputStream();
    var out = encOut;

    // Use armored output if specified
    if (settings.armor) {
        out = new Packages.org.bouncycastle.bcpg.ArmoredOutputStream(encOut);
    }

    // Compress data if enabled
    var bOut = new ByteArrayOutputStream();
    var comData = new org.bouncycastle.openpgp.PGPCompressedDataGenerator(settings.compressionAlgorithm);
    var cos = comData.open(bOut);
    var lData = new org.bouncycastle.openpgp.PGPLiteralDataGenerator();
    var pOut = lData.open(cos, 'b', "_CONSOLE", clearData.length, new Date());
    pOut.write(clearData);
    lData.close();
    comData.close();

    // Encrypt compressed or uncompressed data
    var bytes = bOut.toByteArray();
    var cOut = cPk.open(out, bytes.length);
    cOut.write(bytes);
    cOut.close();
    out.close();

    // Handle output based on destination setting
    if (settings.outputDestination === "byteArray") {
        return encOut;
    } else if (settings.outputDestination === "string") {
        return encOut.toString();
    } else if (settings.outputDestination) {
        var outputFile = new java.io.File(settings.outputDestination);
        var fileOutputStream = new java.io.FileOutputStream(outputFile);
        fileOutputStream.write(encOut.toByteArray()); // Ensure correct data written
        fileOutputStream.close();
        return outputFile.getAbsolutePath();
    } else {
        throw new Error("Invalid output destination.");
    }
}