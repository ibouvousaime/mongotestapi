var express = require('express');
var router = express.Router();
var mongojs = require('mongojs')
const _ = require('underscore')

const db = mongojs("mongodb://ab_ibrahima:FR2DwqIROWHmLlgX@cluster0-shard-00-02-zl8ja.mongodb.net:27017,cluster0-shard-00-00-zl8ja.mongodb.net:27017,cluster0-shard-00-01-zl8ja.mongodb.net:27017/sample_airbnb?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true")




/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});



router.get('/list/:id', function(req, res, next) {
    const id = req.params.id;
    db.listingsAndReviews.find({_id:id.toString()}, function (err, doc) {
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

router.post('/insert/:id', function(req, res, next) {
    const id = req.params.id
    let body = req.body;
    db.collection(id).insert(body,function(err, doc) {
        res.status(200).send("Success");
    });
});

router.post('/new', function(req, res, next) {
    let body = req.body;
    db.createCollection(body.name,{}, function (err, doc) {
        res.status(200).send("Collection : "+ body.name + " has been created");
    });
});

module.exports = router;
