var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if(!req.cookies.user) {
    res.render('index', { title: 'Express' });
  } else {
    res.render('chat');
  }
});
/*
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
*/
module.exports = router;
