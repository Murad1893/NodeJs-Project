const express = require('express');
const authenticate = require('../authenticate')
const cors = require('./cors');

const Favorite = require('../models/favorites');

const favRouter = express.Router()

favRouter.route('/')
  .options(cors.corsWithOptions, (req, res, next) => { res.sendStatus(200); })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
      .populate('user')
      .populate('dishes')
      .then((fav) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(fav) // this will send as a json response
      }, err => { next(err) })
      .catch((err) => next(err))
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id }) // checking at least one favorite
      .then((fav) => {
        let dishArray = []
        for (var i in req.body) {
          if (!req.body[i]['_id']) {
            err = new Error("Error parsing input");
            err.status = 400;
            return next(err);
          }
          dishArray.push(req.body[i]['_id']) //getting id field from body
        }
        if (!fav) {
          Favorite.create({
            user: req.user._id,
            dishes: dishArray
          })
            .then((fav) => {
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.json(fav) // this will send as a json response
            }, (err) => next(err))
            .catch((err) => next(err));
        }
        else {
          // removing favorites that are already present
          dishArray = dishArray.filter(x => fav.dishes.indexOf(x) === -1)
          if (dishArray.length !== 0) {
            fav.dishes = fav.dishes.concat(dishArray)
          }
          fav.save()
            .then((fav) => {
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.json(fav) // this will send as a json response
            }, (err) => next(err))
            .catch((err) => next(err));
        }
      })
      .catch((err) => next(err))
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.deleteMany({ user: req.user._id })
      .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
      }, (err) => next(err))
      .catch((err) => next(err));
  })

favRouter.route('/:dishId')
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id }) // checking at least one favorite
      .then((fav) => {
        if (!fav) {
          Favorite.create({
            user: req.user._id,
            dishes: [req.params.dishId]
          })
            .then((fav) => {
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.json(fav) // this will send as a json response
            }, (err) => next(err))
            .catch((err) => next(err));
        }
        else {
          if (fav.dishes.indexOf(req.params.dishId) === -1) {
            fav.dishes.push(req.params.dishId)
          }
          fav.save()
            .then((fav) => {
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.json(fav) // this will send as a json response
            }, (err) => next(err))
            .catch((err) => next(err));
        }
      })
      .catch((err) => next(err))
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then((fav) => {
        if (fav.dishes.indexOf(req.params.dishId) !== -1) {
          fav.dishes.splice(fav.dishes.indexOf(req.params.dishId), 1)
          fav.save()
            .then((fav) => {
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.json(fav) // this will send as a json response
            }, (err) => next(err))
            .catch((err) => next(err));
        }
        else {
          err = new Error("Dish not found");
          err.status = 404;
          return next(err);
        }
      })
  })
module.exports = favRouter
