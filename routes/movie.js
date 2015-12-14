var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var router = express.Router();

//added bing
var Bing = require('node-bing-api')({accKey:"9nJKD6eQWAdjyLr0rPAKzFVZMcx0mnzKDEEfKE6qFsc"});
var moment = require('moment');

var mysql = require('mysql');
var connection = mysql.createConnection({
	host : 'u-moive.cvgkmmzz4oct.us-east-1.rds.amazonaws.com',
	user : 'awsuser',
	password : 'ffffffff',
	port : '3306',
	database : 'U_Moive'
});

var movie_id;

//get studios from mongodb
function getStudios(StudioIds, db, callback) {
	var studioIdArray = [];
	StudioIds.forEach(function(result){studioIdArray.push(result.studio_id)});
	var cursor = db.collection('studio').find({
		'studioId' : {
			$in : studioIdArray
		}
	});
	var studios = [];
	cursor.each(function(err, doc) {
		if (doc != null) {
			studios.push(doc.name);
		} else {
			callback(studios);
		}
	});
};

function doStudioQuery(req, res, movieInfo, personInfo, tasteInfo, reviewInfo, genreInfo, StudioIds, next) {
	// The url to connect to the mongodb instance
	var url = 'mongodb://jimmy:cis550@ds063124.mongolab.com:63124/umovie';
	MongoClient.connect(url, function(err, mongodb) {
		// If there is an error, log the error and render the error page
		if (err != null) {
			console.log("Connection to server failed.");
			mongodb.close();
			res.render('error', {
				message : "Connection to server failed.",
				error : err
			});
		}
		// If there is no error while connecting, proceed further
		else {
			console.log("Connected correctly to server.");
			getStudios(StudioIds, mongodb, function(studios) {
				mongodb.close();
				res.render('movie.ejs', {
					user : req.user,
					person : personInfo,
					search_results : null,
					movieDetail : movieInfo,
					reviews : reviewInfo,
					taste : tasteInfo,
					genre : genreInfo, 
					studios : studios,
					bing_search_results : null	
				});
			});
		}
	});

}

function doStudioIdQuery(req, res, movieInfo, personInfo, tasteInfo, reviewInfo, genreInfo, next) {
	var StudioIdQuery = 'SELECT studio_id FROM movie_studio WHERE ms_mid = "'
		+ req.query.movie_id + '"';
	connection.query(StudioIdQuery, function(err, StudioIds) {
		if (!err) {
			doStudioQuery(req, res, movieInfo, personInfo, tasteInfo, reviewInfo, genreInfo, StudioIds, next);
		} else {
			next(new Error(500));
		}
	});
}

//get movie genre
function doGenreQuery(req, res, movieInfo, personInfo, tasteInfo, reviewInfo, next) {
	var genreQuery = 'SELECT mg_genre FROM movie_genre WHERE mg_mid = "' + req.query.movie_id + '"';
	connection.query(genreQuery, function(err, genreInfo){
		if (!err) {
			doStudioIdQuery(req, res, movieInfo, personInfo, tasteInfo, reviewInfo, genreInfo, next)
		} else {
			next(new Error(500));
		}
	});
}

//get all the review for a specific movie
function doReviewQuery(req, res, movieInfo, personInfo, tasteInfo, next) {
	var reviewQuery = 'SELECT * FROM review WHERE movie_id = "' + req.query.movie_id + '"';
	connection.query(reviewQuery, function(err, reviewInfo) {
		if (!err) {
			doGenreQuery(req, res, movieInfo, personInfo, tasteInfo, reviewInfo, next);
		} else {
			next(new Error(500));
		}
	});
}

//get all user's like and dislike for the movie
function doTasteQuery(req, res, movieInfo, personInfo, next) {
	var tasteQuery = 'SELECT sum(likes) as movie_likes, sum(dislikes) as movie_dislikes FROM user_taste WHERE ut_mid = "'
		+ req.query.movie_id + '"';
	connection.query(tasteQuery, function(err, tasteInfo) {
		if (!err) {
			doReviewQuery(req, res, movieInfo, personInfo, tasteInfo, next);
		} else {
			next(new Error(500));
		}
	});
}

