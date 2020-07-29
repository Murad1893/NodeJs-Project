const express = require('express');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const authenticate = require('../authenticate')
const cors = require('./cors');

const Dishes = require('../models/dishes');
const { json } = require('express');

const dishRouter = express.Router()

dishRouter.route('/')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .get(cors.cors, (req, res, next) => {
    Dishes.find(req.query) // finding all the dishes
      // hence we are now populating the author field in the comments with the user info and then sending the compound document back
      .populate('comments.author')
      .then((dishes) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(dishes) // this will send as a json response
      }, err => { next(err) })
      .catch((err) => next(err))
  })
  // hence we will apply the authentication middleware here,
  .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.create(req.body) // because we have the object in the req, so we will
      .then((dish) => {
        console.log('Dish Created', dish);
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(dish) // this will send as a json response
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes');
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.remove({})
      .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
      }, (err) => next(err))
      .catch((err) => next(err));
  })

dishRouter.route('/:dishId')
  .options(cors.corsWithOptions, (req, res) => {
    // CORS checking
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    Dishes.findById(req.params.dishId) // we can access the id using req.params.dishId
      .populate('comments.author')
      .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/' + req.params.dishId);
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.findByIdAndUpdate(req.params.dishId, {
      $set: req.body
    }, { new: true }) // this new true will return the value as a json string
      .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.findByIdAndRemove(req.params.dishId)
      .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
      }, (err) => next(err))
      .catch((err) => next(err));
  });

module.exports = dishRouter