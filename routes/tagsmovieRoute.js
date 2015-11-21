

var mysql = require('mysql');
var connection = mysql.createConnection({
	host : 'u-moive.cvgkmmzz4oct.us-east-1.rds.amazonaws.com',
	user : 'awsuser',
	password : 'ffffffff',
	port : '3306',
	database : 'U_Moive'
});



function generateResponse(req, res) {
	var latestMovie = 'SELECT name, rating, date, abstraction, poster FROM movie ORDER BY date DESC LIMIT 5';
	connection.query(latestMovie, function(err, rows, fields) {
		if (err) {
			throw err;
		} else {
			res.render('tagsmovie', {
				results : rows,
			});
			// connection.end();
		}
	});
}

exports.displayResponse = function(req, res){
	generateResponse(req, res);
};