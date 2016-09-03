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
  },
  dialog: {
    type: String,
    required: true
  }
});

var Message = mongoose.model('Message', MessageSchema);

var UserSchema = new Schema({
  nickname: String
});

var User = mongoose.model('User', UserSchema);

var getDialog = function(usr1, usr2) {
  return (usr1 + usr2).split("").sort().join("");

}

exports.saveMessage = function(msg) {

  console.log("going to save", msg);
  msg.message.dialog = getDialog(msg.message.to, msg.message.from);
  var message = new Message(msg.message);

  message.save(function(err, m){
    console.log("saved", m);
  });
};

exports.readDialog = function (req, res) {
  
  console.log("read di", req.body.to, req.body.from);
  var dialog = getDialog(req.body.to, req.body.from);
  console.log("read di", dialog);

  

  Message.find({dialog: dialog}, function (err, di) {
    if(err) {
      console.log(err);
    }

    res.json(di);
  })
};

exports.signin = function(req, res) {
	console.log(req.online);
	if(req.online.indexOf(req.body.name) != -1) 
	{
		res.status(400).send("User is already online");
		return;
	}

    User.findOne({nickname: req.body.name}, function (err, foundUser) {
      console.log(err, foundUser);
      if(!foundUser) {
        var user = new User({nickname: req.body.name});
        user.save(function(err, newUser) {
          console.log(err, newUser);
          return res.json(newUser);
        });
      } else {
        console.log("try render");
        return res.json(foundUser);
      }
    });
};
