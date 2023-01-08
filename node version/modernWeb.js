/* INFO
 * This module exports some methods that can be used to modernize a node.js script.
 * Some methods or snippets are taken from the following sources:
 * LINK https://stackoverflow.com/questions/38788721/how-do-i-stream-response-in-express
 * LINK https://stackoverflow.com/questions/25713735/how-to-convert-object-to-binary-string
*/

const sha3= require('js-sha3')
const keccak256 = sha3.keccak256;
const ethers = require('ethers');
const forge = require("node-forge")
var privateMessagingKey;
var publicMessagingKey;
var privateMessagingKeyPem;
var publicMessagingKeyPem;

// Functions

async function getPublicMessagingKey() {
    return publicMessagingKey;
}

async function getPublicMessagingKeyPem() {
    return publicMessagingKeyPem;
}

async function signMessage(message, wallet) {
    const messageHash = keccak256(message);
    const signature = await wallet.signMessage(messageHash);
    return signature;
}

async function verifySignature(message, address, signature) {
    console.log("Verifying " + message + " on " + address + " with signature " + signature)
    const messageHash = keccak256(message);
    const recoveredAddress = ethers.utils.verifyMessage(messageHash, signature);
    console.log("Recovered address: " + recoveredAddress)
    return recoveredAddress === address;
  }
  
  function hashMessage(message) {
    const messageHash = keccak256(message);
    return messageHash;
  }
  
  function convertObjectToBinary(obj) {
    let output = '',
        input = JSON.stringify(obj) // convert the json to string.
    // loop over the string and convert each charater to binary string.
    for (i = 0; i < input.length; i++) {
        output += input[i].charCodeAt(0).toString(2) + " ";
    }
    return output.trimEnd();
  }
  
  function convertBinaryToObject(str) {
    var newBin = str.split(" ");
    var binCode = [];
    for (i = 0; i < newBin.length; i++) {
        binCode.push(String.fromCharCode(parseInt(newBin[i], 2)));
    }
    let jsonString = binCode.join("");
    let jsonObject = JSON.parse(jsonString)
    return  jsonObject
  }
  
  // SECTION Streamable responses
  
  // NOTE Streamable strings
  // Call it like this: resStreamable(res, [string], bytes=1024)
  function resStreamString(res, data, bytes=1024) {
    // Divide the data into chunks of bytes
    let buffer = Buffer.from(data);
    const chunks = [];
    while (buffer.length) {
          let i = buffer.lastIndexOf(32, bytes+1);
          // If no space found, try forward search
          if (i < 0) i = buffer.indexOf(32, bytes);
          // If there's no space at all, take the whole string
          if (i < 0) i = buffer.length;
          // This is a safe cut-off point; never half-way a multi-byte
          chunks.push(buffer.slice(0, i).toString());
          buffer = buffer.slice(i+1); // Skip space (if any)
    }
    // Send the chunks
    for (let i = 0; i < chunks.length; i++) {
        res.write(chunks[i]);
    }
    res.end();
    return true
  }
  
  // NOTE Streamable objects
  // Call it like this: resStreamable(res, [object], bytes=1024)
  function resStreamObject(res, data, bytes=1024) {
    // Convert the object to binary
    let binary = convertObjectToBinary(data)
    // Use the above function to stream the binary
    resStreamString(res, binary, bytes)
    return true
  } 
  
  // SECTION Streamable responses

  function randomString(length, chars='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
  }


// SECTION Encrypt and Decrypt

/* INFO
 * The sender encrypt the message with the receiver publicKey
 * The receiver decrypt the message with his privateKey
*/
// SECTION Key generation
async function generateKeys(signature) {
  // Generating keys deterministically so that they will always be the same
  const md = forge.md.sha256.create();
  md.update(signature);
  // Not outputting the seed, of course
  let seed = md.digest().toHex();
  console.log("Deterministic seed generated")
  // Rigged prng
  const prng = forge.random.createInstance()
  prng.seedFileSync = () => seed
  // Deterministic key generation
  var { privateKey, publicKey} = forge.pki.rsa.generateKeyPair({ bits: 4096, prng })
  // console.log(privateKey)
  // console.log("Private key: " + JSON.stringify(privateKey))
  // console.log("Public key: " + JSON.stringify(publicKey))
  // Testing enc/dec
  privateMessagingKey = privateKey
  privateMessagingKeyPem = forge.pki.privateKeyToPem(privateKey)
  publicMessagingKey = publicKey
  publicMessagingKeyPem = forge.pki.publicKeyToPem(publicKey)
  var enc = await encryptMessage("Hello")
  var mess = await decryptMessage(enc)
  if (mess==="Hello") {
      console.log("Encryption methods are ready")
  } else {
      console.log("ERROR: Encryption methods does not work!")
  }
  // Testing sign/verify
  var signature = await RSASignature("Hello")
  var verified = await verifyRSASignature("Hello", signature)
  if (verified) {
      console.log("Signature methods are ready")
  } else {
      console.log("ERROR: Signature methods does not work!")
  }
  // Testing pem conversion
  var pem = forge.pki.publicKeyToPem(publicKey)
  console.log(pem)
  var publicKey2 = forge.pki.publicKeyFromPem(pem)
  var enc = await encryptMessage("Hello", publicKey2)
  var mess = await decryptMessage(enc)
  if (mess==="Hello") {
      console.log("Pem conversion methods are ready")
  } else {
      console.log("ERROR: Pem conversion methods does not work!")
  }
  return true
}
// !SECTION Key generation

// NOTE Sign and Verify

async function RSASignature(message, privateKey=privateMessagingKey) {
  const md = forge.md.sha256.create();
  md.update(message);
  const signature = privateKey.sign(md);
  console.log("signature:", forge.util.encode64(signature));
  return signature
}

async function verifyRSASignature(message, signature, publicKey=publicMessagingKey) {
  try {
    publicKey = forge.pki.publicKeyFromPem(publicKey)
    console.log("INFO: publicKey is a pem public key, converting...")
  } catch (error) {
    console.log(error)
    console.log("INFO: publicKey could already be a forge public key")
  }
  const md = forge.md.sha256.create();
  md.update(message);
  const verified = publicKey.verify(md.digest().bytes(), signature);
  console.log("verified:", verified);
  return verified
}

// NOTE Encrypt and Decrypt

async function encryptMessage(message, publicKey=publicMessagingKey) {
  const encrypted = publicKey.encrypt(message)
  console.log("encrypted:", forge.util.encode64(encrypted));
  return encrypted
}

async function decryptMessage(encryptedMessage, privateKey=privateMessagingKey) {
  const decrypted = privateKey.decrypt(encryptedMessage);
  console.log("decrypted:", decrypted);
  return decrypted
}

// !SECTION Encrypt and Decrypt

// ANCHOR Exporting everything
module.exports = {
    publicMessagingKey: getPublicMessagingKey,
    publicMessagingKeyPem: getPublicMessagingKeyPem,
    publicKeyToPem: forge.pki.publicKeyToPem,
    publicKeyFromPem: forge.pki.publicKeyFromPem,
    signMessage: signMessage,
    verifySignature: verifySignature,
    hashMessage: hashMessage,
    convertObjectToBinary: convertObjectToBinary,
    convertBinaryToObject: convertBinaryToObject,
    resStreamString: resStreamString,
    resStreamObject: resStreamObject,
    randomString: randomString,
    generateKeys: generateKeys,
    encryptMessage: encryptMessage,
    decryptMessage: decryptMessage,
    RSASignature: RSASignature,
    verifyRSASignature: verifyRSASignature,
    decode64: forge.util.decode64,
    encode64: forge.util.encode64
}