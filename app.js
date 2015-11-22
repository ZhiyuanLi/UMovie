console.log('UMovie');

var express = require('express');
var passport = require('passport');
var util = require('util');
var FacebookStrategy = require('passport-facebook').Strategy;
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/homepage');
var movie = require('./routes/movie');
var tagsmovie = require('./routes/tagsmovieRoute');

var flash    = require('connect-flash');
var configDB = require('./config/database.js');
require('./config/passport')(passport);

var app = express();

//var routes = require('./routes/index');
//var sample = require('./routes/sampleRoute');
//var yourwork = require('./routes/yourworkRoute');
var user = require('./routes/user');
var session = require('express-session');
var methodOverride = require('method-override');

//var FACEBOOK_APP_ID = "1124470217565146";
//var FACEBOOK_APP_SECRET = "2e0342886c07c8ccd95c163894290141";
//
//passport.serializeUser(function(user, done) {
//	done(null, user);
//});
//
//
//passport.deserializeUser(function(obj, done) {
//    done(null, obj);
//});
//	
//passport.use(new FacebookStrategy({
//	        clientID: FACEBOOK_APP_ID,
//	        clientSecret: FACEBOOK_APP_SECRET,
//	        callbackURL: "http://localhost:3000/auth/facebook/callback",
//	        profileFields : ['id', 'displayName', 'emails','photos']
//	    },
//	    function(accessToken, refreshToken, profile, done) {
//	        // asynchronous verification, for effect...
//	        process.nextTick(function () {
//	
//	           // To keep the example simple, the user's Facebook profile is returned to
//	            // represent the logged-in user.  In a typical application, you would want
//	            // to associate the Facebook account with a user record in your database,
//	            // and return that user instead.
//	            return done(null, profile);
//	        });
//	    }
//	));

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended : false
}));
app.use(cookieParser());
app.use(methodOverride());
app.use(session({ secret: 'keyboard cat',
	resave: true,
    saveUninitialized: true}));

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); // use connect-flash for flash messages stored in session

app.use(express.static(path.join(__dirname, 'public')));


app.use('/', routes);
app.use('/movies',movie);

app.get('/tagsmovieResponse', tagsmovie.displayResponse);
app.get('/', function(req,res){
	console.log("yesssss");
	console.log(req.user);
	res.render('/',{ user: req.user });
});

//app.use('/', routes);
//app.get('/', function(req, res){
//	    res.render('index', { user: req.user });
//	});
app.use('/user', user);
app.get('/account', ensureAuthenticated, function(req, res){
    res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
    res.render('login', { user: req.user });
});

// GET /auth/facebook
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Facebook authentication will involve
//   redirecting the user to facebook.com.  After authorization, Facebook will
//   redirect the user back to this application at /auth/facebook/callback
app.get('/auth/facebook',
    passport.authenticate('facebook', { scope: ['email']}),
    function(req, res){
        // The request will be redirected to Facebook for authentication, so this
        // function will not be called.
    });

// GET /auth/facebook/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function(req, res) {
        res.redirect('/');
    });

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

//routes ======================================================================
require('./routes/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login')
}



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
