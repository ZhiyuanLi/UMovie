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



function userFriends2(req, res, likesInfo, recommendationInfo, likesMovieInfo, dislikeInfo, commentInfo, userFriends1, next) {
	var friendQuery2 = 'SELECT person2 FROM friends WHERE person1 ="' + req.user.email + '" AND person2 <> "' + req.user.email + '"';
	connection.query(friendQuery2, function (err, userFriends2) {
		if (err) {
			throw err;
		} else {
			res.render('profile.ejs', {
				user : req.user,
				likeRecommendation : recommendationInfo,
				likeMovie : likesMovieInfo,
				userLike : likesInfo,
				userDislike : dislikeInfo,
				userComment : commentInfo,
				userFriends1 : userFriends1,
				userFriends2 : userFriends2
			});
		}
	});
}

function userFriends1(req, res, likesInfo, recommendationInfo, likesMovieInfo, dislikeInfo, commentInfo, next) {
	var friendQuery1 = 'SELECT person1 FROM friends WHERE person2 ="'
			+ req.user.email + '" AND person1 <> "' + req.user.email + '"';
	connection.query(friendQuery1, function (err, userFriends1) {
		if (err) {
			throw err;
		} else {
			userFriends2(req, res, likesInfo, recommendationInfo, likesMovieInfo, dislikeInfo, commentInfo, userFriends1, next)
		}
	});
}


function userComment(req, res, likesInfo, recommendationInfo, likesMovieInfo, dislikeInfo, next) {
	var commentQuery = 'SELECT content, movie.name FROM review INNER JOIN movie ON movie.movie_id = review.movie_id WHERE review.email ="'
			+ req.user.email + '"';
	connection.query(commentQuery, function (err, commentInfo) {
		if (err) {
			throw err;
		} else {
			userFriends1(req, res, likesInfo, recommendationInfo, likesMovieInfo, dislikeInfo, commentInfo, next);
		}
	});
}

function doUserDislike(req, res, likesInfo, recommendationInfo, likesMovieInfo, next) {
	var dislikeQuery = 'SELECT * FROM movie m INNER JOIN (SELECT ut_mid AS movie_id FROM user_taste WHERE ut_email = "' + req.user.email + '"AND dislikes = 1) temp ON temp.movie_id = m.movie_id';
	connection.query(dislikeQuery, function (err, dislikeInfo) {
		if (err) {
			throw err;
		} else {
			userComment(req, res, likesInfo, recommendationInfo, likesMovieInfo, dislikeInfo, next);
		}
	});
}

function doLikeMovieQuery(req, res, likesInfo, recommendationInfo, likesGenreInfo, next) {
	if (likesGenreInfo.length < 1) {
		var highRatingQuery = 'SELECT * FROM movie ORDER BY rating DESC LIMIT 5';
		connection.query(highRatingQuery, function (err, likesMovieInfo) {
			if (!err) {
				doUserDislike(req, res, likesInfo, recommendationInfo, likesMovieInfo, next)
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
		console.log(genre);
		var likeMovieQuery = 'SELECT * FROM movie INNER JOIN (SELECT temp1.movie_id FROM (SELECT m.movie_id AS movie_id FROM movie_genre mg INNER JOIN movie m ON mg.mg_mid = m.movie_id WHERE mg.mg_genre = "'+ genre + '") temp1 LEFT JOIN (SELECT ut_mid AS movie_id FROM user_taste WHERE ut_email = "'+ req.user.email + '"AND likes = 1) temp2 ON temp1.movie_id = temp2.movie_id WHERE temp2.movie_id IS NULL) temp3 ON temp3.movie_id = movie.movie_id ORDER BY rating DESC LIMIT 5'; 
		connection.query(likeMovieQuery, function (err, likesMovieInfo) {
			if (!err) {
				console.log("111",likesMovieInfo);
				doUserDislike(req, res, likesInfo, recommendationInfo, likesMovieInfo, next)
			} else {
				next(new Error(500));
			}
		});
	}
}

function doLikeGenreQuery(req, res, likesInfo, next) {
	var recommendationInfo = [];
	if (likesInfo.length <1) {
		var likesGenreInfo = [];
		doLikeMovieQuery(req, res, likesInfo, recommendationInfo, likesGenreInfo, next);
	} else {
		var movie_id;
		var length = likesInfo.length;
		var recommendationInfo = [];
		if (length == 1) {
			movie_id = likesInfo[0].ut_mid;
			recommendationInfo[0] = likesInfo[0];
		} else {
			var index = getRandomInt(length);
			movie_id = likesInfo[index].ut_mid
			recommendationInfo[0] = likesInfo[index];
		}
		var likeGenreQuery = 'SELECT mg_genre FROM movie_genre WHERE mg_mid = "'
				+ movie_id + '"';
		connection.query(likeGenreQuery, function (err, likesGenreInfo) {
			if (!err) {
				console.log(recommendationInfo);
				console.log(likesGenreInfo);
				doLikeMovieQuery(req, res, likesInfo, recommendationInfo, likesGenreInfo, next);
			} else {
				next(new Error(500));
			}
		});
	}
}

function doUserLikeQuery(req, res, next) {
	var likeQuery = 'SELECT * FROM movie m INNER JOIN (SELECT ut_mid AS movie_id FROM user_taste WHERE ut_email = "' + req.user.email + '"AND likes = 1) temp ON temp.movie_id = m.movie_id';
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






// PROFILE SECTION =========================
router.get('/', isLoggedIn, function(req, res, next) {
	doUserLikeQuery(req, res, next);
});

module.exports = router;