//get crew info
function doPersonQuery(req, res, movieInfo, next) {
	var personQuery = 'SELECT p.name as pname, i.i_job as job FROM movie m INNER JOIN involve_in i ON m.movie_id = i.i_mid '
		+ 'INNER JOIN person p ON p.personId = i.i_pid WHERE m.movie_id = "'
		+ req.query.movie_id + '"';
	connection.query(personQuery, function(err, personInfo) {
		if (!err) {
			doTasteQuery(req, res, movieInfo, personInfo, next);
		} else {
			next(new Error(500));
		}
	});
}

//get all movie info
function doMovieQuery(req, res, next) {
	movie_id = req.query.movie_id;
	var movieQuery = 'SELECT * FROM movie WHERE movie_id = "'
		+ req.query.movie_id + '"';
	connection.query(movieQuery, function(err, movieInfo) {
		if (!err) {
			doPersonQuery(req, res, movieInfo);
		} else {
			next(new Error(500));
		}
	});
}

//search local database based on movie name and crew name 
function doSearchQuery(req, res, next) {
	var searchMovie = 'SELECT distinct m.movie_id, m.name as mname, rating, date, abstraction, poster FROM movie m inner join involve_in i on m.movie_id = i. i_mid inner join person p on p.personId = i.i_pid WHERE UPPER(m.name) LIKE UPPER('+'"%'+ req.query.search + '%")' + 'OR UPPER(p.name) LIKE UPPER('+'"%'+ req.query.search + '%") limit 99';
	connection.query(searchMovie, function(err, searchInfo) {
		if (!err) {
			console.log("show search result");
			res.render('movie', {
				user : req.user,
				search_results : searchInfo,
				movieDetail : null,
				person : null,
				reviews : null,
				taste : null,
				genre : null,
				studios : null,
				bing_search_results : null	
			});
		}
	});
}

//do bing search
function doBingSearch(req, res, next){
	Bing.web(req.query.bingSearch, function (error, ress, body) { 
		res.render('movie', {
			user : req.user,
			search_results : null,
			movieDetail : null,
			person : null,
			reviews : null,
			taste : null,
			genre : null,
			studios : null,
			bing_search_results: body.d.results
		});
	}, {
		top: 10, 
		skip: 0 
	});
}

function generateResponse(req, res, next) {
	console.log(req.query.search);
	if (req.query.search != null) {
		doSearchQuery(req, res, next);
	} else if(req.query.bingSearch != null){

		doBingSearch(req, res, next);
	} else {
		doMovieQuery(req, res, next);
	}
}

//get user rating for the review
function ratingQuery(req, res, next) {
	if (req.user == null) {
		res.redirect('/log_in');
	} else {
		var review_id = req.query.review_id;
		console.log("check reviewid", review_id);
		var searchRatingQuery = ' SELECT review_rating, review_count, email FROM review WHERE review_id = "'
			+ review_id + '"';
		connection.query(searchRatingQuery, function(err, rows) {
			if (err) {
				throw err;
			} else {
				if (req.user.email != rows[0].email) {
					var review_rating = new Number();
					var review_count = rows[0].review_count;
					review_count++;
					review_rating = Number(rows[0].review_rating)
					+ Number(req.query.rating);
					var addRatingQuery = 'UPDATE review SET review_rating = "'
						+ review_rating + '", review_count = "'
						+ review_count + '"WHERE review_id = "' + review_id
						+ '"';
					connection.query(addRatingQuery, function(err, rating) {
						if (err) {
							throw err;
						} else {
							redirectMovies(req, res, movie_id,
							"rating already added!");
							console.log("rating updated!");
						}
					});
				} else {
					redirectMovies(req, res, movie_id,
					"can't rating your own reviews!");
					console.log("can't rating your own review");
					// inform user that can't rating their own reviews
				}
			}
		});
	}
}


