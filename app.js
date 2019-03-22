const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');

mongoose.connect(config.database);
let db = mongoose.connection;

//Check connection
db.once('open',function () {
  console.log('Connected to mongodb');
});

//Checking for mongodb errors
db.on('error',function (err) {
  console.log(err);
})

//Init App
const app = express();

//get the models
let Article = require('./models/article');

app.engine('pug', require('pug').__express)
//Load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//bodyParser middleware
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

//set public folder as static
app.use(express.static(path.join(__dirname, 'public')));

//middleware for express session
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

//middleware for express messages
app.use(require('connect-flash')());
app.use(function (req,res,next) {
  res.locals.messages = require('express-messages')(req,res);
  next();
});

//middleware for express validator
app.use(expressValidator({
  errorFormatter: function (param,msg,value) {
    var namespace = param.split('.')
    , root = namespace.shift()
    , formParam = root;

    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg : msg,
      value : value
    };
  }
}));

//passport congig
require('./config/passport')(passport);
//middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*',function (req,res,next) {
  res.locals.user = req.user||null;
  next();
});

//home route
app.get('/', function (req,res) {
  Article.find({}, function (err, articles) {
    if (err) {
      console.log(err);
    } else {
      res.render('index', {
        title:'Articles',
        articles: articles
      });
    }
  });
});

//Routes
let articles = require('./routes/articles');
let users = require('./routes/users');
app.use('/articles',articles);
app.use('/users',users);

//Start Server
app.listen(3000, function () {
  console.log("Started on port 3000....");
});
