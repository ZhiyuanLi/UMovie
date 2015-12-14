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

//get user like movie
function getUserInfo(req, res, next) {
	var profileQuery = 'SELECT * FROM movie m INNER JOIN (SELECT ut_mid AS movie_id FROM user_taste WHERE ut_email = "' + req.query.email + '"AND likes = 1) temp ON temp.movie_id = m.movie_id';
	connection.query(profileQuery, function(err, userLike) {
		if (err) {
			throw err;
		} else {
			userDislike(req,res,userLike,next);
		}
	});
}

// get user dislike movie
function userDislike(req,res,userLike,next){
	var profileQuery2 = 'SELECT * FROM movie m INNER JOIN (SELECT ut_mid AS movie_id FROM user_taste WHERE ut_email = "' + req.query.email + '"AND dislikes = 1) temp ON temp.movie_id = m.movie_id';
	connection.query(profileQuery2, function(err, userDislike) {
		if (err) {
			throw err;
		} else {
			userComment(req,res,userLike,userDislike,next);
		}
	});
}

//get user review
function userComment(req,res,userLike,userDislike,next){
	var profileQuery3 = 'select content,movie.name from review,movie where movie.movie_id = review.movie_id and review.email ="'+req.query.email+'"';	
	
	connection.query(profileQuery3, function(err, userComment) {
		if (err) {
			throw err;
		} else {
			userFriends1(req,res,userLike,userDislike,userComment,next);
		}
	});
}

//get friend list
function userFriends1(req,res,userLike,userDislike,userComment,next){
var profileQuery4 = 'select person1 from friends where person2 ="'+req.query.email+'" AND person1 <> "'+req.query.email+'"';	
	console.log(req.query.email);
	connection.query(profileQuery4, function(err, userFriends1) {
		if (err) {
			throw err;
		} else {
			console.log(userFriends1);
			userFriends2(req,res,userLike,userDislike,userComment,userFriends1,next);
		}
	});
}

//get friend list
function userFriends2(req,res,userLike,userDislike,userComment,userFriends1,next){
	var profileQuery5 = 'select person2 from friends where person1 ="'+req.query.email+'" AND person2 <> "'+req.query.email+'"';	
		
		connection.query(profileQuery5, function(err, userFriends2) {
			if (err) {
				throw err;
			} else {
				console.log(userFriends2);
				res.render('userAccount.ejs', {
					email : req.query.email,
					userLike : userLike,
					userDislike: userDislike,
					userComment: userComment,
					userFriends1: userFriends1,
					userFriends2: userFriends2
				});
			}
		});
	}

router.get('/', function (req, res, next) {

    	getUserInfo(req, res, next);
    });



module.exports = router;
