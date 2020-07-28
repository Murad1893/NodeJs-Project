const mongoose = require('mongoose');
var Schema = mongoose.Schema
passportLocalMongoose = require('passport-local-mongoose')

var User = new Schema({
  // user information can now be retrieved
  firstname: {
    type: String,
    default: ''
  },
  lastname: {
    type: String,
    default: ''
  },
  // will contain the fbId of the user that has passed the token
  facebookId: String,
  admin: {
    type: Boolean,
    default: false
  }
})

User.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', User)