const express = require('express');
const router = express.Router();

//get the models
//article
let Article = require('../models/article');
//user
let User = require('../models/user');

//Add article route
router.get('/add',ensureAuthenticated ,function (req,res) {
  res.render('add_article',{
    title:'Add Articles'
  });
});

//After clicking Submit
router.post('/add',function (req,res) {
  req.checkBody('title','Title is required').notEmpty();
  //req.checkBody('author','Author is required').notEmpty();
  req.checkBody('body','Body is required').notEmpty();

  //Get error
  let errors = req.validationErrors();

  if (errors) {
    res.render('add_article', {
      title : 'Add Article',
      errors : errors
    });
  } else {
    let article = new Article();
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;
    article.image_url = req.body.image_url;
    article.save(function (err) {
      if (err) {
        console.log(err);
      } else {
        req.flash('success','Article Added');
        res.redirect('/');
      }
    });
  }
});

//Edit articles
router.get('/edit/:id', ensureAuthenticated ,function (req, res) {
  Article.findById(req.params.id, function (err, article) {
    if (article.author != req.user._id) {
      req.flash('danger','Not Authorized');
      res.redirect('/');
    }
    res.render('edit_article',{
      title: 'Edit Article',
      article:article
    });
  });
});

//Update after edit
router.post('/edit/:id',function (req,res) {
  let article = {}
  article.title = req.body.title;
  article.author = req.user._id;
  article.body = req.body.body;
  article.image_url = req.body.image_url;
  let query = {_id:req.params.id}

  Article.update(query,article,function (err) {
    if (err) {
      console.log(err);
    } else {
      req.flash('success','Article Updated');
      res.redirect('/');
    }
  });
});

router.delete('/:id',function (req,res) {
  if (!req.user._id) {
    res.status(500).send();
  }
  let query = {_id:req.params.id}
  Article.findById(req.params.id, function (err,article) {
    if (article.author != req.user._id) {
      res.status(500).send();
    } else {
      Article.remove(query,function (err) {
        if (err) {
          console.log(err);
        }
        res.send('success');
      });
    }
  });
});

//Get every article
router.get('/:id', function (req, res) {
  Article.findById(req.params.id, function (err, article) {
    User.findById(article.author,function (err,user) {
      res.render('article',{
        article:article,
        author: user.name
      });
    });
  });
});

//Access control
function ensureAuthenticated(req,res,next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash('danger','Please login to continue');
    res.redirect('/users/login');
  }
}

module.exports = router;
