'use strict';

let { games } = require('./models'),
	{ getInternalPlayerInGameByUserName, secureGame } = require('./util'),
	{ sendGameList } = require('./userAppRequests'),
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

			cloneGame.tableState.playerPerceivedRole = cloneGame.internals.seatedPlayers[index].perceivedRole;  // todo-alpha crashes game if seated player reloads during game start countdown

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
		sendInprogressChats(game);
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

	sendInprogressChats(game);
};

module.exports.handleAddNewGame = (socket, data) => {
	data.internals = {
		unSeatedGameChats: [],
		seatedPlayers: [],
		truncateGameCount: 0
	};

	games.push(data);
	sendGameList(); // todo-r get this
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
		sendInprogressChats(game);
	} else {
		io.in(uid).emit('gameUpdate', secureGame(game));
	}
};

module.exports.sendGameInfo = (socket, uid) => {
	let game = games.find((el) => {
			return el.uid === uid;
		}),
		cloneGame = Object.assign({}, game);

	socket.join(uid);
	socket.emit('gameUpdate', secureGame(cloneGame));
};

module.exports.sendInProgressGameUpdate = sendInProgressGameUpdate;