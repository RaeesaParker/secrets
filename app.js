
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
const md5 = require('md5');



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
//      Create Mongoose Entries
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








//-------------------------------------------------------- //
//      Post functions
// --------------------------------------------------------//

app.post('/register', function(req, res){

  const newUser = new User({
    email: req.body.username ,
    password: md5(req.body.password)
  });

  newUser.save(function(err){
    if (err){
      console.log(err);
    }else{
      res.render('secrets');
    }
  });
});



app.post('/login', function(req, res){

  const username = req.body.username;
  const password = md5(req.body.password);

  User.findOne({email:username}, function(err, foundUser){
    if(err){
      console.log(err);
    }else{
      if(foundUser){
        if (foundUser.password === password){
          res.render('secrets');
        }
      }
    }
  });
});











//-------------------------------------------------------- //
//      End of file
// --------------------------------------------------------//
