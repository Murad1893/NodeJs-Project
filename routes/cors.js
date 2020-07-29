const express = require('express');
const cors = require('cors');
const app = express()

// explicit adding of whitelisted urls for the cors module
const whitelist = ['http://localhost:3000', 'https://localhost:3443', 'http://localhost:3001'];

var corsOptionsDelegate = (req, callback) => {
  var corsOptions;
  console.log(req.header('Origin'));

  // checking if incoming request origin is in whitelist or not
  if (whitelist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true };
  }
  else {
    // allowOrigin will not be returned now
    corsOptions = { origin: false };
  }
  callback(null, corsOptions);
};

exports.cors = cors()
exports.corsWithOptions = cors(corsOptionsDelegate);