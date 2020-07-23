var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');

const mongoose = require('mongoose');

const url = 'mongodb://localhost:27017/conFusion';
const connect = mongoose.connect(url, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false }); // using mongoose to connect

connect.then((db) => {
  console.log("Connected correctly to the server")
}, err => { console.log(err) })

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// so we will add authentication before our client can access data from server. Hence, all the middleware next, can be accessed only if authenticated
function auth(req, res, next) {
  console.log(req.headers);

  var authHeader = req.headers.authorization

  if (!authHeader) { // checking that if some authentication is provided by the user or not
    var err = new Error('You are not authenticated')

    res.setHeader('WWW-Authenticate', 'Basic')
    err.status = 401 // unauthorized access
    return next(err) // passing it to the custom error handler by the express generator
  }

  var auth = new Buffer(authHeader.split(' ')[1], 'base64').toString().split(':') // also supplying the encoding. ':' split will give the username and password

  var username = auth[0]
  var password = auth[1]

  if (username === 'admin' && password === 'password') {
    next()
  }
  else {
    var err = new Error('You are not authenticated!');
    res.setHeader('WWW-Authenticate', 'Basic');
    err.status = 401;
    next(err);
  }
}


app.use(auth)
app.use(express.static(path.join(__dirname, 'public'))); // this is where we an serve up static files

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
