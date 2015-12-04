var express = require('express');
var router = express.Router();
var Bing = require('node-bing-api')({accKey:"9nJKD6eQWAdjyLr0rPAKzFVZMcx0mnzKDEEfKE6qFsc"});

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
				res.render('homepage', {
					user : req.user,
					search_results : movies,
					latestMovies : null
				});
			}
		});
	} else {
		var latestMovie = 'SELECT movie_id, name, rating, date, abstraction, poster FROM movie ORDER BY date DESC LIMIT 5';
		connection.query(latestMovie, function(err, rows, fields) {
			if (err) {
				throw err;
			} else {
				res.render('homepage', {
					user : req.user,
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
	console.log("nono");
	generateResponse(req, res, next);
});


router.get('/topRanked', function(req, res, next) {
	res.render('topranked');
});

router.get('/tagsMovie', function(req, res, next) {
	res.render('tagsmovie', {
		results : null
	});
});

router.get('/bing/:name/:id', function (req, res, next) {
//	console.log("aaaaaa");
    if (req.params.name === undefined) {
        console.log("movie name undefined");
        next(new Error(404));
    }
    else {
//        console.log("add review");
//        console.log(req.params.name);
        Bing.web(req.params.name, function (error, ress, body) {
//            console.log(body
//            		);
            res.render('bing', {
                user: req.user,
                searchResults: body.d.results,
                movie_id: req.params.id
            });
        }, {
            top: 10, 
            skip: 0 
        })
    }
});


module.exports = router;
