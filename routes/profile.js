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




function getRandomInt(min, max) {
	return Math.random() * (max - min + 1) + min ;
}


function doLikeMovieQuery(req, res, likesGenreInfo, next) {
	var genre ;
	var length = likesGenreInfo.length;
	if (length == 1) {
		genre = likesGenreInfo[0];
	} else {
		var index = getRandomInt(1, length) - 1;
		genre = likesGenreInfo[index].mg_genre;
	}
	var likeMovieQuery = 'SELECT m.movie_id FROM movie_genre mg INNER JOIN movie m ON mg.mg_mid = m.movie_id AND mg.mg_genre = "' + genre +'"ORDER BY m.rating"';
	connection.query(likeMovieQuery, function (err, likesMovieInfo) {
		if (!err) {
			res.render('user', {
				user : req.user,
				userLike : userLike,
				userDislike: userDislike,
				userComment: userComment,
				recommendation: likesMovieInfo
		});
		} else {
			next(new Error(500));
		}
	})
}

function doLikeGenreQuery(req, res, likesInfo, next) {
	var movie_id ;
	var length = likesInfo.length;
	if (length == 1) {
		movie_id = likesInfo[0].ut_mid;
	} else {
		var index = getRandomInt(1, length) - 1 ;
		movie_id = likesInfo[index].ut_mid
	}
	var likeGenreQuery = 'SELECT mg_genre FROM movie_genre WHERE mg_mid = "' + movie_id + '"';
	connection.query(likeGenreQuery, function (err, likesGenreInfo) {
		if (!err) {
			doLikeMovieQuery(req, res, likesGenreInfo, next) ;
		} else {
			next(new Error(500));
		}
	}); 
}


function doLikeRecommendationQuery(req, res, next) {
	var likeQuery = 'SELECT ut_mid FROM user_taste WHERE ut_email = "' + req.user + '"AND likes = 1"';
	connection.query(likeQuery, function (err, likesInfo) {
		if (!err) {
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



function getUserInfo(req, res, next) {
	var profileQuery = 'select name as likeMovie from movie, user_taste where user_taste.ut_mid = movie.movie_id and user_taste.likes = 1 and user_taste.ut_email ="'+req.user.email+'"';
	connection.query(profileQuery, function(err, userLike) {
		if (err) {
			throw err;
		} else {
			userDislike(req,res,userLike,next);
		}
	});
}

function userDislike(req,res,userLike,next){
	var profileQuery2 = 'select name as dislikeMovie from movie, user_taste where user_taste.ut_mid = movie.movie_id and user_taste.likes = 0 and user_taste.ut_email ="'+req.user.email+'"';
	connection.query(profileQuery2, function(err, userDislike) {
		if (err) {
			throw err;
		} else {
			userComment(req,res,userLike,userDislike,next);
		}
	});
}




function userComment(req,res,userLike,userDislike,next){
	var profileQuery3 = 'select content,movie.name from review,movie where movie.movie_id = review.movie_id and review.email ="'+req.user.email+'"';	
	
	connection.query(profileQuery3, function(err, userComment) {
		if (err) {
			throw err;
		} else {
			res.render('profile.ejs', {
				user : req.user,
				userLike : userLike,
				userDislike: userDislike,
				userComment: userComment
			});
		}
	});
}

//PROFILE SECTION =========================
router.get('/', isLoggedIn, function(req, res, next) {
	getUserInfo(req, res, next);
});

module.exports = router;

