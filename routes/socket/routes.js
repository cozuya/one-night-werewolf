'use strict';

let { handleUpdatedTruncateGame, handleUpdatedReportGame, handleAddNewGame, handleAddNewGameChat, handleNewGeneralChat, 	handleUpdatedGameSettings, handleSocketDisconnect, checkUserStatus } = require('./user-events'),
	{ sendGameInfo, sendUserGameSettings, sendGameList, sendGeneralChats, sendUserList } = require('./user-requests'),
	{ updateSeatedUsers, updateSelectedElimination, updateUserNightActionEvent } = require('./game-core');

module.exports = () => {
	io.on('connection', (socket) => {
		checkUserStatus(socket);
	
		socket

		// user-events

		.on('updateTruncateGame', (data) => {
			handleUpdatedTruncateGame(data);
		}).on('addNewGameChat', (chat, uid) => {
			handleAddNewGameChat(chat, uid);
		}).on('updateReportGame', (data) => {
			handleUpdatedReportGame(socket, data);			
		}).on('addNewGame', (data) => {
			handleAddNewGame(socket, data);
		}).on('updateGameSettings', (data) => {
			handleUpdatedGameSettings(socket, data);
		}).on('addNewGeneralChat', (data) => {
			handleNewGeneralChat(data);
		}).on('disconnect', () => {
			handleSocketDisconnect(socket);
		})

		// user-requests

		.on('getGameList', () => {
			sendGameList(socket);
		}).on('getGameInfo', (uid) => {
			sendGameInfo(socket, uid);
		}).on('getUserList', () => {
			sendUserList(socket);
		}).on('getGeneralChats', () => {
			sendGeneralChats(socket);
		}).on('getUserGameSettings', (data) => {
			sendUserGameSettings(socket, data);
		})

		// game-core

		.on('updateSeatedUsers', (data) => {
			updateSeatedUsers(socket, data);
		}).on('updateSelectedForElimination', (data) => {
			updateSelectedElimination(data);
		}).on('userNightActionEvent', (data) => {
			updateUserNightActionEvent(socket, data);
		});
	});
};