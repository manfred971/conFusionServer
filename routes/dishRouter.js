//Implementing the routes for dishes and dishesID
const express = require('express');//when you define a new file it become is own 
const bodyParser = require('body-parser');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());
// handle all the request
dishRouter.route('/')
.all((req,res,next) => {
    res.statusCode = 200;
    res.setHeader('content-type','text/plain');
    next();
 })

 .get((req,res,next) =>{
    res.end('Will send all the dishes to you');
 })

 .post((req,res,next) =>{
    res.end('Will add the the dish :' + req.body.name +
    'with details: ' +req.body.description);
 })

 .put((req,res,next) =>{
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes');
 })
// remember that deleting is a dangerous operation

// will makes some updates when we learn authentification
 .delete((req,res,next) =>{
    res.end('Deleting all the dishes ');
 });

 // do not allow ordinary users to make operation like deletion

 // New routes
dishRouter.route('/:dishId')
.get((req, res, next) => {
    res.end('Will send details of the dish: ' + req.params.dishId + ' to you');
})
.post((req, res, next) => {
    res.end('POST operation not supported on /dishes/' + req.params.dishId);
})
.put((req, res, next) => {
    res.write('Update the dish: ' + req.params.dishId + '\n');
    res.end('Will update the dish: ' + req.body.name + ' with details ' + req.body.description);
})
.delete((req, res, next) => {
    res.end('Deleting the dish: ' + req.params.dishId);
}); 

module.exports = dishRouter;//exporting everything I need

 