'use strict';

let { handleUpdatedTruncateGame, handleUpdatedReportGame, handleAddNewGame, handleAddNewGameChat, sendGameInfo, handleNewGeneralChat, 	handleUpdatedGameSettings, handleSocketDisconnect, checkUserStatus } = require('./userEvents'),
	{ sendUserGameSettings, sendGameList, sendGeneralChats, sendUserList } = require('./userAppRequests'),
	{ updateSeatedUsers, updateSelectedElimination, updateUserNightActionEvent } = require('./gameCore');

module.exports = () => {
	io.on('connection', (socket) => {
		checkUserStatus(socket);
	
		socket

		// userEvents
		.on('updateTruncateGame', (data) => {
			handleUpdatedTruncateGame(data);
		}).on('addNewGameChat', (chat, uid) => {
			handleAddNewGameChat(games, chat, uid);
		}).on('updateReportGame', (data) => {
			handleUpdatedReportGame(socket, data);			
		}).on('addNewGame', (data) => {
			handleAddNewGame(socket, data);
		}).on('getGameInfo', (uid) => {
			sendGameInfo(socket, uid);
		}).on('updateGameSettings', (data) => {
			handleUpdatedGameSettings(socket, data);
		}).on('addNewGeneralChat', (data) => {
			handleNewGeneralChat(data);
		}).on('disconnect', () => {
			handleSocketDisconnect(socket);
		})

		// userAppRequests

		.on('getGameList', () => {
			sendGameList(socket);
		}).on('getUserList', () => {
			sendUserList(socket);
		}).on('getGeneralChats', () => {
			sendGeneralChats(socket);
		}).on('getUserGameSettings', (data) => {
			sendUserGameSettings(socket, data);
		})

		// gameCore

		.on('updateSeatedUsers', (data) => {
			updateSeatedUsers(socket, data);
		}).on('updateSelectedForElimination', (data) => {
			updateSelectedElimination(data);
		}).on('userNightActionEvent', (data) => {
			updateUserNightActionEvent(socket, data);
		});
	});
	
	// process.once('SIGUSR2', () => { // todo-release make this work or something, not code covered right now.  probably not needed.
	// 	console.log('Hello World!');
	// 	Object.keys(io.sockets.sockets).forEach((socketID) => {
	// 		io.sockets.sockets[socketID].disconnect();
	// 	});
		
	// 	return process.kill(process.pid, 'SIGUSR2');
	// });
};