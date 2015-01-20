var http = require('http');
var assert = require('assert');

var mongo = require('mongodb');
var BSON = mongo.BSONPure;

var MongoClient = mongo.MongoClient, 
	Server = mongo.Server;
	
var mongoClient = new MongoClient(new Server('54.148.6.26', 27017));
var db;

mongoClient.open(function(err, mongoClient) {
	assert.equal(null, err);
	db = mongoClient.db("dinneract"); // The DB is set here
	
	/*
	// Drop the collection from this world
    db.dropCollection("posts", function(err, result) {
    	assert.equal(null, err);

    	// Verify that the collection is gone
        db.collectionNames("posts", function(err, names) {
            assert.equal(0, names.length);
            //db.close();
        });
    });
    */
	
	db.createCollection("posts", { strict: true, capped: true, size: 5242880, autoIndexId: true, w: 1}, function(err, collection) {
		//assert.equal(null, err);
		if(err) {
			console.log(err);
   		}else{
			// Retrieve our document
			var parsedJSON = require('./posts.json');
	          
			for(var i=0; i < parsedJSON.length; i++) {
	          	// Insert a document in the capped collection
	          	collection.insert(parsedJSON[i], {}, function(colerr, result){
	          		assert.equal(null, colerr);
				});
			}
		}
	});
	
	db.createCollection("elements", { strict: true, capped: true, size: 5242880, autoIndexId: true, w: 1}, function(err, collection) {
		//assert.equal(null, err);
		if(err) {
			console.log(err);
   		}else{
			// Retrieve our document
			var parsedJSON = require('./elements.json');
	          
			for(var i=0; i < parsedJSON.length; i++) {
	          	// Insert a document in the capped collection
	          	collection.insert(parsedJSON[i], {}, function(colerr, result){
	          		assert.equal(null, colerr);
				});
			}
		}
	});
});


var dataOp_posts = ( function(paras, res) {
	
	db.collection("posts", function(colerr, collection) {
		
		//console.log(colerr);
		assert.equal(null, colerr);
		
		if(paras.length == 4) { //get all

			collection.find({}, {skip:0, limit:50}).toArray(function(err, data) {
				assert.equal(null, err);
			    //console.log(data);
			    res.writeHead(200, {
			    	'Content-Type': 'text/plain',
			    	'Access-Control-Allow-Origin': '*',
			    	'Access-Control-Allow-Methods': 'GET, POST',
			    	'Access-Control-Allow-Headers': 'Content-Type'
			    });
		
			    res.end( '"' + encodeURIComponent( JSON.stringify(data) ) + '"' );
			}); 
		
		} else if(paras.length == 5) {
			//get one
			var o_id = new BSON.ObjectID( paras[4] );
			
			collection.findOne({ '_id': o_id }, function(err, data) {   
				assert.equal(null, err);
			    //console.log(data);
			    res.writeHead(200, {
			    	'Content-Type': 'text/plain',
			    	'Access-Control-Allow-Origin': '*',
			    	'Access-Control-Allow-Methods': 'GET',
			    	'Access-Control-Allow-Headers': 'Content-Type'
			    });
		
			    res.end( '"' + encodeURIComponent( JSON.stringify(data) ) + '"' );
			}); 

		} else if(paras.length >= 6) {
			
			switch(paras[5]) {

				case "new"://	/v1/posts/post//new/data, id field is null
			    	collection.insert(JSON.parse( decodeURIComponent( paras[6] ) ), { w: 1 }, function(err, result) {
						assert.equal(null, err);
			
						res.writeHead(200, {
							'Content-Type': 'text/plain',
						    'Access-Control-Allow-Origin': '*',
						    'Access-Control-Allow-Methods': 'POST',
						    'Access-Control-Allow-Headers': 'Content-Type'
						});
						
						if(err)	{
							res.end( '"' + encodeURIComponent( '{"result": 0}' ) + '"' );
						} else {
							res.end( '"' + encodeURIComponent( '{"result": 1}' ) + '"' );
						}
	
					}); 
					
					break;
				
				
				case "update"://	/v1/posts/post/Post-Id/update/{'like_num': 1}
					var o_id = new BSON.ObjectID( paras[4] );
					
			    	collection.update({ '_id': o_id }, { $set: JSON.parse( decodeURIComponent( paras[6] ) ) }, { w: 1 }, function(err, result) {
						assert.equal(null, err);
			
						res.writeHead(200, {
							'Content-Type': 'text/plain',
						    'Access-Control-Allow-Origin': '*',
						    'Access-Control-Allow-Methods': 'POST',
						    'Access-Control-Allow-Headers': 'Content-Type'
						});
					
						if(err)	{
							res.end( '"' + encodeURIComponent( '{"result": 0}' ) + '"' );
						} else {
							res.end( '"' + encodeURIComponent( '{"result": 1}' ) + '"' );
						}
						
					}); 
					
					break;
					
					
				case "delete"://	/v1/posts/post/Post-Id/delete
				//must be the author, who has the right to 
					var o_id = new BSON.ObjectID( paras[4] );
					
			    	collection.remove({ '_id': o_id }, { w:1 }, function(err, result) {
						assert.equal(null, err);
			
						res.writeHead(200, {
							'Content-Type': 'text/plain',
						    'Access-Control-Allow-Origin': '*',
						    'Access-Control-Allow-Methods': 'POST',
						    'Access-Control-Allow-Headers': 'Content-Type'
						});
					
						if(err)	{
							res.end( '"' + encodeURIComponent( '{"result": 0}' ) + '"' );
						} else {
							res.end( '"' + encodeURIComponent( '{"result": 1}' ) + '"' );
						}
						
					}); 
					
					break;	
			
			}

		} else {
			
			res.writeHead(200, {
				'Content-Type': 'text/plain',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, POST',
				'Access-Control-Allow-Headers': 'Content-Type'
			});

			res.end( '"' + encodeURIComponent( '{"result": 0}' ) + '"' );
			
		}
	});	
	
});


	
var dataOp = ( function(paras, res) {
/*
 			   0/ 1/  2   / 3 /    4    /    5   /  6
	GET POST	/v1/posts/post
	GET			/v1/posts/post/Post-Id
	POST		/v1/posts/post/Post-Id/execute/data

	GET POST	/v1/users/user
	GET			/v1/users/user/User-Id
	POST		/v1/users/user/User-Id/execute/data
 */
		
	var op_type = paras[2];
	
	switch(op_type) {
		case "posts":
			dataOp_posts(paras, res);
			break;
		
		case "users":
			dataOp_users(paras, res);
			break;
		
		case "likes": //like and unlike
			dataOp_likes(paras, res);
			break;
		
		default:
			//
			break;	
	}
	
});
	

http.createServer(function (req, res) {
    //console.log('request received');

    var url = require('url');
    console.log(req.url);
	//var url_parts = url.parse(req.url, true);
	
	var paras = req.url.split("?_=");
	var paras = paras[0].split("/");


	dataOp(paras, res);

	//db.close();
	//mongoClient.close();

}).listen(8124);


	
	

