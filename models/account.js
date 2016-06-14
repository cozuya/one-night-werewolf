'use strict';

let mongoose = require('mongoose'),
	passportLocalMongoose = require('passport-local-mongoose'),
	Schema = mongoose.Schema,
	Account = new Schema({
		username: {
			type: String,
			required: true,
			unique: true
		},
		password: String,
		gameSettings: {
			disablePopups: Boolean,
			enableTimestamps: Boolean,
			disableRightSidebarInGame: Boolean,
			enableDarkTheme: Boolean
		},
		games: Array,
		wins: Number,
		losses: Number,
		created: Date
	});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);