const express = require('express');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');

const Dishes = require('../models/dishes')

const dishRouter = express.Router()

dishRouter.route('/')
  .get((req, res, next) => {
    Dishes.find({}) // finding all the dishes
      .then((dishes) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(dishes) // this will send as a json response
      }, err => { next(err) })
      .catch((err) => next(err))
  })
  .post((req, res, next) => {
    Dishes.create(req.body) // because we have the object in the req, so we will
      .then((dish) => {
        console.log('Dish Created', dish);
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(dish) // this will send as a json response
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes');
  })
  .delete((req, res, next) => {
    Dishes.remove({})
      .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
      }, (err) => next(err))
      .catch((err) => next(err));
  })

dishRouter.route('/:dishId')
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId) // we can access the id using req.params.dishId
      .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .post((req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/' + req.params.dishId);
  })
  .put((req, res, next) => {
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
  .delete((req, res, next) => {
    Dishes.findByIdAndRemove(req.params.dishId)
      .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
      }, (err) => next(err))
      .catch((err) => next(err));
  });

module.exports = dishRouter