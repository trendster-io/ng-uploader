const express = require('express');
const errorHandler = require('express-async-handler');
const uploader = require('../middlewares/uploader');
const uploadsCtrl = require('../controllers/uploads.controller');

const router = express.Router();

router.post(
  '/upload',
  uploader('uploads').single('file'),
  errorHandler(uploadsCtrl.saveFile),
);

module.exports = router;
