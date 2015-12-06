var express = require('express');
var router = express.Router();
var moment = require('moment');

var mysql = require('mysql');
var connection = mysql.createConnection({
	host : 'u-moive.cvgkmmzz4oct.us-east-1.rds.amazonaws.com',
	user : 'awsuser',
	password : 'ffffffff',
	port : '3306',
	database : 'U_Moive'
});



function generateResponse(req, res, next) {

	if (req.query.search != null) {
		var searchMovie = 'SELECT distinct m.movie_id, m.name as mname, rating, date, abstraction, poster FROM movie m inner join involve_in i on m.movie_id = i. i_mid inner join person p on p.personId = i.i_pid WHERE UPPER(m.name) LIKE UPPER('+'"%'+ req.query.search + '%")' + 'OR UPPER(p.name) LIKE UPPER('+'"%'+ req.query.search + '%")';
		connection.query(searchMovie, function(err, movies) {
			if (err) {
				throw err;
			} else {
				res.render('tagsmovie', {
					user : req.user,
					tagsMovie : null,
					search_results : movies
				});
			}
		});
	} else {
		console.log("1");
		var groupGenreQuery = 'SELECT * FROM movie m INNER JOIN movie_genre mg ON m.movie_id = mg.mg_mid GROUP BY mg.genre ';
		connection.query(groupGenreQuery, function(err, tags) {
			console.log("2");
			if (!err) {
				res.render('tagsmovie', {
					user : req.user,
					tagsMovie : tags,
					search_results : null
				});
			} else {
				console.log(err);
				next(new Error(500));
			}
		});
	}
}

router.get('/', function (req, res, next) {
	console.log("0");
	generateResponse(req, res, next);
	
});

module.exports = router;