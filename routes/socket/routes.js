'use strict';

import { startGameCountdown, updateGameChat, sendGameList, createGame, sendGameInfo, updateSeatedUsers, games } from './game.js';
import { checkUserStatus, handleUpdatedGameSettings, sendUserGameSettings } from './account.js';

export default () => {
	io.on('connection', (socket) => {
		socket.on('getGameInfo', (uid) => {
			console.log('ggi');
			sendGameInfo(socket, uid);
		});
		
		socket.on('createGame', (game) => {
			console.log('cg');
			createGame(socket, game);
		});

		socket.on('getGameList', () => {
			sendGameList(socket);			
		});

		socket.on('updateSeatedUsers', (data) => {
			console.log('usu');
			updateSeatedUsers(socket, data);
		});

		socket.on('checkNewlyConnectedUserStatus', (data) => {
			console.log('cncus');
			checkUserStatus(socket, data, games);
		});

		socket.on('updateGameSettings', (data) => {
			console.log('ugs');
			handleUpdatedGameSettings(socket, data);
		});

		socket.on('getUserGameSettings', () => {
			console.log('gugs');
			sendUserGameSettings(socket);			
		});

		socket.on('newGameChat', (chat, uid) => {
			console.log(chat);
			updateGameChat(socket, chat, uid);
		});

		socket.on('startGameCountdown', (uid) => {
			console.log('sgc');
			startGameCountdown(uid);
		});
	});
}