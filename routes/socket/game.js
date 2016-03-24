'use strict';

let { startGame } = require('./game-internals'),
	{ secureGame, getInternalPlayerInGameByUserName, devStatus } = require('./util'),
	{ combineInprogressChats, sendInprogressChats } = require('./gamechat'),
	games = [],
	userList = [],
	deleteGame = (game) => {
		// todo-alpha push/replace after game ends chats into db on completed games

		games.splice(games.indexOf(game), 1);
	},
	sendGameList = (socket) => {
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
	},
	startGameCountdown = (game) => {
		let { startGamePause } = devStatus,
			countDown;

		game.inProgress = true;

		countDown = setInterval(() => {
			if (startGamePause === 0) {
				clearInterval(countDown);
				startGame(game);
			} else {
				game.status = `Game starts in ${startGamePause} second${startGamePause === 1 ? '' : 's'}.`;
				io.sockets.in(game.uid).emit('gameUpdate', secureGame(game));
			}
			startGamePause--;
		}, 1000);
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

module.exports.createGame = (socket, game) => {
	game.internals = {
		unSeatedGameChats: [],
		seatedPlayers: [],
		truncateGameCount: 0
	};

	games.push(game);
	sendGameList();
	socket.join(game.uid);
};

module.exports.sendGameInfo = (socket, uid) => {
	let game = games.find((el) => {
			return el.uid === uid;
		}),
		cloneGame = Object.assign({}, game);

	socket.join(uid);

	if (game.inProgress) {
		if (Object.keys(socket.handshake.session.passport).length) {
			let player = getInternalPlayerInGameByUserName(game, socket.handshake.session.passport.user);
			
			cloneGame.chats = player ? combineInprogressChats(game, player) : combineInprogressChats(game);
			cloneGame.gameState.playerPerceivedRole = player ? player.perceivedRole : undefined;
		} else {
			cloneGame.chats = combineInprogressChats(game);
		}
	}

	socket.emit('gameUpdate', secureGame(cloneGame));
};

module.exports.sendUserList = (socket) => {
	socket.emit('userList', {
		list: userList,
		totalSockets: Object.keys(io.sockets.sockets).length
	});
};

module.exports.updateSeatedUsers = (socket, data) => {
	let game = games.find((el) => {
			return el.uid === data.uid;
		}),
		socketSession = socket.handshake.session;

	if (game) {
		socket.join(data.uid);
	}

	if (socketSession.passport && data.seatNumber && socketSession.passport.user === data.userInfo.userName) {
		game.seated[`seat${data.seatNumber}`] = {
			userName: data.userInfo.userName
		};
		game.seated[`seat${data.seatNumber}`].connected = true;

		if (Object.keys(game.seated).length === devStatus.seatedCountToStartGame) {
			startGameCountdown(game);
		} else {
			io.sockets.in(data.uid).emit('gameUpdate', secureGame(game));
			sendGameList();
		}
	} else if (game) {
		let completedDisconnectionCount = 0;

		if (data.gameCompleted) {
			let playerSeat = Object.keys(game.seated).find((seatName) => {
				return game.seated[seatName].userName === data.userName;
			});

			game.seated[playerSeat].connected = false;
			Object.keys(game.seated).forEach((seatName) => {
				if (!game.seated[seatName].connected) {
					completedDisconnectionCount++;
				}
			});
			sendGameList(socket);
		} else {
			for (let key in game.seated) {
				if (game.seated[key].userName === socketSession.passport.user) {
					delete game.seated[key];
				}
			}

			sendGameList();
		}

		if (Object.keys(game.seated).length === 0 || completedDisconnectionCount === 7) {
			deleteGame(game);
			sendGameList();
		}

		socket.leave(game.uid);
		io.sockets.in(data.uid).emit('gameUpdate', secureGame(game));
		socket.emit('gameUpdate', {});
	}
};

module.exports.games = games;
module.exports.userList = userList;
module.exports.sendGameList = sendGameList;
module.exports.deleteGame = deleteGame;