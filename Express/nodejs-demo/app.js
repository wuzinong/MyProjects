var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var myRouter = require('./routes/route');

//var movie = require('./routes/movie');

// var SessionStore = require('session-mongoose')(express);
// var store = new SessionStore({
//     url:"mongodb://localhost/session",
//     interval:120000
// });

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

 

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', myRouter.indexRouter);
app.use('/users', myRouter.usersRouter);

app.get('/login',myRouter.loginRouter.login);
app.post('/login',myRouter.loginRouter.doLogin);

app.use('/logout',myRouter.logoutRouter);

// app.get('/movie/add',movie.movieAdd);
// app.post('/movie/add',movie.doMovieAdd);
// app.get('/movie/:name',movie.movieAdd);
// app.get('/movie/json/:name',movie.movieJSON);
 
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
