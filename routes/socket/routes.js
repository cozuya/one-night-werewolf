'use strict';

// let Chatroom = require('../models/chatroom');

import createGame from './createGame.js';
import { addGame, gameList, games } from './gameList.js';

export default () => {
	io.on('connection', (socket) => {
		// Object.keys(socket.handshake.session.passport).length > 0
		// console.log(socket.handshake.session.passport);

		socket.on('addGame', addGame);

		socket.on('getGameList', gameList);

		// socket.on('createGame', createGame);

		socket.on('createGame', (game) => {
			socket.join(game.uid)
		});

	});
}