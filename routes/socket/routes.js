'use strict';

import { updateGameChat, sendGameList, sendUserList, createGame, sendGameInfo, updateSeatedUsers, games } from './game';
import { sendGeneralChats, handleNewGeneralChat, checkUserStatus, handleUpdatedGameSettings, sendUserGameSettings, userList, handleSocketDisconnect } from './account';
import { addNewGameChat } from './gamechat';
import { updateUserNightActionEvent } from './game-nightactions';
import { updateSelectedElimination } from './game-internals';

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
			handleSocketDisconnect(socket);
		});
	});
};