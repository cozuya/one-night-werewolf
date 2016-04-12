'use strict';

let { games, userList, generalChats } = require('./models'),
	{ secureGame } = require('./util'),
	{ roleMap } = require('../../iso/util'),
	{ sendGameList, sendGeneralChats } = require('./user-requests'),
	_ = require('lodash'),
	Account = require('../../models/account'),
	Generalchats = require('../../models/generalchats'),
	generalChatCount = 0,
	getInternalPlayerInGameByUserName = (game, userName) => {
		return game.internals.seatedPlayers.find((player) => {
			return player.userName === userName;
		});
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

				if (game.gameState.isStarted) {
					game.seated[userSeatName].connected = false;
					sendInProgressGameUpdate(game);
				} else {
					if (seatNames.length === 1) {
						// todo-release kick out observer sockets/route to default?
						games.splice(games.indexOf(game), 1);
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
	},
	combineInProgressChats = (game, userName) => {
		let player, gameChats, _chats;

		if (userName) {
			player = getInternalPlayerInGameByUserName(game, userName);
		}

		gameChats = player ? player.gameChats : game.internals.unSeatedGameChats;
		_chats = gameChats.concat(game.chats);
		_chats.sort((chat1, chat2) => { // todo-release move to front end?  everything else is
			return chat1.timestamp - chat2.timestamp;
		});

		return _chats;
	},
	sendInProgressGameUpdate = (game) => { // todo-release make this accept a socket argument and emit only to it if it exists
		let seatedPlayerNames = Object.keys(game.seated).map((seat) => {
				return game.seated[seat].userName;
			}),
			roomSockets = Object.keys(io.sockets.adapter.rooms[game.uid].sockets).map((sockedId) => {
				return io.sockets.connected[sockedId];
			}),
			playerSockets = roomSockets.filter((socket) => {
				return socket.handshake.session.passport && Object.keys(socket.handshake.session.passport).length && seatedPlayerNames.indexOf(socket.handshake.session.passport.user) >= 0;
			}),
			observerSockets = roomSockets.filter((socket) => {
				return !socket.handshake.session.passport || seatedPlayerNames.indexOf(socket.handshake.session.passport.user) === -1;
			});

		playerSockets.forEach((sock, index) => {
			let cloneGame = Object.assign({}, game),
				{ user } = sock.handshake.session.passport;

			if (!game.gameState.isCompleted) {
				cloneGame.tableState = cloneGame.internals.seatedPlayers.find((player) => {
					return user === player.userName;
				}).tableState;
			}
			
			cloneGame.chats = combineInProgressChats(cloneGame, user);
			sock.emit('gameUpdate', secureGame(cloneGame));
		});

		observerSockets.forEach((sock) => {
			let cloneGame = Object.assign({}, game);

			cloneGame.chats = combineInProgressChats(cloneGame);
			sock.emit('gameUpdate', secureGame(cloneGame));
		});
	};

module.exports.handleUpdatedTruncateGame = (data) => {
	let game = games.find((el) => {
			return el.uid === data.uid;
		}),
		chat = {
			gameChat: true,
			timestamp: new Date()
		};

	if (!game.internals.truncated) {
		if (!data.truncate && game.internals.truncateGameCount !== 0) {
			game.internals.truncateGameCount--;
			chat.chat = `${data.userName} has removed their vote to end the game early. [${game.internals.truncateGameCount} / 4]`;
		} else {
			game.internals.truncateGameCount++;
			chat.chat = `${data.userName} has voted to end the game early. [${game.internals.truncateGameCount} / 4]`;

			if (game.internals.truncateGameCount === 4) {
				chat.chat = `${chat.chat} The majority of players have voted to end the game early.`;
				game.internals.truncateGame = true;
				game.internals.truncated = true;
			}
		}
		game.chats.push(chat);
		sendInProgressGameUpdate(game);
	}
};

module.exports.handleUpdatedReportGame = (socket, data) => {
	let game = games.find((el) => {
			return el.uid === data.uid;
		}),
		seatNumber = parseInt(data.seatNumber);

	if (game.gameState.reportedGame[seatNumber]) {
		game.gameState.reportedGame[seatNumber] = false;
	} else {
		game.gameState.reportedGame[seatNumber] = true;
	}

	sendInProgressGameUpdate(game);
};

module.exports.handleAddNewGame = (socket, data) => {
	data.internals = {
		unSeatedGameChats: [],
		seatedPlayers: [{gameChats: [], tableState: {seats: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]}}, {gameChats: [], tableState: {seats: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]}}, {gameChats: [], tableState: {seats: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]}}, {gameChats: [], tableState: {seats: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]}}, {gameChats: [], tableState: {seats: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]}}, {gameChats: [], tableState: {seats: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]}}, {gameChats: [], tableState: {seats: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]}}],
		truncateGameCount: 0
	};

	games.push(data);
	sendGameList();
	socket.join(data.uid);
};

module.exports.handleAddNewGameChat = (data, uid) => {
	let game = games.find((el) => {
			return el.uid === uid;
		});

	data.timestamp = new Date();
	game.chats.push(data);

	if (data.claim) {
		let player = game.internals.seatedPlayers.find((player) => {
			return player.userName === data.userName;
		});

		game.internals.seatedPlayers.forEach((seatedPlayer) => {
			let claimSeat = seatedPlayer.tableState.seats[player.seatNumber];

			if (claimSeat.swappedWithSeat === 0 || claimSeat.swappedWithSeat) {
				seatedPlayer.tableState.seats[claimSeat.swappedWithSeat].claim = data.claim;
			} else {
				seatedPlayer.tableState.seats[player.seatNumber].claim = data.claim;
			}
		});
	}

	if (game.gameState.isStarted) {
		sendInProgressGameUpdate(game);
	} else {
		io.in(uid).emit('gameUpdate', secureGame(game));
	}
};

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

		if (game && game.gameState.isStarted) {
			let internalPlayer = getInternalPlayerInGameByUserName(game, user),
				userSeatName = Object.keys(game.seated).find((seatName) => {
					return game.seated[seatName].userName === user;
				});

			game.seated[userSeatName].connected = true;
			socket.join(game.uid);
			socket.emit('updateSeatForUser', internalPlayer.seatNumber.toString());
			sendInProgressGameUpdate(game);
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

module.exports.handleSocketDisconnect = handleSocketDisconnect;
module.exports.sendInProgressGameUpdate = sendInProgressGameUpdate;