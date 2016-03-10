'use strict';

import { handleUpdatedTruncateGame, sendGameList, sendUserList, createGame, sendGameInfo, updateSeatedUsers } from './game';
import { sendGeneralChats, handleNewGeneralChat, checkUserStatus, handleUpdatedGameSettings, sendUserGameSettings, handleSocketDisconnect } from './account';
import { addNewGameChat } from './gamechat';
import { updateUserNightActionEvent } from './game-nightactions';
import { updateSelectedElimination } from './game-internals';

export default () => {
	io.on('connection', (socket) => {
		checkUserStatus(socket);

		socket.on('getGameInfo', (uid) => {
			sendGameInfo(socket, uid);
		}).on('updateTruncateGame', (data) => {
			handleUpdatedTruncateGame(data);
		}).on('createGame', (game) => {
			createGame(socket, game);
		}).on('getGameList', () => {
			sendGameList(socket);			
		}).on('updateSeatedUsers', (data) => {
			updateSeatedUsers(socket, data);
		}).on('updateGameSettings', (data) => {
			handleUpdatedGameSettings(socket, data);
		}).on('getUserGameSettings', (data) => {
			sendUserGameSettings(socket, data);			
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