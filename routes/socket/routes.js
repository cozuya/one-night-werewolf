'use strict';

let handleUpdatedTruncateGame = require('./game').handleUpdatedTruncateGame,
	sendGameList = require('./game').sendGameList,
	sendUserList = require('./game').sendUserList,
	createGame = require('./game').createGame,
	sendGameInfo = require('./game').sendGameInfo,
	updateSeatedUsers = require('./game').updateSeatedUsers,
	sendGeneralChats = require('./account').sendGeneralChats,
	handleNewGeneralChat = require('./account').handleNewGeneralChat,
	checkUserStatus = require('./account').checkUserStatus,
	handleUpdatedGameSettings = require('./account').handleUpdatedGameSettings,
	sendUserGameSettings = require('./account').sendUserGameSettings,
	handleSocketDisconnect = require('./account').handleSocketDisconnect,
	addNewGameChat = require('./gamechat').addNewGameChat,
	updateUserNightActionEvent = require('./game-nightactions').updateUserNightActionEvent,
	updateSelectedElimination = require('./game-internals').updateSelectedForElimination,
	games = require('./game').games;

module.exports = () => {
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
};