var express = require('express');
var Product = require('../models/product');
var router = express.Router();
var auth = require('../middlewares/auth');

var products = [];

router.get('/', auth.isAuthenticated, function(req, res) {
	res.json(products);
});

module.exports = router;