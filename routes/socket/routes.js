'use strict';

import { startGameCountdown, updateGameChat, sendGameList, createGame, sendGameInfo, updateSeatedUsers, games } from './game.js';
import { checkUserStatus, handleUpdatedGameSettings, sendUserGameSettings } from './account.js';

export default () => {
	io.on('connection', (socket) => {
		socket.on('getGameInfo', (uid) => {
			sendGameInfo(socket, uid);
		});
		
		socket.on('createGame', (game) => {
			createGame(socket, game);
		});

		socket.on('getGameList', sendGameList);

		socket.on('updateSeatedUsers', (data) => {
			updateSeatedUsers(socket, data);
		});

		socket.on('checkNewlyConnectedUserStatus', (data) => {
			checkUserStatus(socket, data, games);
		});

		socket.on('updateGameSettings', (data) => {
			handleUpdatedGameSettings(socket, data);
		});

		socket.on('getUserGameSettings', () => {
			sendUserGameSettings(socket);			
		});

		socket.on('newGameChat', (chat, uid) => {
			updateGameChat(socket, chat, uid);
		});

		socket.on('startGameCountdown', (uid) => {
			startGameCountdown(uid);
		});
	});
}