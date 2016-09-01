var express = require('express');
var router = express.Router();
var users = require('../contollers/users.controller');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signin', users.signin);

module.exports = router;
