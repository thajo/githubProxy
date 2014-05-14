var express = require("express"), fs = require('fs');
var app = express();
var util = require('util');

var request = require("request");
var passport = require('passport');

var GitHubStrategy = require('passport-github').Strategy;

//// custom modules
var Proxy = require("./models/githubProxy");
var OAuthConfig = require("./models/oauth");
var Token = require("./models/tokenHandler");


//*********************************************
// The Oauthdance
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


passport.use(new GitHubStrategy({
    clientID: OAuthConfig.getClientID(),
    clientSecret: OAuthConfig.getClientSecret(),
    callbackURL: OAuthConfig.getCallback()
  },
  function(accessToken, refreshToken, profile, done) {
	  

	  
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's GitHub profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the GitHub account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));

//**********************************************


// configure Express
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  //app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});



// Route

/** routes 

  /login - should present a call to github - should return a hashed key for identification - find a algorithm
  /logout - Should kill the OAuth session
  /call - a generic caller, must have the hasehed key, all calls to the api goes through here
  / - should render the application
*/ 

app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

/*
app.get('/account', ensureAuthenticated, function(req, res){
	res.render('account', { user: req.user });
});
*/

app.get('/repos', function(req, res){
  
  // Take the token from the client and access the real accessToken
  var accessToken = Token.get(req);
  if(!accessToken) { res.writeHead(403); res.end(); return;}

  // We can now make a proxycall to the service with the right access_token
	Proxy.proxyCall(accessToken, function(data, error) {
		
    // Here we should make a http paket

		console.log(util.inspect(data));
		res.render('repos', { data: data });
		
	}, "user/repos");
});

app.get('/login', function(req, res){
  res.writeHead(302, {
    'Location': '/auth/github'
  });
  res.end();
});

// GET /auth/github
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in GitHub authentication will involve redirecting
//   the user to github.com.  After authorization, GitHubwill redirect the user
//   back to this application at /auth/github/callback
app.get('/auth/github', passport.authenticate('github'),
  function(req, res){
    // The request will be redirected to GitHub for authentication, so this
    // function will not be called.
  });

// GET /auth/github/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
	 
    // Here we are fine to go

    // We should create a temp key for the user, shove it in memory,
    // and set a expire (redis??)
    // this key should be made of ip, useragent, timestamp, and hashed
    // This key should be used for every call - node-cache npm

    // how can we read the the real access_token here?
    console.log("OK find the access_token...." +util.inspect(data));


    // Should we let it be external like register a callback/or find the referal?
    // or should we render the client?


  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}

console.log("Listning on port 8080");
app.listen(8080);