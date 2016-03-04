'use strict';

import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

let { Schema } = mongoose,
	Account = new Schema({
		username: {
			type: String,
			required: true,
			unique: true
		},
		password: String,
		gameSettings: {
			disablePopups: Boolean,
			enableTimestamps: Boolean
		},
		games: Array,
		wins: Number,
		losses: Number,
		created: Date
	});

Account.plugin(passportLocalMongoose);

export default mongoose.model('Account', Account);