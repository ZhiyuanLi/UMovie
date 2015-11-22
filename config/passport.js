// load all the things we need
var LocalStrategy    = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
//var FacebookStrategy = require('passport-facebook').Strategy;
//var TwitterStrategy  = require('passport-twitter').Strategy;
//var GoogleStrategy   = require('passport-google-oauth').OAuth2Strategy;

// load up the user model
//var User       = require('../routes/models/user');

var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var dbconfig = require('./database');
var connection = mysql.createConnection(dbconfig.connection);
connection.query('USE ' + dbconfig.database);

//var connection = mysql.createConnection({
//	host : 'u-moive.cvgkmmzz4oct.us-east-1.rds.amazonaws.com',
//	user : 'awsuser',
//	password : 'ffffffff',
//	port : '3306',
//	database : 'U_Moive'
//});
// load the auth variables
//var configAuth = require('./auth'); // use this one for testing

module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.email);
    });

    // used to deserialize the user
    passport.deserializeUser(function(email, done) {
        connection.query("SELECT * FROM user WHERE email = ? ",[email], function(err, rows){
            done(err, rows[0]);
        });
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {
    	console.log("8");
    	connection.query("SELECT * FROM user WHERE email = ?",[email], function(err, rows){
    		console.log("9");
            if (err){
            	console.log("77");
            	return done(err);
            }
                
            if (!rows.length) {
            	console.log("10");
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
            }
            console.log("444");
            console.log(password);
            console.log(rows[0].password);
            // if the user is found but the password is wrong
            
           
//            if (!bcrypt.compareSync(password, rows[0].password)){
            if (password.localeCompare(rows[0].password) != 0){
            	console.log("555");
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
    	}
            // all is well, return successful user
            console.log("456");
            console.log(rows[0].email);
            return done(null, rows[0]);
        });

    }));
    
    
  var FACEBOOK_APP_ID = "1124470217565146";
  var FACEBOOK_APP_SECRET = "2e0342886c07c8ccd95c163894290141";
    
passport.use(new FacebookStrategy({
  clientID: FACEBOOK_APP_ID,
  clientSecret: FACEBOOK_APP_SECRET,
  callbackURL: "http://localhost:3000/auth/facebook/callback",
  profileFields : ['id', 'displayName', 'emails','photos']
},
function(accessToken, refreshToken, profile, done) {
  // asynchronous verification, for effect...
	var query = 'SELECT * FROM user WHERE email= "' + profile.emails[0].value + '"';
    console.log(query);
    connection.query(query, function(err, results){
        if(err){
        	return done(err);
        }
        else if(results.length == 0){
            // insert user into database
        	
        	// create the user
        	var newUserMysql = {
                    email: profile.emails[0].value
//                    password: bcrypt.hashSync(password, null, null)  // use the generateHash function in our user model
                };
			
		
            var query_insert = "INSERT INTO user (email) VALUES (?)";
				console.log(query_insert);
			connection.query(query_insert,[newUserMysql.email],function(err,rows){
				newUserMysql.id = rows.insertId;
			return done(null, newUserMysql);
        	
                	
            });
        } else {
        	console.log("3")
        	return done(null, results[0]);
        }
    });
}
));
    
    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {
        if (email)
//            email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching
       
        var email = email;
        var password = password;
//        console.log(user_id);
//        console.log(user_displayName);
//        check whether user has already stayed in the database
        var query = 'SELECT * FROM user WHERE email= "' + email + '"';
        console.log(query);
        connection.query(query, function(err, results){
            if(err){
            	return done(err);
            }
            else if(results.length == 0){
                // insert user into database
            	
            	// create the user
            	var newUserMysql = {
                        email: email,
                        password: password
//                        password: bcrypt.hashSync(password, null, null)  // use the generateHash function in our user model
                    };
				
			
                var query_insert = "INSERT INTO user (email, password) VALUES (?,?)";
					console.log(query_insert);
				connection.query(query_insert,[newUserMysql.email, newUserMysql.password],function(err,rows){
					newUserMysql.id = rows.insertId;
				return done(null, newUserMysql);
            	
                    	
                });
            } else {
            	console.log("3")
            	return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            }
        });
//        // asynchronous
//        process.nextTick(function() {
//            // if the user is not already logged in:
//            if (!req.user) {
//            	console.log(email);
//            	console.log(password);
//                User.findOne({ 'local.email' :  email }, function(err, user) {
//                	console.log("aaaa");
//                    // if there are any errors, return the error
//                    if (err)
//                        return done(err);
//
//                    // check to see if theres already a user with that email
//                    if (user) {
//                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
//                    } else {
//
//                        // create the user
//                        var newUser            = new User();
//
//                        newUser.local.email    = email;
//                        newUser.local.password = newUser.generateHash(password);
//
//                        newUser.save(function(err) {
//                            if (err)
//                                return done(err);
//
//                            return done(null, newUser);
//                        });
//                    }
//
//                });
//            // if the user is logged in but has no local account...
//            } else if ( !req.user.local.email ) {
//                // ...presumably they're trying to connect a local account
//                // BUT let's check if the email used to connect a local account is being used by another user
//                User.findOne({ 'local.email' :  email }, function(err, user) {
//                    if (err)
//                        return done(err);
//                    
//                    if (user) {
//                        return done(null, false, req.flash('loginMessage', 'That email is already taken.'));
//                        // Using 'loginMessage instead of signupMessage because it's used by /connect/local'
//                    } else {
//                        var user = req.user;
//                        user.local.email = email;
//                        user.local.password = user.generateHash(password);
//                        user.save(function (err) {
//                            if (err)
//                                return done(err);
//                            
//                            return done(null,user);
//                        });
//                    }
//                });
//            } else {
//                // user is logged in and already has a local account. Ignore signup. (You should log out before trying to create a new account, user!)
//                return done(null, req.user);
//            }
//
//        });

    }));

