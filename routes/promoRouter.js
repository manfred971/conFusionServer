//Implementing the routes for dishes and dishesID
const express = require('express');//when you define a new file it become is own 
const bodyParser = require('body-parser');

const promoRouter = express.Router();

promoRouter.use(bodyParser.json());
// handle all the request
promoRouter.route('/')
.all((req,res,next) => {
    res.statusCode = 200;
    res.setHeader('content-type','text/plain');
    next();
 })

 .get((req,res,next) =>{
    res.end('Will send all the promotions to you');
 })

 .post((req,res,next) =>{
    res.end('Will add the the promotions:' + req.body.name +
    'with details: ' +req.body.description);
 })

 .put((req,res,next) =>{
    res.statusCode = 403;
    res.end('PUT operation not supported on /promotions');
 })
// remember that deleting is a dangerous operation

// will makes some updates when we learn authentification
 .delete((req,res,next) =>{
    res.end('Deleting all the promotions ');
 });

 // do not allow ordinary users to make operation like deletion

 // New routes
promoRouter.route('/:promoId')
.get((req, res, next) => {
    res.end('Will send details of the promoId: ' + req.params.promoId + ' to you');
})
.post((req, res, next) => {
    res.end('POST operation not supported on /promotions/' + req.params.promoId);
})
.put((req, res, next) => {
    res.write('Update the promoId: ' + req.params.promoId + '\n');
    res.end('Will update the promoId: ' + req.body.name + ' with details ' + req.body.description);
})
.delete((req, res, next) => {
    res.end('Deleting the promoId: ' + req.params.promoId);
}); 

module.exports = promoRouter;//exporting everything I need

 