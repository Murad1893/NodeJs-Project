var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser')
var passport = require('passport');
var cors = require('./cors')

var authenticate = require('../authenticate')
var User = require('../models/users')

var router = express.Router()
router.use(bodyParser.json())

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

// when user login is successful then we will assign a token to the user
router.post('/login', cors.corsWithOptions, passport.authenticate('local'), (req, res, next) => {

  // userId is sufficient hence keep data in token small
  // we know that user field will be availble when the user is authenticated
  var token = authenticate.getToken({ _id: req.user._id, })

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');

  // also passing the token
  res.json({ success: true, token: token, status: 'You are successfully logged in!' });
})
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

module.exports = router;
