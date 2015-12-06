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

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();

	res.redirect('/');
}

//function getUserInfo(req, res, next){
//var profileQuery = 'select ut_mid from U_Movie.user_taste where likes = 1 and ut_email ="'+req.user.email+'"';
//connection.query(profileQuery, function(err, reviews) {
//if (err) {
//throw err;
//} else {
//res.render('profile.ejs', {
//user : req.user,
//person : person,
//search_results : null,
//movieDetail : movieDetail,
//reviews : reviews,
//taste : taste
//});
//console.log("Send user info back");
//}
//}

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
