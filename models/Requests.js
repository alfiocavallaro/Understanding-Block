var mongoose = require('mongoose');

var RequestSchema = new mongoose.Schema({
	repeat: String,
	trigger: String,
	action: { type: String, required: true },
	elseAction: String,
	response: String,
	timestamp: String
});

mongoose.model('Request', RequestSchema);



