//Implementing the routes for dishes and dishesID
const express = require('express');//when you define a new file it become is own 
const bodyParser = require('body-parser');

const leaderRouter = express.Router();

leaderRouter.use(bodyParser.json());
// handle all the request
leaderRouter.route('/')
.all((req,res,next) => {
    res.statusCode = 200;
    res.setHeader('content-type','text/plain');
    next();
 })

 .get((req,res,next) =>{
    res.end('Will send all the leaders to you');
 })

 .post((req,res,next) =>{
    res.end('Will add the the leaders:' + req.body.name +
    'with details: ' +req.body.description);
 })

 .put((req,res,next) =>{
    res.statusCode = 403;
    res.end('PUT operation not supported on /leaders');
 })
// remember that deleting is a dangerous operation

// will makes some updates when we learn authentification
 .delete((req,res,next) =>{
    res.end('Deleting all the leaders ');
 });

 // do not allow ordinary users to make operation like deletion

 // New routes
leaderRouter.route('/:leaderId')
.get((req, res, next) => {
    res.end('Will send details of the leaderId: ' + req.params.leaderId + ' to you');
})
.post((req, res, next) => {
    res.end('POST operation not supported on /leaders/' + req.params.leaderId);
})
.put((req, res, next) => {
    res.write('Update the leaderId: ' + req.params.leaderId + '\n');
    res.end('Will update the leaderId: ' + req.body.name + ' with details ' + req.body.description);
})
.delete((req, res, next) => {
    res.end('Deleting the leaderId: ' + req.params.leaderId);
}); 

module.exports = leaderRouter;//exporting everything I need

 