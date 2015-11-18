var express = require('express');
var router = express.Router();

var mysql = require('mysql');
var connection = mysql.createConnection({
	host : 'u-moive.cvgkmmzz4oct.us-east-1.rds.amazonaws.com',
	user : 'awsuser',
	password : 'ffffffff',
	port : '3306',
	database : 'U_Moive'
});

/* GET home page. */
router.get('/', function(req, res, next) {
	showLatestMovie(req, res, next);
});

router.get('/topRanked', function(req, res, next) {
	res.render('topRanked');
});

router.get('/tagsMovie', function(req, res, next) {
	res.render('tagsMovie', {
		results : null
	});
});

module.exports = router;

/* get latest movie from mysql database */
function showLatestMovie(req, res, next) {
	//connection.connect();
	var latestMovie = 'SELECT name, rating, date, abstraction, poster FROM movie ORDER BY date DESC LIMIT 5';
	connection.query(latestMovie, function(err, rows, fields) {
		if (err) {
			throw err;
			//connection.end();
		} else {
			res.render('homepage', {
				latestMovies : rows
			});
			//connection.end();
		}
	});
}
