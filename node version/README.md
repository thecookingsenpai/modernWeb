# modernWeb

## A wrapper around multiple functions that simplify life of a modern nodejs developer

### Important note

While we are glad that this package is being actively used and downloaded, we did not expect such a huge number of downloads. Hence, we are rushing to document the package. Please bear with us.

### What is modernWeb?

modernWeb is a package that provides many functions as a module, and has to be used in conjunction with import statements either in a nodejs environment or using transpilers like parcelJS (which we used and tested against this package).

The package itself needs dependencies that you can install by npm install.

### Features and methods

#### publicMessagingKey

Alias for getPublicMessagingKey method, which returns the public key (if generated) contained in the current environment.

#### publicMessagingKeyPem

Alias for getPublicMessagingKeyPem method, which returns the public key (if generated) contained in the current environment in PEM format.

#### publicKeyToPem

Alias for forge.pki.publicKeyToPem

#### publicKeyFromPem

Alias for forge.pki.publicKeyFromPem

#### signMessage

Given a ethers.js compliant wallet, sign a message using the wallet itself

#### verifySignature

Verify a ethers.js compliant signature (also web3 compliant of course) against an address

#### hashMessage

Returns the keccak256 hash of a message

#### convertObjectToBinary

Returns a binary representation in string format of any object

#### convertBinaryToObject

Returns an object from a string binary representation of it

#### resStreamString

Stream a string over a 'res' object compatible with Express response objects

#### resStreamObject

Stream an object over a 'res' object compatible with Express response objects

#### randomString

Generates a random string

#### generateKeys

Generates a deterministic RSA keypair (for example from a signature)

#### encryptMessage

Encrypts a message using the public key of the generated keypair

#### decryptMessage

Decrypts a message using the private key of the generated keypair

#### RSASignature

Sign a message using the private key of the generated keypair

#### verifyRSASignature

Verify a message using the public key provided

#### decode64

Alias for forge.util.decode64

#### encode64

Alias for forge.util.encode64
