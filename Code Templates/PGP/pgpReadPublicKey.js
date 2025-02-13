/**
 * Reads a PGP public key from a file and extracts the encryption key.
 * This function can return either a single key or all the encryption keys present in the keyring.
 *
 * @param {Object} settings - Configuration for reading the public key.
 * @param {string} settings.keyFilePath - Path to the PGP public key file.
 * @param {string} [settings.userId=null] - Optional user ID or email to filter the key. If null, the first encryption key is returned.
 * @param {boolean} [settings.returnAll=false] - Whether to return all encryption keys in the keyring. Default is false, which returns the first encryption key found.
 * @param {boolean} [settings.log=false] - Whether to log detailed steps for debugging.
 * @returns {Array|Object} - An array of public encryption keys if `returnAll` is true, otherwise the first public encryption key found.
 * @throws {Error} - Throws an error if the key cannot be found, or there is a problem reading the key file.
 */
/*
1. Read the First Encryption Key
var key = pgpReadPublicKey({
   keyFilePath: "/path/to/public-key.asc"
});
console.log(key); // The first encryption key found in the keyring

*/
/*
2. Read All Encryption Keys
var keys = pgpReadPublicKey({
   keyFilePath: "/path/to/public-key.asc",
   returnAll: true
});
console.log(keys); // Array of all encryption keys found in the keyring

*/
/*
3. Filter by User ID or Email
var key = pgpReadPublicKey({
   keyFilePath: "/path/to/public-key.asc",
   userId: "user@example.com"
});
console.log(key); // The encryption key associated with the given user ID

*/
/*
4. Return All Keys Associated with a User ID
var keys = pgpReadPublicKey({
    keyFilePath: "/path/to/public-key.asc",
    userId: "user@example.com",
    returnAll: true
});
console.log(keys); // Array of encryption keys associated with the user

*/
function pgpReadPublicKey(settings) {
    // Default settings and user overrides
    settings = Object.assign({}, {
        keyFilePath: null,  // Path to the PGP public key file
        userId: null,       // Optional user ID to filter the key
        returnAll: false,   // Whether to return all encryption keys
        log: false          // Whether to log detailed steps
    }, settings);

    if (!settings.keyFilePath) {
        throw new Error("The key file path is required.");
    }

    var ins = new java.io.FileInputStream(settings.keyFilePath);

    try {
        if (settings.log) {
            logger.info("Reading public key from: " + settings.keyFilePath);
        }

        // Wrap the file input stream with an armored input stream
        var decoderStream = org.bouncycastle.openpgp.PGPUtil.getDecoderStream(ins);

        // Use the public key ring collection constructor that includes the decoder stream
        var keyRingCollection = new org.bouncycastle.openpgp.jcajce.JcaPGPPublicKeyRingCollection(decoderStream);

        var keys = [];
        var keyRings = keyRingCollection.getKeyRings();

        // Loop through key rings and find the public keys that can be used for encryption
        while (keyRings.hasNext()) {
            var keyRing = keyRings.next();
            var publicKeys = keyRing.getPublicKeys();

            while (publicKeys.hasNext()) {
                var publicKey = publicKeys.next();
                if (publicKey.isEncryptionKey()) {
                    if (settings.userId) {
                        // Check if the public key matches the given userId (if provided)
                        var keyUserIds = publicKey.getUserIDs();
                        while (keyUserIds.hasNext()) {
                            var keyUserId = keyUserIds.next();
                            if (keyUserId.includes(settings.userId)) {
                                keys.push(publicKey);
                                break;
                            }
                        }
                    } else {
                        keys.push(publicKey); // Found encryption key, add it to the list
                    }
                }
            }
        }

        if (keys.length === 0) {
            throw new Error("Can't find any encryption keys in the key ring.");
        }

        if (settings.returnAll) {
            return keys; // Return all matching encryption keys
        }

        return keys[0]; // Return the first encryption key found

    } catch (e) {
        throw new Error("Failed to read public key: " + e.message);
    } finally {
        ins.close();
    }
}