//    // =========================================================================
//    // FACEBOOK ================================================================
//    // =========================================================================
//    passport.use(new FacebookStrategy({
//
//        clientID        : configAuth.facebookAuth.clientID,
//        clientSecret    : configAuth.facebookAuth.clientSecret,
//        callbackURL     : configAuth.facebookAuth.callbackURL,
//        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
//
//    },
//    function(req, token, refreshToken, profile, done) {
//
//        // asynchronous
//        process.nextTick(function() {
//
//            // check if the user is already logged in
//            if (!req.user) {
//
//                User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
//                    if (err)
//                        return done(err);
//
//                    if (user) {
//
//                        // if there is a user id already but no token (user was linked at one point and then removed)
//                        if (!user.facebook.token) {
//                            user.facebook.token = token;
//                            user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
//                            user.facebook.email = (profile.emails[0].value || '').toLowerCase();
//
//                            user.save(function(err) {
//                                if (err)
//                                    return done(err);
//                                    
//                                return done(null, user);
//                            });
//                        }
//
//                        return done(null, user); // user found, return that user
//                    } else {
//                        // if there is no user, create them
//                        var newUser            = new User();
//
//                        newUser.facebook.id    = profile.id;
//                        newUser.facebook.token = token;
//                        newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
//                        newUser.facebook.email = (profile.emails[0].value || '').toLowerCase();
//
//                        newUser.save(function(err) {
//                            if (err)
//                                return done(err);
//                                
//                            return done(null, newUser);
//                        });
//                    }
//                });
//
//            } else {
//                // user already exists and is logged in, we have to link accounts
//                var user            = req.user; // pull the user out of the session
//
//                user.facebook.id    = profile.id;
//                user.facebook.token = token;
//                user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
//                user.facebook.email = (profile.emails[0].value || '').toLowerCase();
//
//                user.save(function(err) {
//                    if (err)
//                        return done(err);
//                        
//                    return done(null, user);
//                });
//
//            }
//        });
//
//    }));
//
//    // =========================================================================
//    // TWITTER =================================================================
//    // =========================================================================
//    passport.use(new TwitterStrategy({
//
//        consumerKey     : configAuth.twitterAuth.consumerKey,
//        consumerSecret  : configAuth.twitterAuth.consumerSecret,
//        callbackURL     : configAuth.twitterAuth.callbackURL,
//        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
//
//    },
//    function(req, token, tokenSecret, profile, done) {
//
//        // asynchronous
//        process.nextTick(function() {
//
//            // check if the user is already logged in
//            if (!req.user) {
//
//                User.findOne({ 'twitter.id' : profile.id }, function(err, user) {
//                    if (err)
//                        return done(err);
//
//                    if (user) {
//                        // if there is a user id already but no token (user was linked at one point and then removed)
//                        if (!user.twitter.token) {
//                            user.twitter.token       = token;
//                            user.twitter.username    = profile.username;
//                            user.twitter.displayName = profile.displayName;
//
//                            user.save(function(err) {
//                                if (err)
//                                    return done(err);
//                                    
//                                return done(null, user);
//                            });
//                        }
//
//                        return done(null, user); // user found, return that user
//                    } else {
//                        // if there is no user, create them
//                        var newUser                 = new User();
//
//                        newUser.twitter.id          = profile.id;
//                        newUser.twitter.token       = token;
//                        newUser.twitter.username    = profile.username;
//                        newUser.twitter.displayName = profile.displayName;
//
//                        newUser.save(function(err) {
//                            if (err)
//                                return done(err);
//                                
//                            return done(null, newUser);
//                        });
//                    }
//                });
//
//            } else {
//                // user already exists and is logged in, we have to link accounts
//                var user                 = req.user; // pull the user out of the session
//
//                user.twitter.id          = profile.id;
//                user.twitter.token       = token;
//                user.twitter.username    = profile.username;
//                user.twitter.displayName = profile.displayName;
//
//                user.save(function(err) {
//                    if (err)
//                        return done(err);
//                        
//                    return done(null, user);
//                });
//            }
//
//        });
//
//    }));
//
//    // =========================================================================
//    // GOOGLE ==================================================================
//    // =========================================================================
//    passport.use(new GoogleStrategy({
//
//        clientID        : configAuth.googleAuth.clientID,
//        clientSecret    : configAuth.googleAuth.clientSecret,
//        callbackURL     : configAuth.googleAuth.callbackURL,
//        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
//
//    },
//    function(req, token, refreshToken, profile, done) {
//
//        // asynchronous
//        process.nextTick(function() {
//
//            // check if the user is already logged in
//            if (!req.user) {
//
//                User.findOne({ 'google.id' : profile.id }, function(err, user) {
//                    if (err)
//                        return done(err);
//
//                    if (user) {
//
//                        // if there is a user id already but no token (user was linked at one point and then removed)
//                        if (!user.google.token) {
//                            user.google.token = token;
//                            user.google.name  = profile.displayName;
//                            user.google.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email
//
//                            user.save(function(err) {
//                                if (err)
//                                    return done(err);
//                                    
//                                return done(null, user);
//                            });
//                        }
//
//                        return done(null, user);
//                    } else {
//                        var newUser          = new User();
//
//                        newUser.google.id    = profile.id;
//                        newUser.google.token = token;
//                        newUser.google.name  = profile.displayName;
//                        newUser.google.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email
//
//                        newUser.save(function(err) {
//                            if (err)
//                                return done(err);
//                                
//                            return done(null, newUser);
//                        });
//                    }
//                });
//
//            } else {
//                // user already exists and is logged in, we have to link accounts
//                var user               = req.user; // pull the user out of the session
//
//                user.google.id    = profile.id;
//                user.google.token = token;
//                user.google.name  = profile.displayName;
//                user.google.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email
//
//                user.save(function(err) {
//                    if (err)
//                        return done(err);
//                        
//                    return done(null, user);
//                });
//
//            }
//
//        });
//
//    }));

};
