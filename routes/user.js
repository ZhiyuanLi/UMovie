var express = require('express');
var router = express.Router();

var mysql      = require('mysql');
var connection = mysql.createConnection({
		host : 'u-moive.cvgkmmzz4oct.us-east-1.rds.amazonaws.com',
		user : 'awsuser',
		password : 'ffffffff',
		port : '3306',
		database : 'U_Moive'
});


function query(res) {
	connection.connect();
	connection.query('SELECT COUNT(*) from user', 
		function(err, rows, fields) {
			if (!err) {
				console.log('The solution is: ', rows);
				res.send(rows);
			} else {
				console.log('Error while performing Query.');
			}
			connection.end();
		});
}



/* GET users listing. */
router.get('/', function(req, res, next) {
//	query(res);
//	res.render('user','aaa','d');
	console.log('lala');
});

module.exports = router;