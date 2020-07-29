const express = require('express');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const authenticate = require('../authenticate')
const Promotions = require('../models/promotions')
const cors = require('./cors')

const promoRouter = express.Router()

promoRouter.route('/')
  .options(cors.corsWithOptions, (req, res) => {
    // CORS checking
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    Promotions.find(req.query) // this is done so as to incorporate featured = true query from client side
      .then((promotions) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(promotions) // this will send as a json response
      }, err => { next(err) })
      .catch((err) => next(err))
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotions.create(req.body) // because we have the object in the req, so we will
      .then((promotion) => {
        console.log('Promotion Created', promotion);
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(promotion) // this will send as a json response
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /promotions');
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotions.remove({})
      .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
      }, (err) => next(err))
      .catch((err) => next(err));
  })

promoRouter.route('/:promoId')
  .options(cors.corsWithOptions, (req, res) => {
    // CORS checking
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    Promotions.findById(req.params.promoId) // we can access the id using req.params.promoId
      .then((promotion) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotion);
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /promotions/' + req.params.promoId);
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotions.findByIdAndUpdate(req.params.promoId, {
      $set: req.body
    }, { new: true }) // this new true will return the value as a json string
      .then((promotion) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotion);
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotions.findByIdAndRemove(req.params.promoId)
      .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
      }, (err) => next(err))
      .catch((err) => next(err));
  });

module.exports = promoRouter