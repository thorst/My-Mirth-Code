/**
 * Finds and extracts a private key from a PGP secret key ring collection. This function
 * allows for flexibility, enabling users to pass in a key ring collection directly or an input stream.
 *
 * @param {Object} settings - The settings object that defines the behavior of the key search.
 * @param {java.io.InputStream} [settings.inputStream] - The input stream for loading the PGP secret key ring collection.
 * @param {org.bouncycastle.openpgp.jcajce.JcaPGPSecretKeyRingCollection} [settings.pgpSec] - A preloaded key ring collection.
 * @param {String|long} settings.keyID - The key ID or key identifier of the secret key to find.
 * @param {String} settings.passphrase - The passphrase for decrypting the private key.
 * @returns {org.bouncycastle.openpgp.PGPPrivateKey|null} The private key if found and decrypted, or `null` if not found.
 * @throws {Error} Throws an error if neither `inputStream` nor `pgpSec` is provided.
 */
/*
1. Using a Preloaded Secret Key Collection (pgpSec)
If you have already loaded the PGP secret key collection into pgpSec (such as from a previous call or file parsing), you can pass it directly to the function.

var pgpSec = new org.bouncycastle.openpgp.jcajce.JcaPGPSecretKeyRingCollection(
   org.bouncycastle.openpgp.PGPUtil.getDecoderStream(myInputStream)
);

var settings = {
   pgpSec: pgpSec,            // Use the preloaded key ring collection
   keyID: 1234567890,         // The key ID of the secret key you want to find
   passphrase: "myPassphrase" // The passphrase for decryption
};

var privateKey = pgpFindSecretKey(settings);
if (privateKey !== null) {
   // Successfully found and decrypted the private key
} else {
   // Private key not found
}

*/
/*
2. Using an Input Stream to Load the Secret Key Collection
If you have the key ring collection in a file or other input stream format, you can provide the stream to the function.

var fileInputStream = new java.io.FileInputStream(new java.io.File("/path/to/secret-key-ring.asc"));

var settings = {
   inputStream: fileInputStream, // Use the input stream to load the key ring
   keyID: 1234567890,            // The key ID of the secret key you want to find
   passphrase: "myPassphrase"    // The passphrase for decryption
};

var privateKey = pgpFindSecretKey(settings);
if (privateKey !== null) {
   // Successfully found and decrypted the private key
} else {
   // Private key not found
}
*/
function pgpFindSecretKey(settings) {
    // Validate required settings
    if (!settings.keyID || !settings.passphrase) {
        throw new Error("Key ID and passphrase are required.");
    }

    // Attempt to load the key ring collection if not provided externally
    var pgpSec;
    if (settings.pgpSec) {
        pgpSec = settings.pgpSec;  // Use preloaded key ring collection
    } else if (settings.inputStream) {
        pgpSec = new org.bouncycastle.openpgp.jcajce.JcaPGPSecretKeyRingCollection(
            org.bouncycastle.openpgp.PGPUtil.getDecoderStream(settings.inputStream)
        );
    } else {
        throw new Error("You must provide either 'pgpSec' (preloaded) or 'inputStream' (to load key ring collection).");
    }

    // Retrieve the secret key from the key ring collection
    var pgpSecKey = pgpSec.getSecretKey(settings.keyID);
    if (!pgpSecKey) {
        return null;
    }

    // Decrypt the private key with the provided passphrase
    var provider = new org.bouncycastle.openpgp.operator.jcajce.JcaPGPDigestCalculatorProviderBuilder()
        .setProvider("BC")
        .build();

    var decryptor = new org.bouncycastle.openpgp.operator.jcajce.JcePBESecretKeyDecryptorBuilder(provider)
        .setProvider("BC")
        .build(java.lang.String(settings.passphrase).toCharArray());

    return pgpSecKey.extractPrivateKey(decryptor);
}