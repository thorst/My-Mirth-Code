# PGP

This is meant to be a fully featured pgp library for Mirth Connect, using code templates. We prefer code tempaltes so that any developer can make changes as needed, and we dont need to compule in java before uploading to the server.

The Encrypt function can use multiple public keys, configurable compression and encryption algorithms, multiple input/output data types, and integrity check. It also caches the keys in the Global Channel Map.

The Decrypt function auto-detects encryption/compression algorithms, caches private key and passphrase on Global Channel Map, as well as the multiple input/output data types.


## Encrypt

### Parameters
* input: The data to be encrypted. It can be a string, byte array, or file path.
* inputType: Specifies the type of input. Options are 'string', 'byteArray', or 'filename'.
* publicKeyPaths: Path(s) to the public key file(s). This can be a single path or an array for multiple recipients.
* armor: (Optional) Whether to output ASCII-armored encryption (true) or binary (false). Default is false.
* withIntegrityCheck: (Optional) Whether to include an integrity check. Default is true.
* compress: (Optional) Whether to compress the data before encryption. Default is true.
* compressionAlgorithm: (Optional) Compression algorithm to use. Options are PGPCompressedData.ZIP, PGPCompressedData.ZLIB, or PGPCompressedData.BZIP2. Default is PGPCompressedData.ZIP.
* encryptionAlgorithm: (Optional) Encryption algorithm to use. Options include PGPEncryptedData.CAST5, PGPEncryptedData.AES_128, PGPEncryptedData.AES_256, etc. Default is PGPEncryptedData.CAST5.
* outputDestination: (Optional) Output format. Options are 'byteArray', 'string', or a file path for direct output. Default is 'byteArray'.
* log: (Optional) Whether to log detailed encryption steps. Default is false.

### Example 1: Basic Encryption with Default Settings
```javascript
var encryptedData = pgpEncrypt({
    input: "Hello, World!",
    inputType: "string",
    publicKeyPaths: "/path/to/public/key.asc"
});
```

### Example 2: Encryption with Compression and Logging
```javascript
var encryptedData = pgpEncrypt({
    input: "Sensitive data",
    inputType: "string",
    publicKeyPaths: ["/path/to/public/key1.asc", "/path/to/public/key2.asc"],
    compress: true,
    compressionAlgorithm: org.bouncycastle.openpgp.PGPCompressedData.ZLIB,
    log: true
});
```

### Example 3: Encryption with Specific Encryption Algorithm and Output to File
```javascript
var encryptedFilePath = pgpEncrypt({
    input: "/path/to/input/file.txt",
    inputType: "filename",
    publicKeyPaths: "/path/to/public/key.asc",
    encryptionAlgorithm: org.bouncycastle.openpgp.PGPEncryptedData.AES_256,
    outputDestination: "/path/to/output/encrypted_file.pgp"
});
```

### Supported Compression Algorithms
In Bouncy Castle's org.bouncycastle.openpgp.PGPCompressedData, the compression methods are defined by the OpenPGP standard. Here are the available compression algorithms:
* PGPCompressedData.UNCOMPRESSED
* PGPCompressedData.ZIP
* PGPCompressedData.ZLIB
* PGPCompressedData.BZIP2

### Supported Encryption Algorithms
In Bouncy Castle's org.bouncycastle.openpgp.PGPEncryptedData, the possible encryption algorithms are defined by the OpenPGP standard. Here are the supported symmetric encryption algorithms:
* PGPEncryptedData.IDEA
* PGPEncryptedData.TRIPLE_DES
* PGPEncryptedData.CAST5
* PGPEncryptedData.BLOWFISH
* PGPEncryptedData.AES_128
* PGPEncryptedData.AES_192
* PGPEncryptedData.AES_256
* PGPEncryptedData.TWOFISH
* PGPEncryptedData.CAMELLIA_128
* PGPEncryptedData.CAMELLIA_192
* PGPEncryptedData.CAMELLIA_256


## Decrypt

### Parameters
The pgpDecrypt function accepts a configuration object (settings) with the following parameters:
* input: The data to be decrypted. It can be a string, byte array, or file path.
* inputType: The type of input. Accepted values are 'string', 'byteArray', or 'filename'.
* privateKeyPath: The path to the private key file.
* passphrase: The passphrase for the private key. It can be a string or a file path.
* passphraseType: The type of passphrase. Accepted values are 'string' or 'filename'. Default is 'filename'.
* log: A boolean indicating whether to log detailed decryption steps. Default is false.
* outputDestination: The format of the decrypted output. Accepted values are 'byteArray', 'string', or a file path for direct output. Default is 'byteArray'.

### Example 1: Decrypting Data from a File with Cached Passphrase and Private Key
```javascript
var settings = {
    input: "/path/to/encrypted-file.pgp",
    inputType: "filename",
    privateKeyPath: "/path/to/private-key.asc",
    passphrase: "/path/to/passphrase.txt", // Filepath by default
    outputDestination: "/path/to/decrypted-output.txt",
    log: true
};
var decryptedFilePath = pgpDecrypt(settings);
console.log("Decrypted file saved at:", decryptedFilePath);
```

### Example 2: Decrypting Data from a String with Inline Passphrase
```javascript
var encryptedData = "Encrypted string data here";
var settings = {
    input: encryptedData,
    inputType: "string",
    privateKeyPath: "/path/to/private-key.asc",
    passphrase: "mySecretPassphrase",
    passphraseType: "string", // Explicitly treat passphrase as a literal string
    outputDestination: "string",
    log: true
};
var decryptedData = pgpDecrypt(settings);
console.log("Decrypted string:", decryptedData);
```

### Potential Parameters for Compression and Encryption Algorithms
The provided code template automatically handles compression and encryption algorithms supported by the BouncyCastle library. It detects and processes compressed data and verifies the integrity of the decrypted data.
By following this guide, users can effectively use the PGP decryption code template in Mirth to decrypt PGP-encrypted data with various configurations.

### Note
The PGP Encrypt/Decrypt process may convert CRLF to LF in a file.  The PGP Library has something to do with that to ensure compatibility across platforms.  All you have to do is convert it back after your PGP code.  For example:

```javascript
msg = stringReplaceAll(stringFromJava(msg), "\n", "\r\n");
```

## Versions

Here are a list of our versions, so you can compare with your envrionment.
* Java - openjdk version "23.0.1" 2024-10-15
* Redhat - Red Hat Enterprise Linux release 8.10 (Ootpa)
* Mirth - 4.5.0
* Bouncy Castle - 1.79

## Bouncy Castle
Currently we only have `bcpg-jdk18on-1.79.jar` in our Resource. You can download that here: https://www.bouncycastle.org/download/bouncy-castle-java/#latest 

If you have isseus you can also download the following jar files to include in your resource:
* bcpkix-jdk18on-1.79.jar
* bcutil-jdk18on-1.79.jar
* bcprov-jdk18on-1.79.jar
