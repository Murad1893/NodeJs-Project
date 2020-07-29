var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser')
var passport = require('passport');
var cors = require('./cors')

var authenticate = require('../authenticate')
var User = require('../models/users')

var router = express.Router()
router.use(bodyParser.json())

// any endpoint will be given 200 status
router.options('*', cors.corsWithOptions, (req, res) => { res.sendStatus(200); })

/* GET users listing. */
router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  User.find({ admin: false })
    .then((users) => {
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.json(users) // this will send as a json response
    }, err => { next(err) })
    .catch((err) => next(err))
})

router.post('/signup', cors.corsWithOptions, (req, res, next) => {
  // we will use the inbuilt methods of passport local mongoose to creata a new User
  User.register(new User({ username: req.body.username }),
    req.body.password, (err, user) => { // a callback function
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({ err: err });
      }
      else {

        //if available then we will save
        if (req.body.firstname)
          user.firstname = req.body.firstname
        if (req.body.lastname)
          user.lastname = req.body.lastname;
        user.save((err, user) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({ err: err });
            return;
          }
        })
        // using passport to authenticate the user
        passport.authenticate('local')(req, res, () => {
          // a callback function
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          // we can check the success property to quickly check that registration done or not
          res.json({ success: true, status: 'Registration Successful!' });
        });
      }
    });
});

// we will be editing such that passport authentication returns some useful information
router.post('/login', cors.corsWithOptions, (req, res, next) => {

  // structure when we want passport authenticate to pass you back information like this
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);

    if (!user) {
      // this occurs when username or password is incorrect
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.json({ success: false, status: 'Login Unsuccessful!', err: info });
    }

    // passport authenticate will add this function
    req.logIn(user, (err) => {
      if (err) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.json({ success: false, status: 'Login Unsuccessful!', err: 'Could not log in user!' });
      }

      // this mean user has login so we can generate token
      var token = authenticate.getToken({ _id: req.user._id });
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({ success: true, status: 'Login Successful!', token: token });
    });
  })(req, res, next);
});

// we are only logging out so no need to send further information
router.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(); // information is removed from server side
    res.clearCookie('session-id'); // but we need to remove the cookie from client side as well
    res.redirect('/'); // redirecting to the homepage
  }
  else {
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});

// the client will now use the OAuth API to get access-token which the server can use to verify the user
router.get('/facebook/token', passport.authenticate('facebook-token'), (req, res) => {
  if (req.user) {
    var token = authenticate.getToken({ _id: req.user._id });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({ success: true, token: token, status: 'You are successfully logged in!' });
  }
});

// this will return true or false based on whether the token is valid or not so that user may be prompted to login again
router.get('/checkJWTtoken', cors.corsWithOptions, (req, res) => {
  // this is for the jwt authentication
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err)
      return next(err);

    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      return res.json({ status: 'JWT invalid!', success: false, err: info });
    }
    else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.json({ status: 'JWT valid!', success: true, user: user });

    }
  })(req, res);
});

module.exports = router;
