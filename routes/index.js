var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('homepage');
});

router.get('/topRanked', function(req, res, next) {
	res.render('topRanked');
});

router.get('/tagsMovie', function(req, res, next) {
	res.render('tagsMovie', {results: null});
});
////
////router.get('/yourwork', function(req, res, next) {
////	res.render('yourwork', {results: null});
//});

module.exports = router;
