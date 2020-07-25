const passport = require('passport');
var LocalStrategy = require('passport-local').Strategy // this will import the local strategy (username, pass)
var User = require('./models/users')

// we are using passport mongoose so .authenticate() is provided as verify function
exports.local = passport.use(new LocalStrategy(User.authenticate()))

// we need to serialize and deserialize as we are using sessions
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser());