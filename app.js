
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
  password: String
});


// Plugin passport to hash and salt passwords
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model('User', userSchema);


// Passport local configuration
passport.use(User.createStrategy());

// Use passport to serialize and deserialize User
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



//-------------------------------------------------------- //
//      Password Hashing
// --------------------------------------------------------//




//-------------------------------------------------------- //
//      Get the root and generate the date
// --------------------------------------------------------//

app.get('/', function(req, res){
  res.render('home');
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
