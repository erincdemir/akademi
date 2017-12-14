//mongodb test
var MongoClient = require('mongodb').MongoClient;
var dburl = "mongodb://localhost:27017/test";
//test
const http = require('http');
const url = require('url');
const querystring = require('querystring');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
 res.writeHead(200, {
    "Content-Type": "text/plain",
    "Access-Control-Allow-Origin":"*"
});
      if(req.method == 'POST'){
          var body = '';
            
           req.on('data', function (data) {
            body += data;
            });
            req.on('end', function () {
                 var post = querystring.parse(body);
                //mongo db post handler
                MongoClient.connect(dburl, function(err, db) {
                    var testmethod = post.method;
                    var testusr=post.usr;
                    var testpwd=post.pwd;
                    var status=post.stat;
                    var testarray= post.array; 
                    var school = post.school;
                    var year = post.year;
                    var department = post.department;
                    var score = post.score;
                    var word = post.word;
  if (err) throw err;
                    
if(testmethod == "login"){
  db.collection("test").findOne({"usr":testusr}, 
function(err, result) {
    if (err) throw err;
      
        if(testpwd == result.pwd){
            res.end("Hoşgeldin "+testusr+"!");
            db.collection("test").update({usr:testusr}, {$set: {status:"online",modified:new Date()}});
            
        }
      else
          {
              res.end("Kullanıcı adı veya şifre hatalı");
              
          }
      
    db.close();
  });
}
else if(testmethod == "logoff"){
    res.end(testusr+" kullanıcısından çıkış yaptınız.");
    var logintime;
    db.collection("test").findOne({usr:testusr},function(err,result){
        if(err) throw err;
        logintime = result.modified.getTime();
        db.collection("test").update({usr:testusr}, {$set: {status:"offline",modified:new Date()}});
    });
    
      db.collection("test").findOne({usr:testusr},function(err,result){
        if(err) throw err;
        var screentime = new Date().getTime() - logintime;
        if(result.screentime == undefined){
          db.collection("test").update({usr:testusr}, {$set: {screentime:screentime}});  
        }
        else{
            screentime += result.screentime;
            db.collection("test").update({usr:testusr}, {$set: {screentime:screentime}});  
        }
        db.close();
    });
   
}
else if(testmethod == "usrstatus"){
    db.collection("test").findOne({"usr":testusr},function(err,result){
                   if(err) throw err;
                   res.end(result.status);
                   db.close();                                     
                                                            });
}
else if(testmethod == "lastseen"){
     db.collection("test").findOne({"usr":testusr},function(err,result){
                   if(err) throw err;
                   res.end(new Date(result.modified).toDateString() +" "+ new Date(result.modified).getHours() + ":" + new Date(result.modified).getMinutes());
                   db.close();                                     
                                                            }); 
        
}
else if(testmethod == "wordlist_add"){


var remoteArray="";
var knownwords = 0;

db.collection("test").findOne({"usr":testusr},function(err,result){
                   if(err) throw err;
                   if(result.words == undefined){
                    db.collection("test").update({usr:testusr}, {$set:{words : {0:""}}});    
                   }
                  // db.close();                                     
                                                            }); 
db.collection("test").findOne({"usr":testusr},function(err,result){
    if(err) throw err;
    remoteArray=JSON.parse(testarray);
    if(result.wordcount != undefined){
        knownwords = result.wordcount;
    }
    for(var j= 0;j<remoteArray.length;j++){
       var obj = {};
       obj["words."+(knownwords+j)] = remoteArray[j];
    db.collection("test").update({usr:testusr}, {$set:obj});
    }
    var updatedwords = knownwords+remoteArray.length;
    db.collection("test").update({usr:testusr}, {$set:{wordcount:updatedwords}});
    
    res.end("Sözcükler eklendi.");
db.close();    
});
            
    
}
else if(testmethod == "wordlist_show"){
    db.collection("test").findOne({"usr":testusr},function(err,result){
                   if(err) throw err;
                    res.end(JSON.stringify(result.words));
                    db.close();                                     
                                                            }); 
}
else if(testmethod == "update_education"){
db.collection("test").findOne({"usr":testusr},function(err,result){
                   if(err) throw err;
                   if(result.department == undefined){
                      db.collection("test").update({usr:testusr}, {$set:{department : ""}});    
                   }
                   if(result.school == undefined){
                      db.collection("test").update({usr:testusr}, {$set:{school : ""}});    
                   }
                   if(result.year == undefined){
                      db.collection("test").update({usr:testusr}, {$set:{year : ""}});    
                   }
                  // db.close();                                     
                                                            }); 
db.collection("test").findOne({"usr":testusr},function(err,result){
    if(err) throw err;
    if(school != undefined){
         db.collection("test").update({usr:testusr}, {$set:{school:school}});
    }
     if(year != undefined){
         db.collection("test").update({usr:testusr}, {$set:{year:parseInt(year)}});
    }
    if(department != undefined){
         db.collection("test").update({usr:testusr}, {$set:{department:department}});
    }    
    db.close(); 
    res.end("Eğitim bilgileri güncellendi.");
});
           
        
}
else if(testmethod == "score_add"){
    db.collection("test").findOne({usr:testusr},function(err,result){
                   if(err) throw err;
                   if(!result.score){
                      db.collection("test").update({usr:testusr}, {$set:{score : "0"}});    
                   }                                   
                                                            }); 
db.collection("test").findOne({usr:testusr},function(err,result){
    if(err) throw err;
    if(score != undefined){
         var newScore = parseInt(result.score) + parseInt(score);
         db.collection("test").update({usr:testusr}, {$set:{score:newScore.toString()}});
         res.end("Skor eklendi.");
    }
    db.close();    
});
          
}
else if(testmethod=="register"){
    db.collection("test").findOne({usr:testusr},function(err,result){
        if(err) throw err;
        if(result){
            res.end("Kullanıcı adı mevcut.");
        }else{
            db.collection("test").insertOne({usr:testusr,pwd:testpwd});
            res.end("Kullanıcı eklendi.");  
        }
        db.close();
    });
   
}
else if(testmethod=="add_word"){
    db.collection("words").findOne({word:word},function(err,result){
        if(err) throw err;
        if(result){
            var obj = {};
            obj["who_searched."+testusr] = testusr;
            db.collection("words").update({word:word}, {$set:obj});
            res.end("sözcük bulundu.");
        }
        else{
            var obj = {};
            obj[testusr] = testusr;
            db.collection("words").insertOne({word:word,who_searched:obj});
            res.end("sözcük eklendi.");
        }
        db.close();
    });
}
});
               
                
            });
      }   
      if(req.method == 'GET'){
          res.write("Bu bir get requesttir\n");
          res.end("cukum\n");
      }
  
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});