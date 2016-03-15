'use strict';

let startGame = require('./game-internals').startGame,
	secureGame = require('./util').secureGame,
	getInternalPlayerInGameByUserName = require('./util').getInternalPlayerInGameByUserName,
	devStatus = require('./util').devStatus,
	combineInprogressChats = require('./gamechat').combineInprogressChats,
	sendInprogressChats = require('./gamechat').sendInprogressChats,
	games = [],
	userList = [],
	deleteGame = (game) => {
		games.splice(games.indexOf(game), 1);
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

let sendGameList = (socket) => {
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
	});

	// console.log(data);
	// console.log(game);
	// console.log(socket.handshake.session.passport);
	// console.log(socket.handshake.session);
	if (game) {
		socket.join(data.uid);
	}

	if (socket.handshake.session.passport && data.seatNumber && socket.handshake.session.passport.user === data.userInfo.userName) {
		try {
			game.seated[`seat${data.seatNumber}`] = data.userInfo;

			if (Object.keys(game.seated).length === devStatus.seatedCountToStartGame) {
				startGameCountdown(game);
			} else {
				io.sockets.in(data.uid).emit('gameUpdate', secureGame(game));
			}
		} catch (e) {
			console.log('updateSeatedUsers blew up as usual');
		}
	} else if (game) {
		for (let key in game.seated) {
			if (game.seated[key].userName === socket.handshake.session.passport.user) {
				delete game.seated[key];
			}
		}

		if (Object.keys(game.seated).length === 0) {
			deleteGame(game);
		}

		sendGameList();
		socket.leave(game.uid);
		io.sockets.in(data.uid).emit('gameUpdate', secureGame(game));
		socket.emit('gameUpdate', {});
	}
	// sendGameList(socket);  // todo: this double-updates the game causing mayhem.  commenting out for now but critical this gets addressed at some point.
};

let startGameCountdown = (game) => {
	let startGamePause = devStatus.startGamePause,
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

module.exports.games = games;
module.exports.userList = userList;
module.exports.sendGameList = sendGameList;
module.exports.deleteGame = deleteGame;