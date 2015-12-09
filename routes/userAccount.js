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

function getUserInfo(req, res, next) {
	var profileQuery = 'select name as likeMovie from movie, user_taste where user_taste.ut_mid = movie.movie_id and user_taste.likes = 1 and user_taste.ut_email ="'+req.params.email+'"';
	connection.query(profileQuery, function(err, userLike) {
		if (err) {
			throw err;
		} else {
			userDislike(req,res,userLike,next);
		}
	});
}

function userDislike(req,res,userLike,next){
	var profileQuery2 = 'select name as dislikeMovie from movie, user_taste where user_taste.ut_mid = movie.movie_id and user_taste.likes = 0 and user_taste.ut_email ="'+req.params.email+'"';
	connection.query(profileQuery2, function(err, userDislike) {
		if (err) {
			throw err;
		} else {
			userComment(req,res,userLike,userDislike,next);
		}
	});
}

function userComment(req,res,userLike,userDislike,next){
	var profileQuery3 = 'select content,movie.name from review,movie where movie.movie_id = review.movie_id and review.email ="'+req.params.email+'"';	
	
	connection.query(profileQuery3, function(err, userComment) {
		if (err) {
			throw err;
		} else {
			userFriends1(req,res,userLike,userDislike,userComment,next);
		}
	});
}

function userFriends1(req,res,userLike,userDislike,userComment,next){
var profileQuery4 = 'select person1 from friends where person2 ="'+req.params.email+'" AND person1 <> "'+req.params.email+'"';	
	
	connection.query(profileQuery4, function(err, userFriends1) {
		if (err) {
			throw err;
		} else {
			userFriends2(req,res,userLike,userDislike,userComment,userFriends1,next);
		}
	});
}

function userFriends2(req,res,userLike,userDislike,userComment,userFriends1,next){
	var profileQuery5 = 'select person2 from friends where person1 ="'+req.params.email+'" AND person2 <> "'+req.params.email+'"';	
		
		connection.query(profileQuery5, function(err, userFriends2) {
			if (err) {
				throw err;
			} else {
				res.render('userAccount.ejs', {
					email : req.params.email,
					userLike : userLike,
					userDislike: userDislike,
					userComment: userComment,
					userFriends1: userFriends1,
					userFriends2: userFriends2
				});
			}
		});
	}

function redirectUserAccountPage(req, res, email2, msg) {
	req.session.msg = msg;
	res.writeHead(302, {
		'Location' : '/users/' + email2
	});
	res.end();
}

function addFriendQuery(req, res, next) {
	if (req.user == null) {
		res.redirect('/');
	} else {
		console.log("what??????");
		var email1 = req.user.email;
		var email2 = req.query.addFriend;
		var addFriendQuery = 'INSERT INTO friends (person1,person2) VALUES ("'
			+ email1
			+ '","'
			+ email2 + '")';
		console.log("77"+addFriendQuery);
		connection.query(addFriendQuery, function(err, addFriend) {
			if (!err) {
				redirectUserAccountPage(req, res, email2, "have already added this new friend!");
			} else {
				next(new Error(500));
			}
		});
	}
}

function friendQuery(req, res, next) {
	if (req.user == null) {
		res.redirect('/');
	} else {
		var email1 = req.user.email;
		var email2 = req.query.addFriend;
		var checkQuery = 'SELECT count(*) as num FROM friends WHERE person1 = "'
			+ email1 + '" AND person2 = "' + email2 + '" OR person1 = "'
			+ email2 + '" AND person2 = "' + email1 +'"';
		connection.query(checkQuery, function(err, count) {
			if (!err) {
				console.log(count);
				console.log(count.num);
				console.log(email1);
				console.log(email2);
				if (count[0].num == 0) {
					console.log("cry");
					addFriendQuery(req, res, next);
				} else {
					console.log("hateu");
					redirectUserAccountPage(req, res, email2, "you've already been friends!");
				}
			} else {
				next(new Error(500));
			}
		});

	}
}









router.get('/:email', function (req, res, next) {
	console.log("aaaaaa");
    if (req.params.email === undefined) {
        console.log("email undefined");
        next(new Error(404));
    }
    else {
    	getUserInfo(req, res, next);
    }
});

router.get('/addFriend', function(req, res, next) {
	console.log("999999999");
	friendQuery(req, res, next);
});

module.exports = router;
