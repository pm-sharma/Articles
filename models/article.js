let mongoose = require('mongoose');

//Schema
let articleSchema = mongoose.Schema({
  title:{
    type: String,
    required: true
  },
  author:{
    type: String,
    required: true
  },
  body:{
    type: String,
    required: true
  },
  image_url:{
    type: String
  }
});

let Article = module.exports = mongoose.model('Article', articleSchema);
