'use strict';

import mongoose from 'mongoose';

let { Schema } = mongoose,
	Game = new Schema({
		uid: String,
		time: String,
		date: Date,
		roles: Array,
		winningPlayers: Array,
		losingPlayers: Array,
		kobk: Boolean
	});

export default mongoose.model('Game', Game);