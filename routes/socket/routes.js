'use strict';

import { deleteGame, updateGameChat, sendGameList, sendUserList, createGame, sendGameInfo, updateSeatedUsers, games } from './game.js';
import { sendGeneralChats, handleNewGeneralChat, checkUserStatus, handleUpdatedGameSettings, sendUserGameSettings, userList } from './account.js';
import { addNewGameChat } from './gamechat.js';
import { updateUserNightActionEvent } from './game-nightactions.js';
import { updateSelectedElimination } from './game-internals.js';
import _ from 'lodash';

export default () => {
	io.on('connection', (socket) => {
		socket.on('getGameInfo', (uid) => {
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
		}).on('getUserList', () => {
			sendUserList(socket);
		}).on('updateSelectedForElimination', (data) => {
			updateSelectedElimination(data);
		}).on('newGeneralChat', (data) => {
			handleNewGeneralChat(data);
		}).on('getGeneralChats', () => {
			sendGeneralChats(socket);
		}).on('disconnect', () => {
			let { passport } = socket.handshake.session;

			if (passport && Object.keys(passport).length) {
				let userIndex = userList.findIndex((user) => {
						return user.user === passport.user;
					}),
					game = games.find((game) => {
						return Object.keys(game.seated).find((seatName) => {
							return game.seated[seatName].userName === passport.user;
						});
					});

				userList.splice(userIndex, 1);

				if (game) {
					if (!game.inProgress) {
						let seatedKeys = Object.keys(game.seated),
							userSeatName = seatedKeys.find((seatName) => {
								return game.seated[seatName].userName === passport.user;
							});

						if (seatedKeys.length === 1) {
							deleteGame(game);
						} else {
							delete game.seated[userSeatName];
							io.sockets.in(game.uid).emit('gameUpdate', game);
						}
					}

					io.sockets.emit('gameList', games);					
				}

				io.sockets.emit('userList', {list: userList, totalSockets: Object.keys(io.sockets.sockets).length});
			}
		});
	});
};