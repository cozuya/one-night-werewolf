'use strict';

let games = require('./game').games;

// prod
// module.exports.devStatus = { // can't think of a better name.  This object assists in development.
// 	nightPhasePause: 5,
// 	phaseTime: 10,
// 	endingGame: 15,
// 	seatedCountToStartGame: 7,
// 	startGamePause: 5,
// 	playerCountToEndGame: 7,
// 	revealLosersPause: 5000,
// 	revealAllCardsPause: 11000
// }

// dev 2p
// module.exports.devStatus = {
// 	nightPhasePause: 1,
// 	phaseTime: 1,
// 	endingGame: 3,
// 	seatedCountToStartGame: 2,
// 	startGamePause: 1,
// 	playerCountToEndGame: 2,
// 	revealLosersPause: 1000,
// 	revealAllCardsPause: 1500
// }

// dev 7p

module.exports.devStatus = {
	nightPhasePause: 1,
	phaseTime: 1,
	endingGame: 3,
	seatedCountToStartGame: 7,
	startGamePause: 1,
	playerCountToEndGame: 7,
	revealLosersPause: 1000,
	revealAllCardsPause: 1500
};

module.exports.getSocketsByUid = (uid) => {
	let game = games.find((el) => {
			return el.uid === uid;
		}),
		seatedPlayerNames = Object.keys(game.seated).map((seat) => {
			return game.seated[seat].userName;
		}),
		sockets = {},
		roomSockets = Object.keys(io.sockets.adapter.rooms[game.uid]).map((sockedId) => {
			return io.sockets.connected[sockedId];
		});

		sockets.playerSockets = roomSockets.filter((socket) => {
			return seatedPlayerNames.indexOf(socket.handshake.session.passport.user) >= 0;  // todo this errored some how at beginning of game
		});

		sockets.observerSockets = roomSockets.filter((socket) => {
			return seatedPlayerNames.indexOf(socket.handshake.session.passport.user) === -1;
		});

	return sockets;
}

module.exports.secureGame = (game) => {
	let _game = Object.assign({}, game);

	delete _game.internals;
	return _game;
}

module.exports.getInternalPlayerInGameByUserName = (game, userName) => {
	return game.internals.seatedPlayers.find((player) => {
		return player.userName === userName;
	});
}