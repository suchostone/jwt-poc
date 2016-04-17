var mongoose = require('mongoose');

// Schema defines how the user data will be stored in MongoDB
var ProductSchema = new mongoose.Schema({
	description: {
		type: String,
		required: true
	},
	price: {
		type: Number,
		required: true,
		get: getPrice,
		set: setPrice
	},
	currency: {
		type: String,
		required: true
	}
});

function getPrice(num){
	return (num/100).toFixed(2);
}

function setPrice(num){
	return num*100;
}

module.exports = mongoose.model('Product', ProductSchema);