// creating schema for dishes

const mongoose = require('mongoose');
const Schema = mongoose.Schema

require('mongoose-currency').loadType(mongoose)
const Currency = mongoose.Types.Currency // this has added a Currency data type

const commentSchema = new Schema({
  rating: {
    type: Number,
    // defining the range of value to be inserted
    min: 1,
    max: 5,
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  }
}, {
  timestamps: true
})

const dishSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  label: {
    type: String,
    default: ''
  },
  price: {
    type: Currency, // using the currency data type provided by mongoose here
    required: true,
    min: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  comments: [commentSchema] // enclosing sub documents within documents
}, { // we can allow mongoose to add timestamsp to documents
  timestamps: true // this will insert two timestamsps: created at and updated at
})

var Dishes = mongoose.model('Dish', dishSchema)

module.exports = Dishes 