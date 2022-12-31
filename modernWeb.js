/* INFO
 * This module exports some methods that can be used to modernize a node.js script.
 * Some methods or snippets are taken from the following sources:
 * LINK https://stackoverflow.com/questions/38788721/how-do-i-stream-response-in-express
 * LINK https://stackoverflow.com/questions/25713735/how-to-convert-object-to-binary-string
*/

const keccak256 = require('js-sha3') 
const ethers = require('ethers');

// Functions
async function verifySignature(message, address, signature) {
    console.log("Verifying " + message + " on " + address + " with signature " + signature)
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
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
    return JSON.parse(jsonString)
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

// ANCHOR Exporting everything
module.exports = {
    verifySignature: verifySignature,
    hashMessage: hashMessage,
    convertObjectToBinary: convertObjectToBinary,
    convertBinaryToObject: convertBinaryToObject,
    resStreamString: resStreamString,
    resStreamObject: resStreamObject
}