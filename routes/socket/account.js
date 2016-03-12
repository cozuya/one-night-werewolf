'use strict';

let mongoose = require('mongoose'),
	Account = require('../../models/account'),
	secureGame = require('./util').secureGame,
	getInternalPlayerInGameByUserName = require('./util').getInternalPlayerInGameByUserName,
	games = require('./game').games,
	deleteGame = require('./game').deleteGame,
	sendGameList = require('./game').sendGameList,
	combineInprogressChats = require('./gamechat').combineInprogressChats,
	userList = [],
	generalChats = [];

console.log(require('./game'));
// console.log(require('./gamechat'));

module.exports.handleSocketDisconnect = (socket) => {
	let passport = socket.handshake.session.passport;

	if (passport && Object.keys(passport).length) {
		let userIndex = userList.findIndex((user) => {
				return user.userName === passport.user;
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
	}

	io.sockets.emit('userList', {
		list: userList,
		totalSockets: Object.keys(io.sockets.sockets).length
	});
}

module.exports.checkUserStatus = (socket) => {
	if (socket.handshake.session.passport && Object.keys(socket.handshake.session.passport).length) {
		let user = socket.handshake.session.passport.user,
			sockets = io.sockets.sockets,
			gameUserIsIn = games.find((game) => {
				return Object.keys(game.seated).find((seat) => {
					return game.seated[seat].userName === user;
				});
			}),
			oldSocket = sockets.find((sock) => {
				if (sock.handshake.session.passport && Object.keys(sock.handshake.session.passport).length) {
					return sock.id !== socket.id && sock.handshake.session.passport.user === user;
				}
			});

		if (oldSocket) {
			sockets.splice(sockets.indexOf(oldSocket), 1);
		}

		if (gameUserIsIn && gameUserIsIn.inProgress) {
			let internalPlayer = getInternalPlayerInGameByUserName(gameUserIsIn, user),
				cloneGame = Object.assign({}, gameUserIsIn);

			cloneGame.chats = combineInprogressChats(cloneGame, user);
			socket.join(gameUserIsIn.uid);
			socket.emit('gameUpdate', secureGame(cloneGame));
			socket.emit('updateSeatForUser', internalPlayer.seat);
		}
	} else {
		io.sockets.emit('userList', {
			list: userList,
			totalSockets: Object.keys(io.sockets.sockets).length
		});
	}

	sendGeneralChats(socket);
	sendGameList(socket);
};

module.exports.handleUpdatedGameSettings = (socket, data) => {
	Account.findOne({username: socket.handshake.session.passport.user}, (err, account) => {
		if (err) {
			console.log(err);
		}

		for (let setting in data) {
			account.gameSettings[setting] = data[setting];
		}

		account.save();
		socket.emit('gameSettings', account.gameSettings);
	});
}

module.exports.sendUserGameSettings = (socket, username) => {
	Account.findOne(username, (err, account) => {
		if (err) {
			console.log(err);
		}

		socket.emit('gameSettings', account.gameSettings);
		userList.unshift({
			userName: username,
			wins: account.wins,
			losses: account.losses
		});
		io.sockets.emit('userList', {
			list: userList,
			totalSockets: Object.keys(io.sockets.sockets).length
		});
	});
}

module.exports.handleNewGeneralChat = (data) => {
	if (generalChats.length === 100) {
		generalChats.pop();
		// todo push/save to db
	}

	data.time = new Date();
	generalChats.push(data);

	io.sockets.emit('generalChats', generalChats);
}

let sendGeneralChats = (socket) => {
	socket.emit('generalChats', generalChats);
}

module.exports.sendGeneralChats = sendGeneralChats;
module.exports.userList = userList;
module.exports.generalChats = generalChats;