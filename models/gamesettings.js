'use strict';

import mongoose from 'mongoose';

let Schema = mongoose.Schema,
	GameSettings = new Schema({
		username: String,
		disablePopups: Boolean
	});

export default mongoose.model('GameSettings', GameSettings);