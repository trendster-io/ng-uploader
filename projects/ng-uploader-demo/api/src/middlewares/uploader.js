const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { genToken } = require('../utils/encryption');

const uploader = (location, allowedTypes) =>
  multer({
    storage: multer.diskStorage({
      destination(req, file, callback) {
        const dest = path.join(__dirname, '../../', location);
        fs.ensureDir(dest)
          .then(() => callback(null, dest))
          .catch(err => callback(err, null));
      },
      filename(req, file, callback) {
        genToken(32, 'hex')
          .then(token =>
            callback(null, `${token}.${file.mimetype.split('/')[1]}`)
          )
          .catch(err => callback(err, null));
      }
    }),
    fileFilter(req, file, callback) {
      const typeArray = file.mimetype.split('/');
      callback(
        null,
        allowedTypes && allowedTypes.length
          ? allowedTypes.includes(typeArray[0]) ||
              allowedTypes.includes(typeArray[1])
          : true
      );
    }
  });

module.exports = uploader;
