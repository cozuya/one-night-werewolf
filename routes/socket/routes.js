'use strict';

let { updateSeatedUsers, handleUpdatedTruncateGame, handleUpdatedReportGame, sendGameList, sendUserList, createGame, sendGameInfo, games } = require('./game'),
	{ sendGeneralChats, handleNewGeneralChat, checkUserStatus, handleUpdatedGameSettings, sendUserGameSettings, handleSocketDisconnect } = require('./account'),
	{ addNewGameChat } = require('./gamechat'),
	{ updateUserNightActionEvent } = require('./game-nightactions'),
	{ updateSelectedElimination } = require('./game-internals');

module.exports = () => {
	io.on('connection', (socket) => {
		checkUserStatus(socket);

		socket.on('getGameInfo', (uid) => {
			sendGameInfo(socket, uid);
		}).on('updateTruncateGame', (data) => {
			handleUpdatedTruncateGame(data);
		}).on('updateReportGame', (data) => {
			handleUpdatedReportGame(socket, data);			
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
			addNewGameChat(games, chat, uid);
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
	
	// process.once('SIGUSR2', () => { // todo-release make this work or something, not code covered right now.  probably not needed.
	// 	console.log('Hello World!');
	// 	Object.keys(io.sockets.sockets).forEach((socketID) => {
	// 		io.sockets.sockets[socketID].disconnect();
	// 	});
		
	// 	return process.kill(process.pid, 'SIGUSR2');
	// });
};