'use strict';

let { secureGame } = require('./util'),
	{ getInternalPlayerInGameByUserName } = require('./util');

module.exports.addNewGameChat = (games, data, uid) => {
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

let combineInprogressChats = (game, userName) => {
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
};

let sendInprogressChats = (game) => {
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

		cloneGame.tableState.playerPerceivedRole = cloneGame.internals.seatedPlayers[index].perceivedRole;  // todo-release should probably be double checked for efficaciousness

		if (cloneGame.tableState.phase === player.nightAction.phase && !player.nightPhaseComplete) {
			cloneGame.tableState.nightAction = cloneGame.internals.seatedPlayers[index].nightAction;
		} else {
			cloneGame.tableState.nightAction = {};
		}

		if (cloneGame.tableState.phase === 'elimination') {
			cloneGame.tableState.elimination = cloneGame.internals.seatedPlayers[index].selectedForElimination;
		}

		cloneGame.chats = combineInprogressChats(cloneGame, player.userName);
		sock.emit('gameUpdate', secureGame(cloneGame));
	});

	if (sockets.observerSockets.length) {
		sockets.observerSockets.forEach((sock) => {
			let cloneGame = Object.assign({}, game);

			cloneGame.chats = combineInprogressChats(cloneGame);
			sock.emit('gameUpdate', secureGame(cloneGame));
		});
	}
};

module.exports.combineInprogressChats = combineInprogressChats;
module.exports.sendInprogressChats = sendInprogressChats;