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
function showSearchMovie(req, res, next) {
	if (req.query.search != null) {
		var searchMovie = 'SELECT m.movie_id, m.name as mname, p.name as pname, i_job, rating, date, abstraction, poster FROM movie m inner join involve_in i on m.movie_id = i. i_mid inner join person p on p.personId = i.i_pid WHERE UPPER(m.name) LIKE UPPER('+'"%'+ req.query.search + '%")' + 'OR UPPER(p.name) LIKE UPPER('+'"%'+ req.query.search + '%")';
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
		var latestMovie = 'SELECT movie_id, name, rating, date, abstraction, poster FROM movie ORDER BY date DESC LIMIT 5';
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

function doMovieQuery(req, res, next) {
	console.log("1");
	console.log(req.query.movie_id);
	console.log("hehe");
	var movieQuery = 'SELECT * FROM movie WHERE movie_id = "' + req.query.movie_id + '"' ;
	connection.query(movieQuery, function (err, movieDetail) {
		if (!err) {
			console.log("yes!!");
			res.render('movie.ejs', {movieDetail: movieDetail});
		} else
			next(new Error(500));
	});
}


/* GET home page. */

router.get('/homepage', function(req, res, next) {
	showSearchMovie(req, res, next);
});

router.get('/homepage/:movie_id', function(req, res, next) {
	console.log("kkk");
	doMovieQuery(req, res, next);
});

router.get('/topRanked', function(req, res, next) {
	res.render('topranked');
});

router.get('/tagsMovie', function(req, res, next) {
	res.render('tagsmovie', {
		results : null
	});
});

router.get('/moviepage', function(req, res, next) {
	res.render('moviepage',{
		results : null
	});
});



module.exports = router;
