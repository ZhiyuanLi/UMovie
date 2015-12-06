var express = require('express');
var router = express.Router();
//added bing
var Bing = require('node-bing-api')({accKey:"9nJKD6eQWAdjyLr0rPAKzFVZMcx0mnzKDEEfKE6qFsc"});

var mysql = require('mysql');
var connection = mysql.createConnection({
	host : 'u-moive.cvgkmmzz4oct.us-east-1.rds.amazonaws.com',
	user : 'awsuser',
	password : 'ffffffff',
	port : '3306',
	database : 'U_Moive'
});

var movie_id;

function showQueryResult(req, res, movieDetail, person, taste, next) {
	var reviewQuery = 'select * from review where movie_id = "'
			+ req.query.movie_id + '"';
	connection.query(reviewQuery, function(err, reviews) {
		if (err) {
			throw err;
		} else {
			res.render('movie.ejs', {
				user : req.user,
				person : person,
				search_results : null,
				movieDetail : movieDetail,
				reviews : reviews,
				taste : taste,
				bing_search_results : null
			});
			console.log("Send movie info back");
		}
	});
}

function doTasteQuery(req, res, movieDetail, person, next) {
	var tasteQuery = 'SELECT sum(likes) as movie_likes, sum(dislikes) as movie_dislikes FROM user_taste WHERE ut_mid = "'
			+ req.query.movie_id + '"';
	connection.query(tasteQuery, function(err, taste) {
		if (!err) {
			showQueryResult(req, res, movieDetail, person, taste, next);
		} else
			next(new Error(500));
	});
}

function doPersonQuery(req, res, movieDetail, next) {
	var personQuery = 'SELECT p.name as pname, i.i_job as job FROM movie m inner join involve_in i on m.movie_id = i.i_mid inner join person p on p.personId = i.i_pid WHERE m.movie_id = "'
			+ req.query.movie_id + '"';
	connection.query(personQuery, function(err, person) {
		if (!err) {
			doTasteQuery(req, res, movieDetail, person, next);
		} else
			next(new Error(500));
	});
}

function doMovieQuery(req, res, next) {
	movie_id = req.query.movie_id;
	var movieQuery = 'SELECT * FROM movie WHERE movie_id = "'
			+ req.query.movie_id + '"';
	connection.query(movieQuery, function(err, movieDetail) {
		if (!err) {
			doPersonQuery(req, res, movieDetail);
		} else
			next(new Error(500));
	});
}

function generateResponse(req, res, next) {
	if (req.query.search != null) {
		var searchMovie = 'SELECT distinct m.movie_id, m.name as mname, p.name as pname, rating, date, abstraction, poster FROM movie m inner join involve_in i on m.movie_id = i. i_mid inner join person p on p.personId = i.i_pid WHERE UPPER(m.name) LIKE UPPER('
				+ '"%'
				+ req.query.search
				+ '%")'
				+ 'OR UPPER(p.name) LIKE UPPER('
				+ '"%'
				+ req.query.search
				+ '%")';
		connection.query(searchMovie, function(err, rows, fields) {
			if (err) {
				throw err;
			} else {
				res.render('movie', {
					user : req.user,
					search_results : rows,
					movieDetail : null,
					person : null,
					reviews : null,
					taste : null,
					bing_search_results : null
				});
			}
		});
	} 
	else if(req.query.bingSearch != null){
		console.log("what?");
		Bing.web(req.query.bingSearch, function (error, ress, body) {
//          console.log(body
//          		);
          res.render('movie', {
        	  bing_search_results: body.d.results,
        	  user : req.user,
			  search_results : null,
			  movieDetail : null,
			  person : null,
			  reviews : null,
			  taste : null
          });
      }, {
          top: 10, 
          skip: 0 
      })
	}
	else {
		doMovieQuery(req, res, next);
	}	
	}


function addReview(req, res, next) {
	if (req.user == null) {
		res.redirect('/log_in');
	} else {
		var facebook_email = req.user.email;
		var findUser = ' SELECT email FROM user WHERE email = "'
				+ facebook_email + '"';
		connection
				.query(
						findUser,
						function(err, rows, fields) {
							if (err) {
								throw err;
							} else {
								console.log("1");
								var email = facebook_email;
								var time = new Date();
								var content = req.query.review;
								var rating = req.query.rating;
								var timeline = time.getFullYear() + "-"
										+ (time.getMonth() + 1) + "-"
										+ time.getDate() + " "
										+ time.getHours() + ":"
										+ time.getMinutes() + ":"
										+ time.getSeconds();
								var addReviewQuery = 'INSERT INTO review (time, review_rating, content, email, movie_id) VALUES ("'
										+ timeline
										+ '","'
										+ rating
										+ '","'
										+ content
										+ '","'
										+ email
										+ '","'
										+ movie_id + '")';
								// console.log(addReviewQuery);
								connection.query(addReviewQuery, function(err,
										review) {
									if (err) {
										throw err;
									} else {
										redirectMovies(req, res, movie_id,
												"Review already added!")
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
			redirectMovies(req, res, movie_id, "Taste already updated!")
			console.log("Taste already updated!");
		}
	})
}

function checkTasteQuery(req, res, next) {
	if (req.user == null) {
		res.redirect('/log_in');
	} else {
		var email = req.user.email;
		var checkTasteQuery = 'SELECT* FROM user_taste WHERE ut_email = "' + email
				+ '" AND ut_mid = "' + movie_id + '"';
		connection.query(checkTasteQuery, function(err, checkTaste) {
			if (!err) {
				console.log(checkTaste);
				if (checkTaste[0] == null) {
					addTasteQuery(req, res, next);
				} else {
					updateTasteQuery(req, res, next);
				}
			} else
				throw (err);
		});

	}
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
		connection.query(addTasteQuery, function(err, taste) {
			if (err) {
				throw err;
			} else {
				redirectMovies(req, res, movie_id, "Taste already added!");
				console.log("Taste already added!");
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
	// if (req.query.movie_id == undefined) {
	// console.log("lala");
	// next(new Error(404));
	// }

	// else
	generateResponse(req, res, next);
});

router.get('/addReview', function(req, res, next) {
	addReview(req, res, next);
});

router.get('/addTaste', function(req, res, next) {
	checkTasteQuery(req, res, next);
});


module.exports = router;
