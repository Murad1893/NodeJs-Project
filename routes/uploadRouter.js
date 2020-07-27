const express = require('express');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const authenticate = require('../authenticate')
const multer = require('multer');

// we will do some configuration for multer
var storage = multer.diskStorage({
  // for configuring the storage engine
  destination: (req, file, cb) => {
    // file is the file processed by multer and cb is callback
    cb(null, 'public/images')
  },

  filename: (req, file, cb) => {
    // original name will be given same as the client name given
    // else multer will give random name
    cb(null, file.originalname)
  }
})

// file filter that will define files types to be used
const imageFileFilter = (req, file, cb) => {
  // using a regular expression here
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('You can upload only image files!'), false)
  }
  // else we will let the image pass through
  cb(null, true)
}

// configuring multer module for upload
const upload = multer({ storage: storage, fileFilter: imageFileFilter })

const uploadRouter = express.Router()
uploadRouter.use(bodyParser.json())

uploadRouter.route('/')
  .post(authenticate.verifyUser, authenticate.
    // upload single means that we can upload a single file from client side
    // upload will take care of all errors
    verifyAdmin, upload.single('imageFile'), (req, res) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      // req.file from server to client, which will contain the path of the image file
      // it also contains additional information about the file
      res.json(req.file);
    })
  // these operations are not allowed
  .get(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload');
  })
  .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /imageUpload');
  })
  .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /imageUpload');
  })

// we will only 

module.exports = uploadRouter