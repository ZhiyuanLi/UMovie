var mysql = require('mysql');
//var connection = mysql.createConnection({
//	host : 'u-moive.cvgkmmzz4oct.us-east-1.rds.amazonaws.com',
//	user : 'awsuser',
//	password : 'ffffffff',
//	port : '3306',
//	database : 'U_Moive'
//});

//var queryString = 'SELECT * FROM genre';

//connection.query(queryString, function(err, rows, fields) {
//if (err) throw err;

//for (var i in rows) {
//console.log('Genre: ', rows[i].genre);
//}
//});

//connection.end();

//console.log('UMovie');



//
//function pushValue(value) {
//	results = value ;
//	console.log(results) ;
//}
var results ;

function getResults(connection, callback) {
	var cursor = connection.query('SELECT name, rating, date, abstraction, poster FROM movie ORDER BY date DESC LIMIT 5');
	cursor.each(function(err, doc) {
		if (doc !== null) {
			results.push(doc.name);
			//console.log(results);
		} else {
			callback(results) ;
		}
	});
}

function generateResponse(req, res) {
	// The url to connect to the mongodb instance
	var url = 'mysql://awsuser:ffffffff@u-moive.cvgkmmzz4oct.us-east-1.rds.amazonaws.com:3306/U_Moive';
	mysql.connect(url, function(err, connection) {
		// If there is an error, log the error and render the error page 
		if(err !== null) {
			console.log("Connection to server failed.");
			connection.end();
			res.render('error', {
				message: "Connection to server failed.",
				error: err
			});
		}
		// If there is no error while connecting, proceed further
		else {
			console.log("Connected correctly to server.");
			getResults(connection, function(results) {
				//connection.end();
				res.render('homepage.ejs', {results: results});
			});
		}
	});
}

exports.displayResponse = function(req, res){
	generateResponse(req, res);
};