var mongo = require('mongodb');
 
var Server = mongo.Server,
Db = mongo.Db,
BSON = mongo.BSONPure;
 
var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('persons', server);
 
db.open(function(err, db) {
    if(!err) {
        console.log("Connected to 'persons' database");
        db.collection('persons', {strict:true}, function(err, collection) {
        if (err) {
            console.log("The 'persons' collection doesn't exist. Creating it with sample data...");
            populateDB();
        }
    });
}
});

exports.all = function(req, res){
    db.collection('persons', function(err, collection) {
        collection.find().toArray(function(err, persons) {
            res.send(persons);
        });
    });
};


exports.one = function(req, res){
    var personId = req.params.id;
    db.collection('persons', function(err, collection) {        
        collection.findOne({'_id':new BSON.ObjectID(personId)}, function(err, person) {
            res.send(person);
        });
    });
};

exports.insert = function(req, res){
    if(!req.body.hasOwnProperty('name') || !req.body.hasOwnProperty('gender')) {
        res.statusCode = 400;
        return res.send('Error 400: Post syntax incorrect.');
    }

    var person = req.body;
    db.collection('persons', function(err, collection) {
        collection.insert(person, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
};

exports.update = function(req, res){
    if(!req.body.hasOwnProperty('_id') || 
       !req.body.hasOwnProperty('name') || 
       !req.body.hasOwnProperty('gender')) {
        res.statusCode = 400;
        return res.send('Error 400: Post syntax incorrect.');
    }

    var updatePerson = {
        name : req.body.name,
        gender : req.body.gender
      };
    db.collection('persons', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(req.body._id)}, updatePerson, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating person: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(updatePerson);
            }
        });
    });
};

exports.delete = function(req, res){
    var id = req.params.id;
    db.collection('persons', function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
};

var populateDB = function() {
 
    var persons = [
    {
        name: "Somkiat",
        gender: "Male",
    },
    {
        name: "Roofimon",
        gender: "Female"
    }];
     
    db.collection('persons', function(err, collection) {
        collection.insert(persons, {safe:true}, function(err, result) {});
    });
 
};