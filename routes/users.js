var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
var cors = require('./cors');
var authenticate = require('../authenticate');

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */

router.get('/', cors.corsWithOptions , authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  User.find({}, (err, users) => {
    if (err) {
      return next(err);
    } else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(users);
    }
  });
});


router.post('/signup', cors.corsWithOptions , (req, res, next) => {
  User.register(new User({username: req.body.username}), 
    req.body.password, (err, user) => {
    if(err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    }
    else {
      if (req.body.firstname)
        user.firstname = req.body.firstname;
      if (req.body.lastname)
        user.lastname = req.body.lastname;
      user.save((err, user) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({err: err});
          return ;
        }
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({success: true, status: 'Registration Successful!'});
        });
      });
    }
  });
});

 

/*router.post('/login', passport.authenticate('local'), (req, res) => {
  var token = authenticate.getToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, token: token, status: 'You are successfully logged in!'});
});*/

//les deux routes suivant font la meme chose sauf que le premier genere des erreurs 
//la deuxieme approche est plus fine 

// Middleware d'authentification personnalisé
const authenticateUser = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('Passport error:', err);
      return next(err);
    }
    if (!user) {
      console.log('Authentication failed:', info.message);
      return res.status(401).json({ success: false, message: 'Authentication failed.' });
    }

    // L'authentification a réussi, ajouter l'utilisateur à la requête
    req.user = user;
    return next();
  })(req, res, next);
};

// Route avec le middleware d'authentification avant le middleware principal
router.post('/login',cors.corsWithOptions ,  authenticateUser, (req, res) => {
  var token = authenticate.getToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, token: token, status: 'You are successfully logged in!'});
});

/*router.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  }
  else {
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});
*/

// Simulated token blacklist (you should use a persistent storage in production)
const tokenBlacklist = new Set();

// Middleware to check authentication using JWT
const authenticateToken = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) { return next(err); }
    if (!user) { return res.sendStatus(401); } // Unauthorized

    // Check if the token is blacklisted
    if (tokenBlacklist.has(req.headers.authorization.split(' ')[1])) {
      return res.status(401).json({ message: 'Token is blacklisted' });
    }

    req.user = user;
    next();
  })(req, res, next);
};

// Logout route with authentication using JWT
router.get('/logout', cors.corsWithOptions , authenticateToken, (req, res) => {
  // Blacklist the token (add it to the set)
  tokenBlacklist.add(req.headers.authorization.split(' ')[1]);

  // Optionally, you can also add an expiration date to the token when issuing it
  // to implement a form of token revocation (short-lived tokens).

  // Send a response indicating successful logout.
  res.json({ message: 'Logout successful' });
  res.redirect('/');
});

module.exports = router;
