'use strict';

let mongoose = require('mongoose'),
	Account = require('../../models/account'),
	Generalchats = require('../../models/generalchats'),
	{ secureGame, getInternalPlayerInGameByUserName } = require('./util'),
	{ games, deleteGame, sendGameList, userList } = require('./game'),
	{ combineInprogressChats, sendInprogressChats } = require('./gamechat'),
	generalChats = [],
	generalChatCount = 0,
	sendGeneralChats = (socket) => {
		socket.emit('generalChats', generalChats);
	},
	handleSocketDisconnect = (socket) => {
		let { passport } = socket.handshake.session;

		if (passport && Object.keys(passport).length) {
			let userIndex = userList.findIndex((user) => {
					return user.userName === passport.user;
				}),
				game = games.find((game) => {
					return Object.keys(game.seated).find((seatName) => {
						return game.seated[seatName].userName === passport.user;
					});
				});

			socket.emit('manualDisconnection');
			userList.splice(userIndex, 1);

			if (game) {
				let seatNames = Object.keys(game.seated),
					userSeatName = seatNames.find((seatName) => {
						return game.seated[seatName].userName === passport.user;
					});

				if (game.inProgress) {
					game.seated[userSeatName].connected = false;
					sendInprogressChats(game);
				} else {
					if (seatNames.length === 1) {
						deleteGame(game);
					} else {
						delete game.seated[userSeatName];
						io.sockets.in(game.uid).emit('gameUpdate', game);
					}
					io.sockets.emit('gameList', games);					
				}
			}
		}

		io.sockets.emit('userList', {
			list: userList,
			totalSockets: Object.keys(io.sockets.sockets).length
		});
	};

module.exports.checkUserStatus = (socket) => {
	let { passport } = socket.handshake.session;

	if (passport && Object.keys(passport).length) {
		let { user } = passport,
			{ sockets } = io.sockets,
			game = games.find((game) => {
				return Object.keys(game.seated).find((seat) => {
					return game.seated[seat].userName === user;
				});
			}),
			oldSocketID = Object.keys(sockets).find((socketID) => {
				if (sockets[socketID].handshake.session.passport && Object.keys(sockets[socketID].handshake.session.passport).length) {
					return sockets[socketID].handshake.session.passport.user === user && socketID !== socket.id;
				}
			});

		if (oldSocketID && sockets[oldSocketID]) {
			handleSocketDisconnect(sockets[oldSocketID]);
			delete sockets[oldSocketID];
		}

		if (game && game.inProgress) {
			let internalPlayer = getInternalPlayerInGameByUserName(game, user),
				userSeatName = Object.keys(game.seated).find((seatName) => {
					return game.seated[seatName].userName === passport.user;
				}),
				cloneGame;

			game.seated[userSeatName].connected = true;
			socket.join(game.uid);
			sendInprogressChats(game);
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

		account.save(() => {
			socket.emit('gameSettings', account.gameSettings);
		});
	});
}

module.exports.sendUserGameSettings = (socket, username) => {
	Account.findOne({username}, (err, account) => {
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
	if (generalChatCount === 100) {
		let chats = new Generalchats({chats: generalChats});
		
		chats.save();
		generalChatCount = 0;
	}

	generalChatCount++;
	data.time = new Date();
	generalChats.push(data);

	if (generalChats.length > 99) {
		generalChats.shift();
	}

	io.sockets.emit('generalChats', generalChats);
}

module.exports.sendGeneralChats = sendGeneralChats;
module.exports.generalChats = generalChats;
module.exports.handleSocketDisconnect = handleSocketDisconnect;