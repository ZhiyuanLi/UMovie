var express = require('express');
var router = express.Router();

var movie_id;
var mysql = require('mysql');
var connection = mysql.createConnection({
	host : 'u-moive.cvgkmmzz4oct.us-east-1.rds.amazonaws.com',
	user : 'awsuser',
	password : 'ffffffff',
	port : '3306',
	database : 'U_Moive'
});

// router.post('/movies?:movie_id', function (req, res, next) {
// if (req.params.movie_id == undefined) {
// console.log(" undefined");
// next(new Error(404));
// }
// else {
// //console.log("add review");
// generateResponse(req, res, next);
// }
// });

function addTaste(req, res, next) {
	if (req.user == null) {
		res.render("login");
		// do log in
	} else {
		var facebook_email = req.user.emails[0].value;
		var userlikes = req.query.likes;
		var userdislikes = req.query.dislikes;
		// var findTaste = 'SELECT likes, dislikes FROM user_taste WHERE ut_mid
		// = "' + req.query.movie_id + '"' ;
		// connection.query(findTaste, function(err, rows, fields) {
		// if (err) {
		// throw err;
		// } else {
		var email = facebook_email;
		var addTasteQuery = 'INSERT INTO user_taste (ut_email,ut_mid,likes,dislikes) VALUES ("'
				+ email
				+ '","'
				+ movie_id
				+ '","'
				+ userlikes
				+ '","'
				+ userdislikes + '")';
		console.log(addTasteQuery) ;
		console.log("check taste") ;
		connection.query(addTasteQuery, function(err, review) {
			if (err) {
				throw err;
			} else {
				redirectMovies(req, res, movie_id, "Already added")
				// res.render('/movies',{movie_id:movie_id});
				console.log("Already added");
			}
		});
		// }
		// });
	}
}

function redirectMovies(req, res, movie_id, msg) {
	req.session.msg = msg;
	res.writeHead(302, {
		'Location' : '/movies?movie_id=' + movie_id
	});
	res.end();
}

function addReview(req, res, next) {
	console.log("2");
	if (req.user == null) {
		res.render('login');
		// do log in
	} else {
		console.log("check");
		console.log(req);
		var facebook_email = req.user.emails[0].value;
		// var facebook_email = 'diwu2@seas.upenn.edu';
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
//								var movie_id = req.query.movie_id;
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
								console.log(addReviewQuery);
								connection.query(addReviewQuery, function(err,
										review) {
									if (err) {
										throw err;
									} else {
										redirectMovies(req, res, movie_id,
												"Already added")
										// res.render('/movies',{movie_id:movie_id});
										console.log("Already added");
									}
								});
							}
						});
	}
}

function doReviewQuery(req, res, movieDetail, person, taste, next) {
	var reviewQuery = 'select * from review where movie_id = "'
			+ req.query.movie_id + '"';
	connection.query(reviewQuery, function(err, reviews) {
		if (err) {
			throw err;
			console.log("err");
		} else {
			console.log(reviewQuery);
			console.log("4");
			console.log(req.user);
			res.render('movie.ejs', {
				user : req.user,
				person : person,
				search_results : null,
				movieDetail : movieDetail,
				reviews : reviews,
				taste : taste
			});
			console.log("Send movie info back");
		}

	});
}

function doTasteQuery(req, res, movieDetail, person, next) {
	var tasteQuery = 'SELECT sum(likes) as movie_likes, sum(dislikes) as movie_dislikes FROM user_taste WHERE ut_mid = "'
			+ req.query.movie_id + '"';
	+req.query.movie_id + '"';
	console.log(tasteQuery);
	connection.query(tasteQuery, function(err, taste) {
		if (!err) {
			console.log("taste!!");

			console.log(taste);
			doReviewQuery(req, res, movieDetail, person, taste, next);

		} else
			next(new Error(500));
	});
}

function doPersonQuery(req, res, movieDetail, next) {
	var personQuery = 'SELECT p.name as pname, i.i_job as job FROM movie m inner join involve_in i on m.movie_id = i.i_mid inner join person p on p.personId = i.i_pid WHERE m.movie_id = "'
			+ req.query.movie_id + '"';
	connection.query(personQuery, function(err, person) {
		if (!err) {
			console.log("person!!");

			doTasteQuery(req, res, movieDetail, person, next);

		} else
			next(new Error(500));
	});
}

function doMovieQuery(req, res, next) {
	
	console.log(req.query.movie_id);
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

/* get latest movie from mysql database */
function generateResponse(req, res, next) {
	if (req.query.search != null) {
		var searchMovie = 'SELECT m.movie_id, m.name as mname, p.name as pname, i_job, rating, date, abstraction, poster FROM movie m inner join involve_in i on m.movie_id = i. i_mid inner join person p on p.personId = i.i_pid WHERE UPPER(m.name) LIKE UPPER('
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
					taste : null
				});
				// connection.end();
			}
		});
	} else {
		doMovieQuery(req, res, next);
	}
}

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
	addTaste(req, res, next);
});

module.exports = router;