var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req);
  if(!req.cookies.user) {
    res.render('index', { title: 'Express' });
  } else {
    res.render('chat');
  }
});

module.exports = router;
