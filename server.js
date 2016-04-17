var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var passport = require('passport');
var mongoose = require('mongoose');
var config = require('./config')

var PORT = process.env.PORT || 3000;

var apiRoutes = require('./app/routes/index');

app = express();

// Use body-parser to get POST requests for API use
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));

// Log requests to console
app.use(morgan('dev'));
app.use(passport.initialize());
app.use(express.static(path.join(__dirname, 'public')));

// Set url for API group routes
app.use(require('./app/routes'));

mongoose.connect(config.db, function(err) {
	app.listen((PORT), function() {
		console.log('Server starteed on port ' + PORT);
	});
});