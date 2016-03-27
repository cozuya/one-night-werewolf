'use strict';

let { games, userList, generalChats } = require('./models'),
	Account = require('../../models/account');

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
			roles: game.roles,
			seatedCount: Object.keys(game.seated).length,
			inProgress: game.inProgress,
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