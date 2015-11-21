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

function doMovieQuery(req, res, next) {
	console.log("1");
	console.log(req.query.movie_id);
	console.log("hehe");
	var movieQuery = 'SELECT * FROM movie WHERE movie_id = "' + req.query.movie_id + '"' ;
	connection.query(movieQuery, function (err, movieDetail) {
		if (!err) {
			console.log("yes!!");
			res.render('movie.ejs', {movieDetail: movieDetail, search_results: null});
		} else
			next(new Error(500));
	});
}

/* get latest movie from mysql database */
function showSearchMovie(req, res, next) {
	if (req.query.search != null) {
		var searchMovie = 'SELECT m.movie_id, m.name as mname, p.name as pname, i_job, rating, date, abstraction, poster FROM movie m inner join involve_in i on m.movie_id = i. i_mid inner join person p on p.personId = i.i_pid WHERE UPPER(m.name) LIKE UPPER('+'"%'+ req.query.search + '%")' + 'OR UPPER(p.name) LIKE UPPER('+'"%'+ req.query.search + '%")';
		connection.query(searchMovie, function(err, rows, fields) {
			if (err) {
				throw err;
			} else {
				res.render('movie', {
					search_results : rows,
					movieDetail : null
					
				});
				// connection.end();
			}
		});
	} else {
		doMovieQuery(req, res, next) ;
}
}


router.get('/', function (req, res, next) {
//    if (req.query.movie_id == undefined) {
//    	console.log("lala");
//        next(new Error(404));
//    }
//    
//    else
    	showSearchMovie(req, res, next);
});

module.exports = router;