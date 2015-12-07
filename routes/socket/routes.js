'use strict';

import { sendGameInfo, createGame } from './createGame.js';
import { addGame, gameList, games } from './gameList.js';

export default () => {
	io.on('connection', (socket) => {
		// Object.keys(socket.handshake.session.passport).length > 0
		// console.log(socket.handshake.session.passport);

		socket.on('addGameToList', addGame);

		socket.on('getGameList', gameList);

		socket.on('createGame', (game) => {
			createGame(socket, game);
		});

		socket.on('getGameInfo', (gameID) => {
			sendGameInfo(socket, gameID);
		});

		socket.on('seatUserInGame', (gameID) => {
			// updateGameList(socket, gameID); // todo inside of gameList.js
			// updateGameInfo(socket, gameID); // todo inside of createGame.js
		});
	});
}