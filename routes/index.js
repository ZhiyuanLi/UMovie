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
// function showLatestMovie(req, res, next) {
// var latestMovie = 'SELECT name, rating, date, abstraction, poster FROM movie
// ORDER BY date DESC LIMIT 5';
// connection.query(latestMovie, function(err, rows, fields) {
// if (err) {
// throw err;
// } else {
// res.render('homepage', {
// latestMovies : rows
// });
// // connection.end();
// }
// });
// }
/* get latest movie from mysql database */
function showSearchMovie(req, res, next) {
	if (req.query.search != null) {
		var searchMovie = 'SELECT m.name as mname, p.name as pname, i_job, rating, date, abstraction, poster FROM movie m inner join involve_in i on m.movie_id = i. i_mid inner join person p on p.personId = i.i_pid WHERE UPPER(m.name) LIKE UPPER('+'"%'+ req.query.search + '%")' + 'OR UPPER(p.name) LIKE UPPER('+'"%'+ req.query.search + '%")';
		connection.query(searchMovie, function(err, rows, fields) {
			if (err) {
				throw err;
			} else {
				res.render('homepage', {
					search_results : rows,
					latestMovies : null
					
				});
				// connection.end();
			}
		});
	} else {
		var latestMovie = 'SELECT name, rating, date, abstraction, poster FROM movie ORDER BY date DESC LIMIT 5';
		connection.query(latestMovie, function(err, rows, fields) {
			if (err) {
				throw err;
			} else {
				res.render('homepage', {
					latestMovies : rows,
					search_results:null
				});
				// connection.end();
			}
		});
	}
}

/* GET home page. */
router.get('/', function(req, res, next) {
	// showLatestMovie(req, res, next);
	showSearchMovie(req, res, next)
});

router.get('/topRanked', function(req, res, next) {
	res.render('topranked');
});

router.get('/tagsMovie', function(req, res, next) {
	res.render('tagsmovie', {
		results : null
	});
});

module.exports = router;
