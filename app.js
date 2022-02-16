
// -------------------------------------------------------- //
//      Packages and Setup
// -------------------------------------------------------- //

require('dotenv').config()


// Include node.js files
const express = require('express');
const bodyParser = require('body-parser');
const lodash = require('lodash');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const FacebookStrategy = require('passport-facebook');




// Set up packages
const app = express();


// Set up encoding and directory routes
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));
app.set('view engine', 'ejs');


// Set the cookies and passport by using a session
app.use(session({
  secret: 'Our little secret',
  resave: false,
  saveUninitialized: false,
  //cookie: { secure: true }
}));

// Initialise passport and the session
app.use(passport.initialize());
app.use(passport.session());



// Set up port
const port = 3000;



// Listen to the server
app.listen(port, function(){
  console.log('Listening on port ' + port);
});


// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/secretsDB', {useNewUrlParser: true});




// ------------------------------------------------------ //
// MongoDB Models and Schemas
// ------------------------------------------------------ //

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleID: String,
  facebookID : String
});


// Plugin passport to hash and salt passwords and for the findOrCreate Google User
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


const User = new mongoose.model('User', userSchema);


// Passport local configuration
passport.use(User.createStrategy());


// Used to serialize the user for the session
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// Used to deserialize the user
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});



//-------------------------------------------------------- //
//      Google Strategies
// --------------------------------------------------------//

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/secrets',
    userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleID: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));



//-------------------------------------------------------- //
//      Facebook Strategies
// --------------------------------------------------------//

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: 'http://localhost:3000/auth/facebook/secrets'
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ facebookID: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));



//-------------------------------------------------------- //
//      Get the root and generate the date
// --------------------------------------------------------//

app.get('/', function(req, res){
  res.render('home');
});

// Authenticate with Google
app.get('/auth/google', passport.authenticate('google', { scope: ['profile']})
);

app.get('/auth/google/secrets',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect to secrets
    res.redirect('/secrets');
  });


  // Authenticate with Facebook
  app.get('/auth/facebook', passport.authenticate('facebook')
  );

  app.get('/auth/facebook/secrets',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect to secrets
    res.redirect('/secrets');
  });



app.get('/register', function(req, res){
  res.render('register');
});



app.get('/login', function(req, res){
  res.render('login');
});



app.get('/secrets', function(req, res){
  // Check if user is authenticated
  if (req.isAuthenticated()){
    res.render('secrets');
  }else {
    res.redirect('/login');
  }
});


// Deauthenticate User
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});



//-------------------------------------------------------- //
//      Post functions
// --------------------------------------------------------//

app.post('/register', function(req, res){

  // Register the user
  User.register({username: req.body.username}, req.body.password, function(err, user){
    if (err){
      console.log(err);
      res.render('/register');
    }else{
      passport.authenticate('local')(req, res, function(){
        res.redirect('/secrets');
      })
    }
  });
});



app.post('/login', function(req, res){

  const user = new User({
    username:req.body.username,
    password:req.body.password
  });

  req.login(user, function(err) {
    if (err){
      console.log(err);
    }else{
      passport.authenticate('local')(req, res, function(){
        res.redirect('/secrets');
      })
    }
  });
});











//-------------------------------------------------------- //
//      End of file
// --------------------------------------------------------//
