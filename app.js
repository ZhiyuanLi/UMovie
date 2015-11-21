var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var movie = require('./routes/homepageRoute');
var tagsmovie = require('./routes/tagsmovieRoute');

//var homepage = require('./routes/homepageRoute');

var app = express();

console.log('Project UMovie');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended : false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
//app.use('/homepage',movie);

// if you get a request for the sampleResponse page, call the 'displayResponse'
// function present in the 'sampleRoute' route
app.get('/tagsmovieResponse', tagsmovie.displayResponse);
// if you qet a request for the yourworkResponse page, call the
// 'displayResponse' function present in the 'yourworkRoute' route
//app.get('/yourworkResponse', yourwork.displayResponse);
//if you qet a request for the homepageResponse page, call the
//'displayResponse' function present in the 'homepageRoute' route
console.log("4");
app.get('/homepage', function(req,res){
	console.log("3");
	console.log(res.query.movie_id);
	res.render('/homepage');
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message : err.message,
			error : err
		});
	});
}

// production error handler
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message : err.message,
		error : {}
	});
});

module.exports = app;
