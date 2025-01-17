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
*/
function pgpEncrypt(settings) {
    // Merge defaults with user-provided settings using Object.assign
    var defaultSettings = {
        input: null,
        inputType: "string",
        publicKeyPaths: null,
        armor: false,
        withIntegrityCheck: true,
        compress: true,
        compressionAlgorithm: org.bouncycastle.openpgp.PGPCompressedData.ZIP,
        encryptionAlgorithm: org.bouncycastle.openpgp.PGPEncryptedData.CAST5,
        outputDestination: "byteArray",
        log: false
    };
    settings = Object.assign(defaultSettings, settings);

    // Validate required settings
    if (!settings.input || !settings.publicKeyPaths) {
        throw new Error("Input data and public key path(s) are required.");
    }

    // Initialize BouncyCastle security provider
    java.security.Security.addProvider(new org.bouncycastle.jce.provider.BouncyCastleProvider());

    // Log public key reading
    if (settings.log) logger.info("Reading public key(s)...");

    // Cache public keys in globalMap
    if (!globalMap.containsKey("encryptionKeys")) {
        $gc("encryptionKeys", {});
    }
    var encryptionKeys = $gc("encryptionKeys");

    var PGPEncryptedDataGenerator = new org.bouncycastle.openpgp.PGPEncryptedDataGenerator(
        new org.bouncycastle.openpgp.operator.jcajce.JcePGPDataEncryptorBuilder(settings.encryptionAlgorithm)
            .setWithIntegrityPacket(settings.withIntegrityCheck)
            .setSecureRandom(new java.security.SecureRandom())
            .setProvider("BC")
    );

    // Ensure publicKeyPaths is an array
    var publicKeys = Array.isArray(settings.publicKeyPaths)
        ? settings.publicKeyPaths
        : [settings.publicKeyPaths];

    // Add public keys to the encryption generator
    publicKeys.forEach(function (keyPath) {
        if (!encryptionKeys[keyPath]) {
            var publicKey = pgpReadPublicKey({ keyFilePath: keyPath });
            encryptionKeys[keyPath] = publicKey;
        }
        PGPEncryptedDataGenerator.addMethod(
            new org.bouncycastle.openpgp.operator.jcajce.JcePublicKeyKeyEncryptionMethodGenerator(encryptionKeys[keyPath])
                .setProvider("BC")
                .setSecureRandom(new java.security.SecureRandom())
        );
    });

    // Convert input data to byte array
    var inputBytes;
    switch (settings.inputType) {
        case "string":
            inputBytes = java.lang.String(settings.input).getBytes("UTF-8");
            break;
        case "filename":
            var file = new java.io.File(settings.input);
            inputBytes = java.nio.file.Files.readAllBytes(file.toPath());
            break;
        case "byteArray":
            inputBytes = settings.input;
            break;
        default:
            throw new Error("Invalid input type.");
    }

    // Optionally compress input data
    if (settings.compress) {
        if (settings.log) logger.info("Compressing data...");
        var compressionStream = new java.io.ByteArrayOutputStream();
        var compressedDataGenerator = new org.bouncycastle.openpgp.PGPCompressedDataGenerator(settings.compressionAlgorithm);
        var compressionOut = compressedDataGenerator.open(compressionStream);
        compressionOut.write(inputBytes);
        compressionOut.close();
        compressedDataGenerator.close();
        inputBytes = compressionStream.toByteArray();
    }

    // Prepare output stream
    var byteArrayOutputStream = new java.io.ByteArrayOutputStream();
    var out = settings.armor
        ? new org.bouncycastle.bcpg.ArmoredOutputStream(byteArrayOutputStream)
        : byteArrayOutputStream;

    // Log encryption step
    if (settings.log) logger.info("Encrypting data...");

    // Encrypt the data
    var cOut = PGPEncryptedDataGenerator.open(out, byteArrayOutputStream.size());
    cOut.write(inputBytes);
    cOut.close();
    if (settings.armor) out.close();

    var encryptedBytes = byteArrayOutputStream.toByteArray();

    // Return the encrypted data based on outputDestination
    if (settings.outputDestination === "byteArray") {
        return encryptedBytes;
    } else if (settings.outputDestination === "string") {
        return new java.lang.String(encryptedBytes, "UTF-8");
    } else {
        var outputFile = new java.io.File(settings.outputDestination);
        var fileOutputStream = new java.io.FileOutputStream(outputFile);
        fileOutputStream.write(encryptedBytes);
        fileOutputStream.close();
        return outputFile.getAbsolutePath();
    }
}