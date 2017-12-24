var express = require('express');
var bodyparser = require('body-parser');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var User = require('./User');
var session = require('express-session');

var app = express();

mongoose.connect('mongodb://api:1453@localhost/test'),{useMongoClient:true};

app.use(bodyparser.urlencoded({extended:true}));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://127.0.0.1:8080");
  res.header("Access-Control-Allow-Credentials","true");
  next();
});

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
    levelHistory: {},
    readingSpeed: {},
    homeworkCount: 0,
    answered:0,
    trueAnswers:0
  }
  var date = new Date();
  var dateString = date.getDate()+ " "+ (date.getMonth()+1)+" " + date.getFullYear();
  userData.levelHistory[dateString] = 0;
  userData.readingSpeed[dateString] = 0;
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
	   			res.send(JSON.stringify({loginStatus : 'fail'}));
	   		}else{
	   			req.session.userId = user._id;
	   			res.send(JSON.stringify({loginStatus : 'success'}));
	   		}
	   });	
	}

});

app.post('/cikis',function(req,res){
	if(req.session.userId){
		req.session.destroy(function(err){
			if(err){
			}else{
				res.send("Oturum sonlandırıldı");
			}
		});
	}
});

app.post('/profil',function(req,res){
	if(req.session.userId){
		User.findById(req.session.userId, function (err, user) {
			if(err){
				res.send(JSON.stringify({hasSession:"error"}));
			}
			else{
				res.send(JSON.stringify({hasSession:"true",username:user.username,levelProcess:user.levelHistory,readingSpeed:user.readingSpeed,homeworks:user.homeworkCount,understandRate:Math.floor((user.trueAnswers/user.answered)*100)||0}));
			}
		 } );
	}else{
		res.send(JSON.stringify({hasSession:"false"}));
	}
});

app.post('/seviye',function(req,res){
	if(req.session.userId){
		User.findById(req.session.userId,function(err, user){
			if(user){
				var date = new Date();
  				var dateString = date.getDate()+ " "+ (date.getMonth()+1)+" " + date.getFullYear();
  				var userobj = user.levelHistory;
  				if(userobj[dateString]){
  				userobj[dateString] = userobj[dateString] +1 ;
  			    }
  			    else{
  			    userobj[dateString] = 1;	
  			    }
  				User.update({_id:req.session.userId}, {$set: { levelHistory:userobj  }}, {upsert: true}, function(err){
				res.send("seviye eklendi");
		});
			}
		});
	}
});

app.post('/hizli',function(req,res){
	if(req.session.userId){
		User.findById(req.session.userId,function(err, user){
			if(user){
				var date = new Date();
  				var dateString = date.getDate()+ " "+ (date.getMonth()+1)+" " + date.getFullYear();
  				var userobj = user.readingSpeed;
  				if(userobj[dateString]){
  				if(userobj[dateString] < parseInt(req.body.speed)){
  				userobj[dateString] = parseInt(req.body.speed) ;
  			    }
  				}
  				else{
  				userobj[dateString] = parseInt(req.body.speed);	
  				}
  				User.update({_id:req.session.userId}, {$set: { readingSpeed:userobj  }}, {upsert: true}, function(err){
				res.send("hız güncellendi");
		});
			}
		});
	}
});

app.post('/odevekle',function(req,res){
	if(req.session.userId){
	   User.findById(req.session.userId,function(err,user){
	   		if(user){
	   					User.update({_id:req.session.userId}, {$set: { homeworkCount:user.homeworkCount + 1  }}, {upsert: true}, function(err){
				res.send("ödev eklendi");
		});
	   		}
	   });	
	}
});

app.post('/soruekle',function(req,res){
	if(req.session.userId){
	   User.findById(req.session.userId,function(err,user){
	   		if(user){
	   					User.update({_id:req.session.userId}, {$set: { answered:user.answered + 1  }}, {upsert: true}, function(err){
				res.send("soru eklendi");
		});
	   		}
	   });	
	}
});

app.post('/dogruekle',function(req,res){
	if(req.session.userId){
	   User.findById(req.session.userId,function(err,user){
	   		if(user){
	   					User.update({_id:req.session.userId}, {$set: { trueAnswers:user.trueAnswers + 1  }}, {upsert: true}, function(err){
				res.send("doğru eklendi");
		});
	   		}
	   });	
	}
});



app.listen(3000);