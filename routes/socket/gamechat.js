'use strict';

let games = require('./game').games,
	secureGame = require('./util').secureGame,
	getInternalPlayerInGameByUserName = require('./util').getInternalPlayerInGameByUserName,
	getSocketsByUid = require('./util').getSocketsByUid;

module.exports.addNewGameChat = (data, uid) => {
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

module.exports.combineInprogressChats = (game, userName) => {
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

module.exports.sendInprogressChats= (game) => {
	let sockets = getSocketsByUid(game.uid);

	sockets.playerSockets.forEach((sock, index) => {
		let cloneGame = Object.assign({}, game),
			userName = sock.handshake.session.passport.user,
			player = cloneGame.internals.seatedPlayers.find((user) => {
				return user.userName === userName;
			});

		cloneGame.tableState.playerPerceivedRole = cloneGame.internals.seatedPlayers[index].perceivedRole;  //something tells me I don't need this at all

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