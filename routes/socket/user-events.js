'use strict';

let { games, userList, generalChats } = require('./models'),
	{ secureGame } = require('./util'),
	{ roleMap } = require('../../iso/util'),
	{ sendGameList, sendGeneralChats } = require('./user-requests'),
	_ = require('lodash'),
	Game = require('../../models/game'),
	Account = require('../../models/account'),
	Generalchats = require('../../models/generalchats'),
	generalChatCount = 0,
	saveGame = (game) => {
		let gameToSave = new Game({
			uid: game.uid,
			time: game.time,
			date: new Date(),
			roles: game.roles,
			winningPlayers: game.internals.seatedPlayers.filter((player) => {
				return player.wonGame;
			}).map((player) => {
				return {
					userName: player.userName,
					originalRole: player.originalRole,
					trueRole: player.trueRole
				};
			}),
			losingPlayers: game.internals.seatedPlayers.filter((player) => {
				return !player.wonGame;
			}).map((player) => {
				return {
					userName: player.userName,
					originalRole: player.originalRole,
					trueRole: player.trueRole
				};
			}),
			reports: Object.keys(game.gameState.reportedGame).filter((seatNumber) => {
				return game.gameState.reportedGame[seatNumber];
			}).map((seatNumber) => {
				return game.internals.seatedPlayers[seatNumber].userName;
			}),
			kobk: game.kobk,
			chats: game.chats.filter((chat) => {
				return !chat.gameChat;
			})
		});

		gameToSave.save();
	},
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

				if (game.gameState.isStarted && !game.gameState.isCompleted) {
					game.seated[userSeatName].connected = false;
					sendInProgressGameUpdate(game);
				} else {
					if (game.gameState.isCompleted && Object.keys(game.seated).filter((seat) => {
						return !game.seated[seat].connected;
					}).length === 6) {
						saveGame(game);
						games.splice(games.indexOf(game), 1);
					} else if (seatNames.length === 1) {
						games.splice(games.indexOf(game), 1);
					} else {
						// todo-release kick out observer sockets/route to default?
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
			roomSockets, playerSockets, observerSockets;

		if (io.sockets.adapter.rooms[game.uid]) {
			roomSockets = Object.keys(io.sockets.adapter.rooms[game.uid].sockets).map((sockedId) => {
				return io.sockets.connected[sockedId];
			}),
			playerSockets = roomSockets.filter((socket) => {
				return socket.handshake.session.passport && Object.keys(socket.handshake.session.passport).length && seatedPlayerNames.includes(socket.handshake.session.passport.user);
			}),
			observerSockets = roomSockets.filter((socket) => {
				return !socket.handshake.session.passport || !seatedPlayerNames.includes(socket.handshake.session.passport.user);
			});
		}

		if (playerSockets) {
			playerSockets.forEach((sock, index) => {
				let _game = Object.assign({}, game),
					{ user } = sock.handshake.session.passport;

				if (!game.gameState.isCompleted) {
					_game.tableState = _game.internals.seatedPlayers.find((player) => {
						return user === player.userName;
					}).tableState;
				}
				
				_game.chats = combineInProgressChats(_game, user);
				sock.emit('gameUpdate', secureGame(_game));
			});
		}

		if (observerSockets) {
			observerSockets.forEach((sock) => {
				let _game = Object.assign({}, game);

				_game.chats = combineInProgressChats(_game);
				sock.emit('gameUpdate', secureGame(_game));
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
			chat.chat = [
				{
					text: `${data.userName}`,
					type: 'playerName'
				},
				{text: ` has removed their vote to end the game early. [${game.internals.truncateGameCount} / 4]`}
			];
		} else {
			game.internals.truncateGameCount++;
			chat.chat = [
				{
					text: `${data.userName}`,
					type: 'playerName'
				},
				{text: ` has voted to end the game early. [${game.internals.truncateGameCount} / 4]`}
			];

			if (game.internals.truncateGameCount === 4) {
				chat.chat = [
					{text: 'The majority of players have voted to end the game early.'}
				];
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
		unSeatedGameChats: [],  //todo-release clean up this mess
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

module.exports.handleUserLeaveGame = (socket, data) => {
	let game = games.find((el) => {
			return el.uid === data.uid;
		}),
		completedDisconnectionCount;

	if (game && io.sockets.adapter.rooms[game.uid]) {
		socket.leave(game.uid);
	}

	// todo-release for some reason when a player plays a game, it completes, leaves the table, and then comes back to the table, they don't have the private info from the game until there is a game update.

	if (game && game.gameState.isCompleted && data.seatNumber) {
		let playerSeat = Object.keys(game.seated).find((seatName) => {
				return game.seated[seatName].userName === data.userName;
			});

		game.seated[playerSeat].connected = false;
		sendGameList(socket);

		completedDisconnectionCount = Object.keys(game.seated).filter((seat) => {
			return !game.seated[seat].connected;
		}).length;

		if (completedDisconnectionCount === 7) {
			saveGame(game);
		}

	} else if (data.seatNumber && !game.gameState.isStarted) {
		delete game.seated[`seat${data.seatNumber}`];
	}

	if (game && Object.keys(game.seated).length === 0 || completedDisconnectionCount === 7) {
		socket.emit('gameUpdate', {}, data.isSettings);
		io.sockets.in(data.uid).emit('gameUpdate', {});
		games.splice(games.indexOf(game), 1);
	} else {
		io.sockets.in(data.uid).emit('gameUpdate', secureGame(game));
		socket.emit('gameUpdate', {}, data.isSettings);
	}

	sendGameList();
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

		if (game && game.gameState.isStarted && !game.gameState.isCompleted) {
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