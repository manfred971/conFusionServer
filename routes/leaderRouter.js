//Implementing the routes for dishes and dishesID
const express = require('express');//when you define a new file it become is own 
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('./cors');
const authenticate = require('../authenticate');


const Leaders = require('../models/leaders');
//const { authenticate } = require('passport');

const leaderRouter = express.Router();

leaderRouter.use(bodyParser.json());

// handle all CRUD  operations

leaderRouter.route('/')

.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })


    .get(cors.cors,(req,res,next) => {
        Leaders.find({})
        .then((leaders) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leaders);
        }, (err) => next(err))
        .catch((err) => next(err));
        })

    .post(cors.corsWithOptions,authenticate.verifyUser ,authenticate.verifyAdmin, (req, res, next) => {
        Leaders.create(req.body)
        .then((lead) => {
        console.log('Leader Created', lead);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(lead);
        }, (err) => next(err))
        .catch((err) => next(err));
        })

     .put(cors.corsWithOptions, authenticate.verifyUser , authenticate.verifyAdmin,(req, res, next) => {
            res.statusCode = 403;
            res.end('PUT operation is not supported on /leaders');
            })  

         // remember that deleting is a dangerous operation
         // do not allow ordinary users to make operation like deletion
         // will made some updates when we learn authentification
     .delete(cors.corsWithOptions,authenticate.verifyUser , authenticate.verifyAdmin, (req, res, next) => {
        Leaders.remove({})
            .then((resp) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
            });


leaderRouter.route('/:leaderId')

.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })


    .get(cors.cors, (req,res,next) => {
        Leaders.findById(req.params.leaderId)
        .then((leader) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leader);
        }, (err) => next(err))
        .catch((err) => next(err));
        })

    .post(cors.corsWithOptions,authenticate.verifyUser , authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /leader/'+ req.params.leaderId);
        })

    .put(cors.corsWithOptions,authenticate.verifyUser , authenticate.verifyAdmin, (req, res, next) => {
            Leaders.findByIdAndUpdate(req.params.leaderId, {
                $set: req.body
                 }, 
                 { new: true })
              .then((leader) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(leader);
                    }, (err) => next(err))
              .catch((err) => next(err));
                    })

    .delete(cors.corsWithOptions,authenticate.verifyUser , authenticate.verifyAdmin, (req, res, next) => {
        Leaders.findByIdAndRemove(req.params.leaderId)
            .then((resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
            });
        


module.exports = leaderRouter;//exporting everything I need

 