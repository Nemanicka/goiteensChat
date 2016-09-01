var mongoose = require('mongoose');
var url = 'mongodb://localhost:27017/goiteens';
var db = mongoose.connect(url);
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
  from: String,
  to: String,
  content: String,
  date: {
    type: Date,
    default: Date.now
  }
});

var Message = mongoose.model('Message', MessageSchema);

var UserSchema = new Schema({
  nickname: String
});

var User = mongoose.model('User', UserSchema);

exports.signin = function(req, res) {
  //if (err) {
  //  return res.status(400).send({
  //    message: errorHandler.getErrorMessage(err)
  //  });
  //} else {
    User.findOne({nickname: req.body.name}, function (err, foundUser) {
      console.log(err, foundUser);
      if(!res) {
        var user = new User({nickname: req.body.name});
        user.save(function(err, newUser) {
          console.log(err, newUser);
          return res.json(newUser);
        });
      } else {
        console.log("try render");
       // res.render('chat', {title: 'Ex'});
        return res.json(foundUser);
      }
    });
  //}
}
