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


/* get latest movie from mysql database */
function showSearchMovie(req, res, next) {
//	console.log("ppppp!!!!");
//	console.log(req.user);
//	if (req.user != null){
//		console.log("heng!!!!");
//        var user_id = req.user.id;
//        var user_displayName = req.user.displayName;
//        var user_email = req.user.emails[0].value;
//        console.log(user_id);
//        console.log(user_displayName);
////        check whether user has already stayed in the database
//        var query = 'SELECT * FROM user WHERE email= "' + user_email + '"';
//        console.log(query);
//        connection.query(query, function(err, results){
//            if(err){
//                next(new Error(500));
//            }
//            else if(results.length == 0){
//                // insert user into database
//            	var query_insert = "INSERT INTO user (email, user_name) VALUES ('"+user_email+"', \""+user_displayName+"\")";
//            	console.log(query_insert);
//                connection.query(query_insert, function(err, results){
//                    if(err){
//                        next(new Error(500));
//                    }
//                    	
//                })
//            }
//        });
//	}
	if (req.query.search != null) {
		var searchMovie = 'SELECT m.movie_id, m.name as mname, p.name as pname, i_job, rating, date, abstraction, poster FROM movie m inner join involve_in i on m.movie_id = i. i_mid inner join person p on p.personId = i.i_pid WHERE UPPER(m.name) LIKE UPPER('+'"%'+ req.query.search + '%")' + 'OR UPPER(p.name) LIKE UPPER('+'"%'+ req.query.search + '%")';
		connection.query(searchMovie, function(err, rows, fields) {
			if (err) {
				throw err;
			} else {
				res.render('homepage', {
					user : req.user,
					search_results : rows,
					latestMovies : null
					
				});
				// connection.end();
			}
		});
	} else {
		var latestMovie = 'SELECT movie_id, name, rating, date, abstraction, poster FROM movie ORDER BY date DESC LIMIT 5';
		connection.query(latestMovie, function(err, rows, fields) {
			if (err) {
				throw err;
			} else {
				res.render('homepage', {
					user : req.user,
					latestMovies : rows,
					search_results:null
				});
				// connection.end();
			}
		});
	}
}


/* GET home page. */

router.get('/', function(req, res, next) {
	console.log("nono");
	showSearchMovie(req, res, next);
});


router.get('/topRanked', function(req, res, next) {
	res.render('topranked');
});

router.get('/tagsMovie', function(req, res, next) {
	res.render('tagsmovie', {
		results : null
	});
});


module.exports = router;
