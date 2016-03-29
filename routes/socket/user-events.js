'use strict';

let { games, userList, generalChats } = require('./models'),
	{ secureGame } = require('./util'),
	{ sendGameList, sendGeneralChats } = require('./user-requests'),
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

				if (game.inProgress) {
					game.seated[userSeatName].connected = false;
					sendInProgressGameUpdate(game);
				} else {
					if (seatNames.length === 1) {
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
		_chats.sort((chat1, chat2) => {
			return chat1.timestamp - chat2.timestamp;
		});

		return _chats;
	},
	sendInProgressGameUpdate = (game) => {
		let seatedPlayerNames = Object.keys(game.seated).map((seat) => {
				return game.seated[seat].userName;
			}),
			sockets = {},
			roomSockets = Object.keys(io.sockets.adapter.rooms[game.uid].sockets).map((sockedId) => {
				return io.sockets.connected[sockedId];
			});

			sockets.playerSockets = roomSockets.filter((socket) => {
				if (socket.handshake.session.passport && Object.keys(socket.handshake.session.passport).length) {
					return seatedPlayerNames.indexOf(socket.handshake.session.passport.user) >= 0;
				}
			});

			sockets.observerSockets = roomSockets.filter((socket) => {
				return seatedPlayerNames.indexOf(socket.handshake.session.passport.user) === -1;
			});

		sockets.playerSockets.forEach((sock, index) => {
			let cloneGame = Object.assign({}, game),
				userName = sock.handshake.session.passport.user,
				player = cloneGame.internals.seatedPlayers.find((user) => {
					return user.userName === userName;
				});

			// cloneGame.tableState.playerPerceivedRole = cloneGame.internals.seatedPlayers[index].perceivedRole;  // todo-alpha remove this

			if (cloneGame.tableState.phase === player.nightAction.phase && !player.nightPhaseComplete) {
				cloneGame.tableState.nightAction = cloneGame.internals.seatedPlayers[index].nightAction;
			} else {
				cloneGame.tableState.nightAction = {};
			}

			if (cloneGame.tableState.phase === 'elimination') {
				cloneGame.tableState.elimination = cloneGame.internals.seatedPlayers[index].selectedForElimination;
			}

			cloneGame.chats = combineInProgressChats(cloneGame, player.userName);
			sock.emit('gameUpdate', secureGame(cloneGame));
		});

		if (sockets.observerSockets.length) {
			sockets.observerSockets.forEach((sock) => {
				let cloneGame = Object.assign({}, game);

				cloneGame.chats = combineInProgressChats(cloneGame);
				sock.emit('gameUpdate', secureGame(cloneGame));
			});
		}
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
		player = game.internals.seatedPlayers.find((player) => {
			return player.userName === data.userName;
		});

	if (player.reportedGame) {
		player.reportedGame = false;
		game.tableState.reportedGame[data.seatNumber] = false;
	} else {
		player.reportedGame = true;
		game.tableState.reportedGame[data.seatNumber] = true;
	}

	sendInProgressGameUpdate(game);
};

module.exports.handleAddNewGame = (socket, data) => {
	data.internals = {
		unSeatedGameChats: [],
		seatedPlayers: [],
		truncateGameCount: 0
	};

	games.push(data);
	sendGameList();
	socket.join(data.uid);
};

module.exports.handleAddNewGameChat = (data, uid) => {
	let game = games.find((el) => {
			return el.uid === uid;
		}),
		cloneGame = Object.assign({},game);

	data.timestamp = new Date();
	game.chats.push(data);

	if (game.inProgress) {
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

		if (game && game.inProgress) {
			let internalPlayer = getInternalPlayerInGameByUserName(game, user),
				userSeatName = Object.keys(game.seated).find((seatName) => {
					return game.seated[seatName].userName === passport.user;
				}),
				cloneGame;

			game.seated[userSeatName].connected = true;
			socket.join(game.uid);
			sendInProgressGameUpdate(game);
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

module.exports.handleSocketDisconnect = handleSocketDisconnect;
module.exports.sendInProgressGameUpdate = sendInProgressGameUpdate;