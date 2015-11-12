var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var spendSchema= new Schema({
	price: Number,
	stuffname: String,
	category: String,
	month: String,
	sdate: String, 
	spendtime: String,
	shop: String,
	location: {
		geo: { type: [Number], index: { type: '2dsphere', sparse: true } },
		name: String
	},	
	note: String,
	url: String,
	mood: String,
	dateAdded : { type: Date, default: Date.now },
})

module.exports = mongoose.model('Spend',spendSchema);




