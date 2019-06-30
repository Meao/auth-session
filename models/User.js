const { Schema,	model } = require('../conn');

const UserSchema = new Schema({
	"id": {
		"type": "Number"
	},
	"login": {
		"type": "String"
	},
	"password": {
		"type": "String"
	}
});

const u = model('User', UserSchema);
module.exports = { u };
