'use strict';

import mongoose from 'mongoose';

let Schema = mongoose.Schema,
	GameSettings = new Schema({
		username: String,
		gameSettings: {
			disablePopups: Boolean,
			enableTimestamps: Boolean
		}
	});

export default mongoose.model('GameSettings', GameSettings);