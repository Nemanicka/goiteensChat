var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public','javascripts/index.js')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var io = require('socket.io').listen(8080); 
io.sockets.on('connection', function (socket) {
  console.log("connected", socket.json.username);

  var ID = (socket.id).toString().substr(0, 5);
  var time = (new Date).toLocaleTimeString();
  socket.json.send({'event': 'connected', 'id': ID, 'time': time});
  
  socket.on('handshake', function (data){
    console.log("data", data);
    //socket.username = data.username; 
    socket.broadcast.json.send({'event': 'userJoined', 'nickname': socket.username, 'time': time});
  }); 
  
  socket.on('message', function (msg) {
    var time = (new Date).toLocaleTimeString();
    socket.json.send({'event': 'messageSent', 'name': ID, 'text': msg, 'time': time});
    socket.broadcast.json.send({'event': 'messageReceived', 'name': ID, 'text': msg, 'time': time})
                                        });
    socket.on('disconnect', function() {
      console.log('disconnected');
      var time = (new Date).toLocaleTimeString();
      io.sockets.json.send({'event': 'userSplit', 'name': ID, 'time': time});
    });
});

module.exports = app;
