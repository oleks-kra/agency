const { Readable } = require('stream');
// Create a readable stream from an image buffer
module.exports = function bufferToStream(buffer) {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null); // Signal the end of the stream
  return stream;
};
