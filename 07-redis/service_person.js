var redis = require('redis');
var connection = redis.createClient(
    {   host: 'localhost', 
        port: '6379'
    }
);

exports.all = function(req, res){
    if (connection) {
        var allPerson = [];

        connection.lrange("person_list", 0, -1, function (err, person_list) {          
            person_list.forEach(function (personId, i) {

                connection.hgetall(personId, function(err, objs) {                   
                    var newPerson = {
                        name: objs["name"],
                        gender: objs["gender"]
                    };
                    allPerson.push(newPerson);

                    if( person_list.length == allPerson.length ) {
                        res.contentType('application/json');
                        res.write(JSON.stringify(allPerson));
                        res.end(); 
                    }   
                });   

            });  
               
        });  
    }
};


exports.one = function(req, res){
    var personId = req.params.id;
    if (connection) {
        connection.hgetall(personId, function(err, objs) {  
            if(objs) {                 
                var newPerson = {
                    name: objs["name"],
                    gender: objs["gender"]
                };
                res.contentType('application/json');
                res.write(JSON.stringify(newPerson));
                res.end();
            } else {
                res.statusCode = 404;
                return res.send('Error 404: Person not found.');
            }
        });  
    }
};

exports.insert = function(req, res){
    if(!req.body.hasOwnProperty('name') || !req.body.hasOwnProperty('gender')) {
        res.statusCode = 400;
        return res.send('Error 400: Post syntax incorrect.');
    }

    if (connection) {
        connection.incr("id");
        connection.get("id", function (err, personId) {
            connection.lpush("person_list", personId);
        
            connection.hset(personId, "id", personId);
            connection.hset(personId, "name", req.body.name) ;
            connection.hset(personId, "gender", req.body.gender);
            res.json(true);        
        });    
    }
};