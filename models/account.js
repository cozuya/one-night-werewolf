'use strict';

import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

let Schema = mongoose.Schema,
	Account = new Schema({
		username: {
			type: String,
			required: true,
			unique: true
		},
		password: String
	});

Account.plugin(passportLocalMongoose);

export default mongoose.model('Account', Account);