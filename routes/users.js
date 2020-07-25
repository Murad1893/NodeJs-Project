var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser')
var passport = require('passport');

var User = require('../models/users')

var router = express.Router()
router.use(bodyParser.json())

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', (req, res, next) => {
  // we will use the inbuilt methods of passport local mongoose to creata a new User
  User.register(new User({ username: req.body.username }),
    req.body.password, (err, user) => { // a callback function
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({ err: err });
      }
      else {
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

// if the authenticate is successful then we will go to the req,res callback
router.post('/login', passport.authenticate('local'), (req, res, next) => {
  // hence all the authentication is taken care by the passport.authenticate
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({ success: true, status: 'You are successfully logged in!' });
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

module.exports = router;
