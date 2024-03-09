const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Dishes = require('../models/dishes');
const Favorites = require('../models/favorites');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')

  .options(cors.corsWithOptions, (req, res) => {res.sendStatus(200); })


  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
        .populate('user')
        .populate('dishes')
        .then((favorites) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorites);
        }, (err) => next(err))
        .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
        .then((favorite) => {
            if (!favorite) {
                Favorites.create({ user: req.user._id, dishes: req.body })
                    .then((favorite) => {
                        console.log('Favorite Created ', favorite);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    }, (err) => next(err))
                    .catch((err) => next(err));
            } else {
                for (let dishId of req.body) {
                    if (favorite.dishes.indexOf(dishId) === -1) {
                        favorite.dishes.push(dishId);
                    }
                }
                favorite.save()
                    .then((favorite) => {
                        console.log('Favorite Updated ', favorite);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    }, (err) => next(err))
                    .catch((err) => next(err));
            }
        })
        .catch((err) => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
  })

.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndRemove({ user: req.user._id })
        .then((resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        }, (err) => next(err))
        .catch((err) => next(err));
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
})

.get(cors.cors, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/'+req.params.dishId);
  })


.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
        .then((favorite) => {
            if (!favorite) {
                Favorites.create({ user: req.user._id, dishes: [req.params.dishId] })
                    .then((favorite) => {
                        console.log('Favorite Created ', favorite);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    }, (err) => next(err))
                    .catch((err) => next(err));
            } else {
                if (favorite.dishes.indexOf(req.params.dishId) === -1) {
                    favorite.dishes.push(req.params.dishId);
                    favorite.save()
                        .then((favorite) => {
                            console.log('Favorite Updated ', favorite);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        }, (err) => next(err))
                        .catch((err) => next(err));
                } else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }
            }
        })
        .catch((err) => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/' +req.params.dishId);
  })

.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
        .then((favorite) => {
            if (favorite && favorite.dishes.indexOf(req.params.dishId) !== -1) {
                favorite.dishes.pull(req.params.dishId);
                favorite.save()
                    .then((favorite) => {
                        console.log('Favorite Updated ', favorite);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    }, (err) => next(err))
                    .catch((err) => next(err));
            } else {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Dish ' + req.params.dishId + ' not in your favorites');
            }
        })
        .catch((err) => next(err));
})


module.exports = favoriteRouter;
