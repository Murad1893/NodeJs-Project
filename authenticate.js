const passport = require('passport');
var LocalStrategy = require('passport-local').Strategy // this will import the local strategy (username, pass)
var User = require('./models/users')
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

var config = require('./config')

// we are using passport mongoose so .authenticate() is provided as verify function
exports.local = passport.use(new LocalStrategy(User.authenticate()))

// we need to serialize and deserialize as we are using sessions
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser());

exports.getToken = function (user) {
  // this will create and give a token

  return jwt.sign(user, config.secretKey,
    { expiresIn: 3600 }) // the payload will be the user from the param
  // additional settings such as expiry is also set
}

// options for the jwt based strategy
var opts = {}
// this will suggest how we will extract the jwt
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); // token will be added in the authentication header
opts.secretOrKey = config.secretKey;

// specifying the jwt strategy
exports.jwtPassport = passport.use(new JwtStrategy(opts,
  // done needs to be passed so token can parse and load things onto the req after verification
  // done is the callback our 
  (jwt_payload, done) => {
    console.log("JWT payload: " + jwt_payload)
    // there is an id field in jwt
    User.findOne({ _id: jwt_payload._id }, (err, user) => {
      if (err) {
        // this will denote that user does not exist
        return done(err, false)
      }
      else if (user) {
        return done(null, user)
      }
      else {
        // cannot find the user
        return done(null, false)
      }
    })
  }))

// to verify incoming user
// we will not making session, as we are using session based authentication
exports.verifyUser = passport.authenticate('jwt', { session: false })
