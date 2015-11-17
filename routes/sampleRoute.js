var MongoClient = require('mongodb').MongoClient;

function getResults(db, callback) {
	var cursor =db.collection('business').find({categories:{$in: ['Bars']},city:'Carnegie'});
	var results = [];
	cursor.each(function(err, doc) {
		if (doc !== null) {
			//console.log(doc);
			results.push(doc.name);
		} else {
			callback(results);
		}
	});
}

function generateResponse(req, res) {
	// The url to connect to the mongodb instance
	var url = 'mongodb://cis550student:cis550hw3@ds051933.mongolab.com:51933/cis550hw3';
	MongoClient.connect(url, function(err, db) {
		// If there is an error, log the error and render the error page 
		if(err !== null) {
			console.log("Connection to server failed.");
			db.close();
			res.render('error', {
				message: "Connection to server failed.",
				error: err
			});
		}
		// If there is no error while connecting, proceed further
		else {
			console.log("Connected correctly to server.");
			getResults(db, function(results) {
				db.close();
				res.render('sample.ejs', {results: results});
			});
		}
	});
}

exports.displayResponse = function(req, res){
	generateResponse(req, res);
};