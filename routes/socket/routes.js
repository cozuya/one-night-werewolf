'use strict';

import { updateGameChat, sendGameList, createGame, sendGameInfo, updateSeatedUsers, games } from './game.js';
import { checkUserStatus, handleUpdatedGameSettings, sendUserGameSettings, userList } from './account.js';
import { addNewGameChat } from './gamechat.js';
import { updateUserNightActionEvent } from './game-nightactions.js';
import { updateSelectedElimination } from './game-internals.js';

export default () => {
	io.on('connection', (socket) => {
		socket.on('disconnect', () => {
			if (socket.handshake.session.passport && Object.keys(socket.handshake.session.passport).length) {
				let userIndex;

				userList.find((user, index) => {
					if (user.userName === socket.handshake.session.passport.user) {
						userIndex = index;
					}
				});

				userList.splice(userIndex, 1);
				io.sockets.emit('userList', userList);
			}
		});

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

		socket.on('userNightActionEvent', (data) => {
			updateUserNightActionEvent(socket, data);
		});

		socket.on('updateSelectedForElimination', (data) => {
			updateSelectedElimination(data);
		});
	});
}