var mysql = require('mysql');
var connection = mysql.createConnection({
	host : 'u-moive.cvgkmmzz4oct.us-east-1.rds.amazonaws.com',
	user : 'awsuser',
	password : 'ffffffff',
	port : '3306',
	database : 'U_Moive'
});
var express = require('express');
var router = express.Router();

function doMovieQuery(req, res, next) {
	console.log("1");
	var movieQuery = 'SELECT * FROM movie WHERE movie_id = "' + req.query.movie_id + '"' ;
	connection.query(movieQuery, function (err, movieDetail) {
		if (!err) {
			console.log("yes!!");
			res.render('/movie.ejs', {movieDetail: movieDetail});
		} else
			next(new Error(500));
	});
}

//router.get('/', function (req, res, next) {
//	console.log("2");
//	doMovieQuery(req, res, next);
//});

module.exports = router;