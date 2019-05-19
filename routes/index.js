var express = require('express');
var router = express.Router();
var mongojs = require('mongojs')
const _ = require('underscore')
var nodemailer = require('nodemailer');
const db = mongojs("mongodb://ab_ibrahima:FR2DwqIROWHmLlgX@cluster0-shard-00-02-zl8ja.mongodb.net:27017,cluster0-shard-00-00-zl8ja.mongodb.net:27017,cluster0-shard-00-01-zl8ja.mongodb.net:27017/sample_airbnb?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true")


function generateString(len) {
    var result  = "";
    var alpha = "abcdefjhijklmopqrstuvwxyz0123456789"
    for(let i =0; i < len; i++) {
      result += alpha[Math.floor(Math.random() * alpha.length)];
    }
    return result;
  }

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});



router.get('/find/:collection/:id', function(req, res, next) {
    const id = req.params.id;
    const collection = req.params.collection;
    db.collection(collection).find({_id:id.toString()}, function (err, doc) {
        res.json(doc);
        console.log(id)
    })
  
});

router.get('/list', function(req, res, next) {
    const id = req.params.id;
    /*db.collections(function(e, cols) {
        cols.forEach(function(col) {
            console.log(col.collectionName);
            list += collectionName + "\n";
        });
    });*/
   /* db.getCollectionNames(function(err, colNames) {
        if (err) return  console.log(err);
            colNames.forEach(function(name) {
            list += name;
        });
    });*/
    db.runCommand({listCollections: 1.0, nameOnly:true}, function(err, list) {
	    if(!err)
	    {
            let elements = list.cursor.firstBatch;
            let names = _.map(elements, 'name');
            console.log(names);
            /*let content = "<h1> List of collections: </h1> <ul>";
            for (let name of names) {
                content += "<li> " + name +  " </li>"
            }
            content += "</ul>"*/
            res.status(200).json(names);
	    }

	})
  
});

router.post('/insert/:collection', function(req, res, next) {
    const id = req.params.collection
    let body = req.body;
    db.collection(id).insert(body,function(err, doc) {
        if (err) {
            res.status(200).send(JSON.stringify(err));
        }
        else 
        res.status(200).send(JSON.stringify({res:"success"}));
    });
});




router.post('/changePass', function(req, res, next) {
  let body = req.body;
  db.collection('value1').findAndModify({
    query : {n: body.e},
    update: { $set :{pa : body.p}},
    new :true
  },function(err,doc,lastErr) {
        console.log(doc);
      if (!err) {
        res.status(200).send({r:true,d:doc});
      }
      else {
        res.status(200).send({r:false,d:err});
      }
  })
});

router.post('/new/:name', function(req, res, next) {
    let body = req.body;
    const name = req.params.name
    db.createCollection(name,{}, function (err, doc) {
        if (err) {
            res.status(200).send({res: err.message});
        }
        else 
        res.status(200).send({res: "Collection : "+ name + " has been created"});
    });
});
router.post('/searchUser', function(req, res, next) {
  var body = req.body;
  let user = body.u
  let pass = body.p
  let found = false;
  console.log(user + " " + pass);
  db.collection('value1').findOne({n:user,pa:pass}, function (err,doc) {
    console.log("err" + err);
    console.log("doc" + JSON.stringify(doc));

    if (err) {
      res.status(400).send(JSON.stringify(err));
    }
    else {
      found = true;
      res.status(200).send(JSON.stringify(doc));
    }
  });
});

router.post('/searchToken', function(req, res, next) {
  var body = req.body;
  let token = body.tok;
  console.log(token);
  let result = db.collection('adede').findOne({tok:token}, 
    function (err,doc) {
      if (err) {
        res.status(200).send(JSON.stringify({d:doc,ok:false}))        }
      else {
        res.status(200).send(JSON.stringify({d:doc,ok:true}));
        }
      } 
    );
});

function storeToken (token, dest) {
  db.collection('adede').insert({email:dest, tok: token},function (err, doc) {
    if(err) {
      console.log(err);
      return false;
    }
    else {
      return true;
    }
  });
}

router.get('/sendForgot/:email', function(req, res, next) { 
    const email = req.params.email
    var token = generateString(20);
    storeToken(token,email);
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'wustenbaby@gmail.com',
          pass: 'zerglingSwarm123'
        }
      });
      
      var mailOptions = {
        from: 'wustenbaby@gmail.com',
        to: email,
        subject: 'Test',
        text: 'Follow this link to continue http://localhost:4200/token/'+ token
      };
      transporter.sendMail(mailOptions, function(err, info){
        console.log(info);
        if (err) {
          console.log(err);
        } else {
          res.status(200).send(JSON.stringify({res:info.response}));
        }
      });
});
module.exports = router;
