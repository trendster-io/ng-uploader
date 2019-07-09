const crypto = require('crypto');

module.exports.genToken = (length, encoding) =>
  new Promise((resolve, reject) => {
    crypto.randomBytes(length, (err, buf) => {
      if (err) {
        return reject(err);
      }
      resolve(buf.toString(encoding));
    });
  });
