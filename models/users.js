const mongoose = require('mongoose');
var Schema = mongoose.Schema

var User = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  admin: { // a new user is not admin. We can specify a user to be an admin
    type: Boolean,
    default: false
  }
})

module.exports = mongoose.model('User', User)