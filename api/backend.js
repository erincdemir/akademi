var express = require('express');
var bodyparser = require('body-parser');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var User = require('./User');
var session = require('express-session');

var app = express();

mongoose.connect('mongodb://api:1453@localhost/test'),{useMongoClient:true};

app.use(bodyparser.urlencoded({extended:true}));

app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false
}));

app.get('/', function(req, res){
  res.send('hello world');
  console.log(req.session.userId);
});

app.post('/kayit', function(req, res){
  if (req.body.email &&
  req.body.username &&
  req.body.password &&
  req.body.passwordConf) {
  var userData = {
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
    passwordConf: req.body.passwordConf,
  }
  //use schema.create to insert data into the db
  User.create(userData, function (err, user) {
    if (err) {
      return next(err)
    } else {
      return res.send('Kullanıcı kaydedildi');
    }
  });
}
});

app.post('/giris',function(req,res){
	if(req.body.email && 
	   req.body.password){
	   User.authenticate(req.body.email, req.body.password, function(error,user){
	   		if(error|| !user){
	   			res.send('Kullanıcı adı veya şifre hatalı.');
	   		}else{
	   			req.session.userId = user._id;
	   			res.send(user.username + ' olarak giriş yapıldı.');
	   		}
	   });	
	}

});

app.post('/profil',function(req,res){
	if(req.session.userId){
		User.findById(req.session.userId, function (err, user) {
			if(err){
				res.send(err.message);
			}
			else{
				res.send(user.username + " Profili");
			}
		 } );
	}else{
		res.send("giriş yapın");
	}
});



app.listen(3000);