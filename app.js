var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session')
var FileStore = require('session-file-store')(session)
var passport = require('passport');

var config = require('./config')
var authenticate = require('./authenticate');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');
var uploadRouter = require('./routes/uploadRouter')
var favRouter = require('./routes/favoritesRouter')
var commentRouter = require('./routes/commentRouter');

const mongoose = require('mongoose');

const url = config.mongoUrl;
const connect = mongoose.connect(url, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false }); // using mongoose to connect

connect.then((db) => {
  console.log("Connected correctly to the server")
}, err => { console.log(err) })

var app = express();

// redirecting all requests from insecure http port to secure https
app.all('*', (req, res, next) => {
  // checking whether coming to secure port or not
  if (req.secure) {
    return next()
  }
  else {
    // req.url will contain the actual path on the server without the hostname
    // 307 means that target resource resides in a different URI and client must not change the request method on redirection
    res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);
  }
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(passport.initialize());

// moved to this location so that user can sign up as sign up does not need authentication
app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(express.static(path.join(__dirname, 'public'))); // this is where we an serve up static files

// we will restrict only put, post, delete operations; require authentication

app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);
app.use('/imageUpload', uploadRouter);
app.use('/favorites', favRouter);
app.use('/comments', commentRouter);

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
