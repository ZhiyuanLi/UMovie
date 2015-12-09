var express = require('express');
var router = express.Router();
var moment = require('moment');
var Bing = require('node-bing-api')({accKey:"9nJKD6eQWAdjyLr0rPAKzFVZMcx0mnzKDEEfKE6qFsc"});

var mysql = require('mysql');
var connection = mysql.createConnection({
	host : 'u-moive.cvgkmmzz4oct.us-east-1.rds.amazonaws.com',
	user : 'awsuser',
	password : 'ffffffff',
	port : '3306',
	database : 'U_Moive'
});


function doSearchQuery (req, res, nest) {
	var searchMovie = 'SELECT distinct m.movie_id, m.name as mname, rating, date, abstraction, poster FROM movie m inner join involve_in i on m.movie_id = i. i_mid inner join person p on p.personId = i.i_pid WHERE UPPER(m.name) LIKE UPPER('+'"%'+ req.query.search + '%")' + 'OR UPPER(p.name) LIKE UPPER('+'"%'+ req.query.search + '%") limit 6';
	connection.query(searchMovie, function(err, movies) {
		if (!err) {
			res.render('tagsmovie', {
				user : req.user,
				tagsMovie : null,
				tagsResult : null,
				search_results : movies,
				bing_search_results: null
			});
		} else {
			next(new Error(500));
		}
	});
}

function doBingSearch(req, res, next){
	Bing.web(req.query.bingSearch, function (error, ress, body) { 
		res.render('tagsMovie', {
			user : req.user,
			tagsMovie : null,
			tagsResult : null,
			search_results : null,
			bing_search_results: body.d.results,
		});
	}, {
		top: 10, 
		skip: 0 
	});
}

function doTagsMovieQuery(req, res, next) {
	var tags = req.query.tags;
	var tagsQuery = 'SELECT * FROM movie m INNER JOIN movie_genre mg ON m.movie_id = mg.mg_mid WHERE mg.mg_genre = "' + tags + '" limit 45';
	connection.query (tagsQuery, function (err, tagsResult) {
		if (!err) {
			console.log("Tags info already added!");
			res.render('tagsmovie', {
				user : req.user,
				tagsMovie : null,
				tagsResult : tagsResult,
				search_results : null,
				bing_search_results: null
			});
		} else {
			next(new Error(500));
		}
	});	
}

function doTagsQuery(req, res, next) {
	var tagsInfoQuery = 'SELECT genre FROM genre';
	connection.query(tagsInfoQuery, function(err, tagsInfo) {
		if (!err) {
			res.render('tagsmovie', {
				user : req.user,
				tagsMovie : tagsInfo,
				tagsResult : null,
				search_results : null,
				bing_search_results: null
			});	
		} else {
			next(new Error(500));
		}
	});
}

function generateResponse(req, res, next) {
	if (req.query.search != null) {
		doSearchQuery(req, res, next);
	} else if(req.query.bingSearch != null){
		doBingSearch(req, res, next);
	} else if (req.query.tags != null) {
		doTagsMovieQuery(req, res, next);
	} else {
		doTagsQuery(req, res, next);
	}
}

router.get('/', function (req, res, next) {
	generateResponse(req, res, next);	
});


module.exports = router;