'use strict';

import createGame from './createGame.js';
import { addGame, gameList, games } from './gameList.js';

export default () => {
	io.on('connection', (socket) => {
		// Object.keys(socket.handshake.session.passport).length > 0
		// console.log(socket.handshake.session.passport);

		socket.on('addGame', addGame);

		socket.on('getGameList', gameList);

		socket.on('createGame', (game) => {
			createGame(socket, game);
		});
	});
}