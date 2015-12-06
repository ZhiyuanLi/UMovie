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

/* get latest movie from mysql database */

function generateResponse(req, res, next) {

	if (req.query.search != null) {
		var people = [];
		var searchMovie = 'SELECT distinct m.movie_id, m.name as mname, rating, date, abstraction, poster FROM movie m inner join involve_in i on m.movie_id = i. i_mid inner join person p on p.personId = i.i_pid WHERE UPPER(m.name) LIKE UPPER('+'"%'+ req.query.search + '%")' + 'OR UPPER(p.name) LIKE UPPER('+'"%'+ req.query.search + '%")';
		connection.query(searchMovie, function(err, movies) {
			if (err) {
				throw err;
			} else {
				res.render('topranked', {
					user : req.user,
					search_results : movies,
					topRankedMovies : null
				});
			}
		});
	} else {
		var topRankedMovies = 'SELECT movie_id, name, rating, date, abstraction, poster FROM movie ORDER BY rating DESC LIMIT 10';
		connection.query(topRankedMovies, function(err, rows, fields) {
			if (err) {
				throw err;
			} else {
				res.render('topranked', {
					user : req.user,
					topRankedMovies : rows,
					search_results:null
				});
			}
		});
	}
}


/* GET home page. */

router.get('/', function(req, res, next) {
	generateResponse(req, res, next);
});

module.exports = router;