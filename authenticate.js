const passport = require('passport');
var LocalStrategy = require('passport-local').Strategy // this will import the local strategy (username, pass)
var User = require('./models/users')
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var FacebookTokenStrategy = require('passport-facebook-token')


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

// to verify admin

exports.verifyAdmin = (req, res, next) => {
  if (req.user.admin) {
    next();
  } else {
    var err = new Error("You are not authorized to perform this operation!");
    err.status = 403;
    return next(err);
  }
};

// we can create our own passport strategy here
exports.facebookPassport = passport.use(new FacebookTokenStrategy({
  clientID: config.facebook.clientId,
  clientSecret: config.facebook.clientSecret
},
  // accessToken is supplied by the server
  (accessToken, refreshToken, profile, done) => {
    User.findOne({ // checking that user has previously logged in or not
      // the profile will contain many information which we can use
      facebook: profile.id // this search can find the user in the database
    }, (err, user) => {
      if (err) {
        return done(err, false)
      }
      if (!err && user !== null) {
        // we have found the user
        return done(null, user)
      }
      else {
        // if user doesnot exist, so we must create a new one
        user = new User({
          username: profile.displayName,
        })
        // setting fields for the user
        user.facebookId = profile.id;
        user.firstname = profile.name.givenName;
        user.lastname = profile.name.familyName;

        user.save((err, user) => {
          if (err)
            return done(err, false)
          else
            return done(null, user)
        })
      }
    })
  }))