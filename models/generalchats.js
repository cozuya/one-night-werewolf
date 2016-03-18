'use strict';

let mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	Generalchats = new Schema({
		date: Date,
		chat: String,
		userName: String
	});

module.exports = mongoose.model('Generalchats', Generalchats);