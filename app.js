var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var cors = require('cors');

var usersOnline = [];

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public','javascripts/index.js')));

app.use(function (req, res, next) {
	console.log("attach users online");
	req.online = usersOnline;
     next();
});

app.use('/', routes);
app.use('/users', users);

app.get('/^socket.io.js$/', function(req, res){
	console.log(" request sockets  allow headers");
    // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

// Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

 // Request headers you wish to allow
     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With');
     res.setHeader('Access-Control-Allow-Headers', 'Content-type');

          // Set to true if you need the website to include cookies in the requests sent
      // to the API (e.g. in case you use sessions)
// res.setHeader('Access-Control-Allow-Credentials', true);
	res.sendFile('socket.io.js');
	
});

app.use(function (req, res, next) {
	console.log("allow headers");
    // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

// Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

 // Request headers you wish to allow
     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With');
     res.setHeader('Access-Control-Allow-Headers', 'Content-type');

          // Set to true if you need the website to include cookies in the requests sent
      // to the API (e.g. in case you use sessions)
// res.setHeader('Access-Control-Allow-Credentials', true);

   // Pass to next layer of middleware
     next();
});


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

var usersCtrl = require("./contollers/users.controller");

var userSockets = {};

var server = require('http').Server(app);
var io = require('socket.io')(server).listen(7474);
//io.set("origins", '*'); 
//io.set("transports", ['xhr-polling']);
//var io = require(('socket.io');

console.log("io created");
//io.attach(server);



io.sockets.on('connection', function (socket) {
  console.log("connected");
  

  socket.on('handshake', function (data) {
    socket.emit('handshake', {users: usersOnline});
    socket.username = data.username; 
    userSockets[socket.username] = socket;
    usersOnline.push(socket.username);
    socket.broadcast.emit('userJoined', {nickname: socket.username});
  }); 
  
  socket.on('message', function (msg) {
    usersCtrl.saveMessage(msg);
    console.log(msg);
    console.log("inf", userSockets);
    
    console.log("after msg", msg);
    console.log("msg type", typeof msg);

    var receiver = msg.message.to;
    console.log("receiver = ", receiver);
    console.log("on msg", userSockets[receiver]);

    if(userSockets[receiver]) {
      userSockets[receiver].emit('message', msg);
    } else {
      console.log("receiver is not active");
    }
  });


    socket.on('disconnect', function() {
      console.log('disconnected');
      var index = usersOnline.indexOf(socket.username);
      if(index !== -1)
        usersOnline.splice(index, 1);
      socket.broadcast.emit('userLeft', {nickname: socket.username});
    });
});



module.exports = app;
