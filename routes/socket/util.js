'use strict';

import { games } from './game.js';
import _  from 'lodash';

export function getSocketsByUid(uid) {
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
			return seatedPlayerNames.indexOf(socket.handshake.session.passport.user) >= 0;
		}),
		sockets.observerSockets = roomSockets.filter((socket) => {
			return seatedPlayerNames.indexOf(socket.handshake.session.passport.user) === -1;
		});

	return sockets;
}

export function secureGame(game) {
	let _game = _.clone(game);

	delete _game.internals;
	return _game;
};

export function getInternalPlayerInGameByUserName(game, userName) {
	return game.internals.seatedPlayers.find((player) => {
		return player.userName === userName;
	});
}

// prod
// export let timers = {
// 	startGamePause: 5,
// 	phaseTime: 10,
// 	endingGame: 15
// }

// dev
export let timers = {
	startGamePause: 1,
	phaseTime: 1,
	endingGame: 3
}