function reviewQuery(req, res, next) {
	if (req.user == null) {
		res.redirect('/log_in');
	} else {
		var countReviewQuery = 'SELECT COUNT(*) as num FROM review';
		connection
		.query(
				countReviewQuery,
				function(err, countReview) {
					if (err) {
						throw err;
					} else {
						var review_id = countReview[0].num + 1;
						var email = req.user.email;
						var time = new Date();
						var content = req.query.review;
						var rating = 0;
						var timeline = time.getFullYear() + "-"
						+ (time.getMonth() + 1) + "-"
						+ time.getDate() + " "
						+ time.getHours() + ":"
						+ time.getMinutes() + ":"
						+ time.getSeconds();
						var addReviewQuery = 'INSERT INTO review (review_id, time, review_rating, content, email, movie_id) VALUES ("'
							+ review_id
							+ '","'
							+ timeline
							+ '","'
							+ rating
							+ '","'
							+ content
							+ '","'
							+ email + '","' + movie_id + '")';
						connection.query(addReviewQuery, function(err,
								review) {
							if (err) {
								throw err;
							} else {
								redirectMovies(req, res, movie_id,
										"Review already added!");
								console.log("Review already added!");
							}
						});
					}
				});
	}
}

function updateTasteQuery(req, res, next) {
	var email = req.user.email;
	var userlikes = req.query.likes;
	var userdislikes = req.query.dislikes;
	var updateTasteQuery = 'UPDATE user_taste SET likes = "' + userlikes
	+ '", dislikes = "' + userdislikes + '" WHERE ut_email = "' + email
	+ '" AND ut_mid = "' + movie_id + '"';
	connection.query(updateTasteQuery, function(err, updateTaste) {
		if (!err) {
			redirectMovies(req, res, movie_id, "Taste already updated!");
			console.log("Taste already updated!");
		} else {
			next(new Error(500));
		}
	});
}

function addTasteQuery(req, res, next) {
	if (req.user == null) {
		res.redirect('/log_in');
	} else {
		var email = req.user.email;
		var userlikes = req.query.likes;
		var userdislikes = req.query.dislikes;
		var addTasteQuery = 'INSERT INTO user_taste (ut_email,ut_mid,likes,dislikes) VALUES ("'
			+ email
			+ '","'
			+ movie_id
			+ '","'
			+ userlikes
			+ '","'
			+ userdislikes + '")';
		connection.query(addTasteQuery, function(err, addtaste) {
			if (!err) {
				redirectMovies(req, res, movie_id, "Taste already added!");
				console.log("Taste already added!");
			} else {
				next(new Error(500));
			}
		});
	}
}

function tasteQuery(req, res, next) {
	if (req.user == null) {
		res.redirect('/log_in');
	} else {
		var email = req.user.email;
		var checkTasteQuery = 'SELECT* FROM user_taste WHERE ut_email = "'
			+ email + '" AND ut_mid = "' + movie_id + '"';
		connection.query(checkTasteQuery, function(err, taste) {
			if (!err) {
				console.log(taste);
				if (taste[0] == null) {
					addTasteQuery(req, res, next);
				} else {
					updateTasteQuery(req, res, next);
				}
			} else {
				next(new Error(500));
			}
		});

	}
}

function redirectMovies(req, res, movie_id, msg) {
	req.session.msg = msg;
	res.writeHead(302, {
		'Location' : '/movies?movie_id=' + movie_id
	});
	res.end();
}

/* get latest movie from mysql database */

router.get('/', function(req, res, next) {
		generateResponse(req, res, next);
});

router.get('/addReview', function(req, res, next) {
	reviewQuery(req, res, next);
});

router.get('/addRating', function(req, res, next) {
	ratingQuery(req, res, next);
});

router.get('/addTaste', function(req, res, next) {
	tasteQuery(req, res, next);
});


module.exports = router;
