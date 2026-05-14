const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const scoreSchema = new Schema({
	name: {
    	type: String,
    	required: true,
    	unique: false
	},
	score: {
        type: Number,
        required: true,
        unique: false
	},
});

module.exports = mongoose.model("Scores", scoreSchema);
