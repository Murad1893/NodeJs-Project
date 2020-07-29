const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var commentSchema = new Schema({
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  author: {
    //mongoose population in use
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  dish: {
    //mongoose population in use
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dish'
  }
}, {
  timestamps: true
});

var Comments = mongoose.model('Comment', commentSchema);

module.exports = Comments;