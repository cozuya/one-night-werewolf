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
		}).on('getGameInfo', (uid) => {
			sendGameInfo(socket, uid);
		}).on('createGame', (game) => {
			createGame(socket, game);
		}).on('getGameList', () => {
			sendGameList(socket);			
		}).on('updateSeatedUsers', (data) => {
			updateSeatedUsers(socket, data);
		}).on('checkNewlyConnectedUserStatus', () => {
			checkUserStatus(socket);
		}).on('updateGameSettings', (data) => {
			handleUpdatedGameSettings(socket, data);
		}).on('getUserGameSettings', () => {
			sendUserGameSettings(socket);			
		}).on('newGameChat', (chat, uid) => {
			addNewGameChat(chat, uid);
		}).on('userNightActionEvent', (data) => {
			updateUserNightActionEvent(socket, data);
		}).on('updateSelectedForElimination', (data) => {
			updateSelectedElimination(data);
		});
	});
}