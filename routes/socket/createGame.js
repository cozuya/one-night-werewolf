'use strict';

// let Chatroom = require('../models/chatroom');

export default (socket, game) => {
	console.log(socket);
	console.log(game);

	socket.join(game.uid);
}