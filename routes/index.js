var express = require('express');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var User = require('../models/user');
var config = require('../config');
var auth = require('../middlewares/auth');
var router = express.Router();

router.use('/api/products', require('./products'));

router.get('/', function(req, res) {
	res.send('Hello this is Sucho');
});


// Protect dashboard route with JWT
router.get('/dashboard', auth.isAuthenticated, function(req, res) {
	res.send('It worked! User id is: ' + req.user._id + '.');
});

router.post('/api/register', function(req, res) {
	console.log(req.body);
	if (!req.body.email || !req.body.password) {
		res.json({
			success: false,
			message: 'Please enter email and password.'
		});
	} else {
		var newUser = new User({
			email: req.body.email,
			password: req.body.password
		});

		// Attempt to save the user
		newUser.save(function(err) {
			if (err) {
				return res.json({
					success: false,
					message: 'That email address already exists.'
				});
			}
			res.json({
				success: true,
				message: 'Successfully created new user.'
			});
		});
	}
});

// Authenticate the user and get a JSON Web Token to include in the header of future requests.
router.post('/api/authenticate', function(req, res, next) {
	passport.authenticate('local-login', function(err, user, info) {
		if (err) {
			return next(err)
		}
		if (!user) {
			return res.json(401, {
				error: 'message'
			});
		}

		var token = jwt.sign(user, config.secret, {
			expiresIn: 10080 // in seconds
		});
		res.json({
			success: true,
			token: 'JWT ' + token
		});
	})(req, res, next);
});

router.get('/auth/facebook',
	passport.authenticate('facebook', {
		session: false,
		scope: []
	})
);

router.get('/auth/facebook/callback', passport.authenticate('facebook', {
	session: false,
	failureRedirect: '/'
}), function(req, res) {
	console.log('Generating jwt token for ' + req.user.facebook.id);
	var token = jwt.sign(req.user, config.secret, {
		expiresIn: 10080 // in seconds
	});
	res.json({
		success: true,
		token: 'JWT ' + token
	});

});

module.exports = router;