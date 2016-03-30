'use strict';

let Account = require('../../models/account'),
	{ games, userList, generalChats } = require('./models'),
	{ secureGame } = require('./util');

module.exports.sendUserGameSettings = (socket, username) => {
	Account.findOne({username}, (err, account) => {
		if (err) {
			console.log(err);
		}

		socket.emit('gameSettings', account.gameSettings);
		userList.push({
			userName: username,
			wins: account.wins,
			losses: account.losses
		});
		io.sockets.emit('userList', {
			list: userList,
			totalSockets: Object.keys(io.sockets.sockets).length
		});
	});
};

module.exports.sendGameList = (socket) => {
	let formattedGames = games.map((game) => {
		return {
			kobk: game.kobk,
			time: game.time,
			name: game.name,
			gameState: game.gameState,
			roles: game.roles,
			seatedCount: Object.keys(game.seated).length,
			inProgress: game.gameState.isStarted,
			uid: game.uid
		};
	});

	if (socket) {
		socket.emit('gameList', formattedGames);
	} else {
		io.sockets.emit('gameList', formattedGames);
	}
};

module.exports.sendGeneralChats = (socket) => {
	socket.emit('generalChats', generalChats);
};

module.exports.sendUserList = (socket) => {
	socket.emit('userList', {
		list: userList,
		totalSockets: Object.keys(io.sockets.sockets).length
	});
};

module.exports.sendGameInfo = (socket, uid) => {
	let game = games.find((el) => {
			return el.uid === uid;
		}),
		cloneGame = Object.assign({}, game);

	socket.join(uid);
	socket.emit('gameUpdate', secureGame(cloneGame));
};