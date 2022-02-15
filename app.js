
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
const bcrypt = require('bcryptjs');



// Set up packages
const app = express();


// Set up encoding and directory routes
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));
app.set('view engine', 'ejs');



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


const User = new mongoose.model('User', userSchema);



//-------------------------------------------------------- //
//      Password Hashing
// --------------------------------------------------------//

// Number of salt rounds
const saltRounds = 8;


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








//-------------------------------------------------------- //
//      Post functions
// --------------------------------------------------------//

app.post('/register', function(req, res){

  // Encrypt our password using bcrypt
  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {

    // Create new DB entry
    const newUser = new User({
      email: req.body.username ,
      password: hash
    });

    // Save the new entry
    newUser.save(function(err){
      if (err){
        console.log(err);
      }else{
        res.render('secrets');
      }
    });
  });
});



app.post('/login', function(req, res){

  // Save the sign-in details
  const username = req.body.username;
  const password = req.body.password;


  // Find the user
  User.findOne({email:username}, function(err, foundUser){
    if(err){
      console.log(err);
    }
      // Check if the password matches
      else{
      if(foundUser){
        bcrypt.compare(password, foundUser.password, function(err, result) {
          if(result === true){
            res.render('secrets');
          }
        });
      }
    }
  });
});











//-------------------------------------------------------- //
//      End of file
// --------------------------------------------------------//
