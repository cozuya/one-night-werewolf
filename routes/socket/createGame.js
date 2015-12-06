'use strict';

// let Chatroom = require('../models/chatroom');

export default (socket, game) => {
	let room = game.uid;

	socket.join(room);
}