const express = require('express');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const authenticate = require('../authenticate')

const Dishes = require('../models/dishes')

const dishRouter = express.Router()

dishRouter.route('/')
  .get((req, res, next) => {
    Dishes.find({}) // finding all the dishes
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
  .post(authenticate.verifyUser, (req, res, next) => {
    Dishes.create(req.body) // because we have the object in the req, so we will
      .then((dish) => {
        console.log('Dish Created', dish);
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(dish) // this will send as a json response
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes');
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
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
      .populate('comments.author')
      .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/' + req.params.dishId);
  })
  .put(authenticate.verifyUser, (req, res, next) => {
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
  .delete(authenticate.verifyUser, (req, res, next) => {
    Dishes.findByIdAndRemove(req.params.dishId)
      .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
      }, (err) => next(err))
      .catch((err) => next(err));
  });

// getting modifications to the comments

dishRouter.route('/:dishId/comments') // getting comments for a specific dish
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .populate('comments.author')
      .then((dish) => {
        if (dish != null) { // checking whether dish exists or not
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(dish.comments);
        }
        else {
          err = new Error('Dish ' + req.params.dishId + ' not found');
          err.status = 404;
          return next(err); // the rendering of the handling of this error will be done by the error handler in the default app.js
        }
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId) // looking for a specific dish
      .then((dish) => {
        if (dish != null) {
          // we are obtaining the user_id from the passport jwt authentication strategy
          req.body.author = req.user._id
          dish.comments.push(req.body); // pushing a new set of comments for the dish
          dish.save() // saving the updating dish here
            .then((dish) => {
              Dishes.findById(dish._id)
                .populate('comments.author')
                .then((dish) => {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.json(dish);
                })
            }, (err) => next(err));
        }
        else {
          err = new Error('Dish ' + req.params.dishId + ' not found');
          err.status = 404;
          return next(err);
        }
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes/'
      + req.params.dishId + '/comments');
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then((dish) => {
        if (dish != null) {
          // we need to traverse the whole array of comments and delete each one
          for (var i = (dish.comments.length - 1); i >= 0; i--) {
            // this id() function can help to get id of a specific document. Then we call the remove on that subdocument
            dish.comments.id(dish.comments[i]._id).remove()
          }
          dish.save() // updating the dish
            .then((dish) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(dish);
            }, (err) => next(err));
        }
        else {
          err = new Error('Dish ' + req.params.dishId + ' not found');
          err.status = 404;
          return next(err);
        }
      }, (err) => next(err))
      .catch((err) => next(err));
  });

dishRouter.route('/:dishId/comments/:commentId') // getting specific comments for a specific dish
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then((dish) => {
        // checking the dish and the comments both exists
        if (dish != null && dish.comments.id(req.params.commentId) != null) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(dish.comments.id(req.params.commentId));
        }
        else if (dish == null) { // checking that dish is null
          err = new Error('Dish ' + req.params.dishId + ' not found');
          err.status = 404;
          return next(err);
        }
        else { // last case that comment does not exist
          err = new Error('Comment ' + req.params.commentId + ' not found');
          err.status = 404;
          return next(err);
        }
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .post((req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/' + req.params.dishId
      + '/comments/' + req.params.commentId);
  })
  .put((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then((dish) => {
        if (dish != null && dish.comments.id(req.params.commentId) != null) {
          // we will allow the user to change only 2 variables.
          if (req.body.rating) {
            // only way to update a sub document within a document
            dish.comments.id(req.params.commentId).rating = req.body.rating;
          }
          if (req.body.comment) {
            dish.comments.id(req.params.commentId).comment = req.body.comment;
          }
          dish.save() //saving the dish
            .then((dish) => {
              Dishes.findById(dish._id)
                .populate('comments.author')
                .then((dish) => {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.json(dish);
                })
            }, (err) => next(err));
        }
        else if (dish == null) {
          err = new Error('Dish ' + req.params.dishId + ' not found');
          err.status = 404;
          return next(err);
        }
        else {
          err = new Error('Comment ' + req.params.commentId + ' not found');
          err.status = 404;
          return next(err);
        }
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .delete((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then((dish) => {
        if (dish != null && dish.comments.id(req.params.commentId) != null) {
          dish.comments.id(req.params.commentId).remove(); // removing the comment
          dish.save()
            .then((dish) => {
              Dishes.findById(dish._id)
                .populate('comments.author')
                .then((dish) => {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.json(dish);
                })
            }, (err) => next(err));
        }
        else if (dish == null) {
          err = new Error('Dish ' + req.params.dishId + ' not found');
          err.status = 404;
          return next(err);
        }
        else {
          err = new Error('Comment ' + req.params.commentId + ' not found');
          err.status = 404;
          return next(err);
        }
      }, (err) => next(err))
      .catch((err) => next(err));
  });

module.exports = dishRouter