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

function tagsQuery(req, res, tagsInfo, next) {
	var tags = req.query.tags;
	console.log("3",tags);
	var tagsQuery = 'SELECT * FROM movie m INNER JOIN movie_genre mg ON m.movie_id = mg.mg_mid WHERE mg.mg_genre = "' + tags + '"';
	connection.query (tagsQuery, function (err, tagsResult) {
		if (!err) {
			console.log("Tags info already added!");
			res.render('tagsmovie', {
				user : req.user,
				tagsMovie : tagsInfo,
				tagsResult : tagsResult,
				search_results : null
			});
		} else {
			next(new Error(500));
		}
	});
}

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
					tagsResult : null,
					search_results : movies
				});
			}
		});
	} else {
		var tagsInfoQuery = 'SELECT genre FROM genre';
		connection.query(tagsInfoQuery, function(err, tagsInfo) {
			if (!err) {
				console.log("2");
				tagsQuery(req, res, tagsInfo, next);
			} else {
				next(new Error(500));
			}
		});
	}
}

router.get('/', function (req, res, next) {
	generateResponse(req, res, next);	
});

router.get('/tags', function (req, res, tagsInfo,next) {
	tagsQuery(req, res, tagsInfo, next)
});


module.exports = router;