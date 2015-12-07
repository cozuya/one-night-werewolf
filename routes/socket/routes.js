'use strict';

import { sendGameInfo, createGame, updateGameInfo } from './createGame.js';
import { addGame, sendGameList, games, updateGameList } from './gameList.js';

export default () => {
	io.on('connection', (socket) => {
		// Object.keys(socket.handshake.session.passport).length > 0
		// console.log(socket.handshake.session.passport);

		socket.on('addGameToList', addGame);

		socket.on('getGameList', sendGameList);

		socket.on('createGame', (game) => {
			createGame(socket, game);
		});

		socket.on('getGameInfo', (gameID) => {
			sendGameInfo(socket, gameID);
		});

		socket.on('seatUserInGame', (data) => {
			updateGameList(data);
			updateGameInfo(data);
		});
	});
}