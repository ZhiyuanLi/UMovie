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

function getRandomInt(length) {
	return Math.floor(Math.random() * length);
}

function doLikeMovieQuery(req, res, likesGenreInfo, next) {
	if (likesGenreInfo.length < 1) {
		var highRatingQuery = 'SELECT * FROM movie ORDER BY rating DESC LIMIT 5';
		connection.query(highRatingQuery, function(err, likesMovieInfo) {
			if (!err) {
				getUserInfo(req, res, likesGenreInfo, likesMovieInfo, next);
			} else {
				next(new Error(500));
			}
		});
	} else {
		var genre;
		var length = likesGenreInfo.length;
		if (length == 1) {
			genre = likesGenreInfo[0].mg_genre;
		} else {
			var index = getRandomInt(length);
			genre = likesGenreInfo[index].mg_genre;
		}
		var likeMovieQuery = 'SELECT * FROM movie_genre mg INNER JOIN movie m ON mg.mg_mid = m.movie_id AND mg.mg_genre = "'
				+ genre + '"ORDER BY m.rating DESC LIMIT 5';
		connection.query(likeMovieQuery, function(err, likesMovieInfo) {
			if (!err) {
				console.log(likesMovieInfo);
				getUserInfo(req, res, likesGenreInfo, likesMovieInfo, next);
			} else {
				next(new Error(500));
			}
		});
	}
}

function doLikeGenreQuery(req, res, likesInfo, next) {
	 
	if (likesInfo.length <1) {
		var likesGenreInfo = [];
		doLikeMovieQuery(req, res, likesGenreInfo, next);
	} else {
		var movie_id;
		var length = likesInfo.length;
		if (length == 1) {
			movie_id = likesInfo[0].ut_mid;
		} else {
			var index = getRandomInt(length);
			movie_id = likesInfo[index].ut_mid
		}
		
		var likeGenreQuery = 'SELECT mg_genre FROM movie_genre WHERE mg_mid = "'
				+ movie_id + '"';
		connection.query(likeGenreQuery, function(err, likesGenreInfo) {
			if (!err) {
				console.log(likesGenreInfo);
				doLikeMovieQuery(req, res, likesGenreInfo, next);
			} else {
				next(new Error(500));
			}
		});
	}
}

function doLikeRecommendationQuery(req, res, next) {
	var likeQuery = 'SELECT ut_mid FROM user_taste WHERE ut_email = "'
			+ req.user.email + '"AND likes = 1';
	connection.query(likeQuery, function(err, likesInfo) {
		if (!err) {
			console.log(likesInfo);
			doLikeGenreQuery(req, res, likesInfo, next);
		} else {
			next(new Error(500));
		}
	});
}

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();

	res.redirect('/');
}

function getUserInfo(req, res, likesGenreInfo, likesMovieInfo, next) {
	var profileQuery = 'select name as likeMovie from movie, user_taste where user_taste.ut_mid = movie.movie_id and user_taste.likes = 1 and user_taste.ut_email ="'
			+ req.user.email + '"';
	connection.query(profileQuery, function(err, userLike) {
		if (err) {
			throw err;
		} else {
			userDislike(req, res, likesGenreInfo, likesMovieInfo, userLike,
					next);
		}
	});
}

function userDislike(req, res, likesGenreInfo, likesMovieInfo, userLike, next) {
	var profileQuery2 = 'select name as dislikeMovie from movie, user_taste where user_taste.ut_mid = movie.movie_id and user_taste.likes = 0 and user_taste.ut_email ="'
			+ req.user.email + '"';
	connection.query(profileQuery2, function(err, userDislike) {
		if (err) {
			throw err;
		} else {
			userComment(req, res, likesGenreInfo, likesMovieInfo, userLike,
					userDislike, next);
		}
	});
}

function userComment(req, res, likesGenreInfo, likesMovieInfo, userLike,
		userDislike, next) {
	var profileQuery3 = 'select content,movie.name from review,movie where movie.movie_id = review.movie_id and review.email ="'
			+ req.user.email + '"';

	connection.query(profileQuery3, function(err, userComment) {
		if (err) {
			throw err;
		} else {
			userFriends1(req, res, likesGenreInfo, likesMovieInfo, userLike,
					userDislike, userComment, next);
		}
	});
}

function userFriends1(req, res, likesGenreInfo, likesMovieInfo, userLike,
		userDislike, userComment, next) {
	var profileQuery4 = 'select person1 from friends where person2 ="'
			+ req.user.email + '" AND person1 <> "' + req.user.email + '"';

	connection.query(profileQuery4, function(err, userFriends1) {
		if (err) {
			throw err;
		} else {
			userFriends2(req, res, likesGenreInfo, likesMovieInfo, userLike,
					userDislike, userComment, userFriends1, next);
		}
	});
}

function userFriends2(req, res, likesGenreInfo, likesMovieInfo, userLike,
		userDislike, userComment, userFriends1, next) {
	var profileQuery5 = 'select person2 from friends where person1 ="'
			+ req.user.email + '" AND person2 <> "' + req.user.email + '"';

	connection.query(profileQuery5, function(err, userFriends2) {
		if (err) {
			throw err;
		} else {
			res.render('profile.ejs', {
				user : req.user,
				likeRecommendation : likesMovieInfo,
				userLike : userLike,
				userDislike : userDislike,
				userComment : userComment,
				userFriends1 : userFriends1,
				userFriends2 : userFriends2
			});
		}
	});
}

// PROFILE SECTION =========================
router.get('/', isLoggedIn, function(req, res, next) {
	doLikeRecommendationQuery(req, res, next);
});

module.exports = router;
