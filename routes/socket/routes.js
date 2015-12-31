'use strict';

import { startGameCountdown, updateGameChat, sendGameList, createGame, sendGameInfo, updateSeatedUsers, games } from './game.js';
import { checkUserStatus, handleUpdatedGameSettings, sendUserGameSettings } from './account.js';
import { addNewGameChat } from './gamechat.js';

export default () => {
	io.on('connection', (socket) => {
		socket.on('getGameInfo', (uid) => {
			sendGameInfo(socket, uid);
		});
		
		socket.on('createGame', (game) => {
			createGame(socket, game);
		});

		socket.on('getGameList', () => {
			sendGameList(socket);			
		});

		socket.on('updateSeatedUsers', (data) => {
			updateSeatedUsers(socket, data);
		});

		socket.on('checkNewlyConnectedUserStatus', () => {
			checkUserStatus(socket);
		});

		socket.on('updateGameSettings', (data) => {
			handleUpdatedGameSettings(socket, data);
		});

		socket.on('getUserGameSettings', () => {
			sendUserGameSettings(socket);			
		});

		socket.on('newGameChat', (chat, uid) => {
			addNewGameChat(chat, uid);
		});

		socket.on('startGameCountdown', (uid) => {
			console.log('sgc fired');
			startGameCountdown(uid);
		});
	});
}