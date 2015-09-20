'use strict';

let mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	Chatroom = new Schema({
		chats: Array,
		createdBy: String,
		createdAt: Date,
		closedAt: Date
	});

module.exports = mongoose.model('Chatroom', Chatroom);