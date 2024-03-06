    //Implementing the routes for dishes and dishesID
    const express = require('express');//when you define a new file it become is own 
    const bodyParser = require('body-parser');
    const mongoose = require('mongoose');
    
    const  authenticate = require('../authenticate');
    const cors = require('./cors');

    const Dishes = require('../models/dishes');

    const dishRouter = express.Router();

    dishRouter.use(bodyParser.json());
    // handle all the CRUD operation 

    dishRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })

     .get(cors.cors, (req,res,next) => {
        Dishes.find({})
        .populate('comments.author')
        .then((dishes) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dishes);
        }, (err) => next(err))
        .catch((err) => next(err));
        })

     .post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin, (req, res, next) => {
        Dishes.create(req.body)
        .then((dish) => {
        console.log('Dish Created ', dish);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
        }, (err) => next(err))
        .catch((err) => next(err));
        })

     .put( cors.corsWithOptions,authenticate.verifyUser ,authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /dishes');
        })

        .delete(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
            Dishes.remove({})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
        });

 dishRouter.route('/:dishId')

 .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })//Cross origin ressoure sharing
        
   .get(cors.cors , (req,res,next) => {
        Dishes.findById(req.params.dishId)
        .populate('comments.author')
        .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
        }, (err) => next(err))
        .catch((err) => next(err));
        })

    .post(cors.corsWithOptions, authenticate.verifyUser ,authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /dishes/'+ req.params.dishId);
        })

    .put( cors.corsWithOptions, authenticate.verifyUser , authenticate.verifyAdmin,(req, res, next) => {
            Dishes.findByIdAndUpdate(req.params.dishId, {
                $set: req.body
                }, { new: true })
                .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
                }, (err) => next(err))
                .catch((err) => next(err));
                })
     .delete(cors.corsWithOptions, authenticate.verifyUser , authenticate.verifyAdmin, (req, res, next) => {
                Dishes.findByIdAndRemove(req.params.dishId)
                .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
                }, (err) => next(err))
                .catch((err) => next(err));
                });


 dishRouter.route('/:dishId/comments')

 .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })

  .get(cors.cors , (req,res,next) => {
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish) => {
    if (dish != null) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(dish.comments);
    }
    else {
    err = new Error('Dish ' + req.params.dishId + ' not found');
    err.status = 404;
    return next(err);
    }
    }, (err) => next(err))
    .catch((err) => next(err));
    })

.post(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish != null) {
            req.body.author = req.user._id;
            dish.comments.push(req.body);
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
        else {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.put( cors.corsWithOptions, authenticate.verifyUser , (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes/'
    + req.params.dishId + '/comments');
    })


.delete(cors.corsWithOptions, authenticate.verifyUser , authenticate.verifyAdmin, (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
    if (dish != null) {
    for (var i = (dish.comments.length -1); i >= 0; i--) {
    dish.comments.id(dish.comments[i]._id).remove();
    }
    dish.save()
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


dishRouter.route('/:dishId/comments/:commentId')

.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })

.get(cors.cors, (req, res, next) => {
    console.log('dishId:', req.params.dishId);
    console.log('commentId:', req.params.commentId);

    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish) => {
        if (dish != null && dish.comments.id(req.params.commentId) != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish.comments.id(req.params.commentId));
        } else if (dish == null) {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        } else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);
        }
    })
    .catch((err) => {
        console.error('Error in GET /:dishId/comments/:commentId:', err);
        next(err);
    });
})


.post(cors.corsWithOptions,authenticate.verifyUser , (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/'+ req.params.dishId
    + '/comments/' + req.params.commentId);
    })

    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        console.log('User:', req.user); // Ajout du log pour vérifier l'utilisateur extrait du jeton
        console.log('Dish ID:', req.params.dishId); // Ajout du log pour vérifier l'ID du plat
        console.log('Comment ID:', req.params.commentId); // Ajout du log pour vérifier l'ID du commentaire
    
        Dishes.findById(req.params.dishId).then((dish) => {
            if (dish != null && dish.comments.id(req.params.commentId)) {
                if (dish.comments.id(req.params.commentId).author.toString() != req.user._id.toString()) {
                    err = new Error('You are not authorized to edit this comment');
                    err.status = 403;
                    return next(err);
                }
                if (req.body.rating) {
                    dish.comments.id(req.params.commentId).rating = req.body.rating;
                }
    
                if (req.body.comment) {
                    dish.comments.id(req.params.commentId).comment = req.body.comment;
                }
                dish.save().then((dish) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(dish);
                }, (err) => next(err)).catch((err) => next(err));
            } else if (dish == null) {
                err = new Error('Dish ' + req.params.dishId + ' not found');
                err.status = 404;
                return next(err);
            } else {
                err = new Error('Comment ' + req.params.commentId + ' not found');
                err.status = 404;
                return next(err);
            }
        }, (err) => next(err)).catch((err) => next(err));
    })
    
    
    .delete(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId)
        .then((dish) => {
            if (dish != null && dish.comments.id(req.params.commentId) != null) {
                const comment = dish.comments.id(req.params.commentId);
    
                // Vérifier si l'utilisateur actuel est l'auteur du commentaire
                if (!comment.author.equals(req.user._id)) {
                    const err = new Error('You are not authorized to delete this comment!');
                    err.status = 403; // Forbidden
                    return next(err);
                }
    
                // Supprimer le commentaire
                comment.remove();
                
                // Sauvegarder le plat mis à jour
                dish.save()
                .then((dish) => {
                    Dishes.findById(dish._id)
                    .populate('comments.author')
                    .then((dish) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(dish);
                    });
                })
                .catch((err) => next(err));
            } else {
                // Gérer le cas où le plat ou le commentaire n'est pas trouvé
                const err = new Error('Dish or comment not found');
                err.status = 404;
                return next(err);
            }
        })
        .catch((err) => next(err));
    });
    
    

    module.exports = dishRouter;//exporting everything I need

    