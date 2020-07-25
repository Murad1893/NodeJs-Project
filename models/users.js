const mongoose = require('mongoose');
var Schema = mongoose.Schema
passportLocalMongoose = require('passport-local-mongoose')

var User = new Schema({
  admin: { // a new user is not admin. We can specify a user to be an admin
    type: Boolean,
    default: false
  }
})

User.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', User)