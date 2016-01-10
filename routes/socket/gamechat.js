'use strict';

import _ from 'lodash';
import { games } from './game.js';
import { secureGame, getInternalPlayerInGameByUserName, getSocketsByUid } from './util.js';

export function addNewGameChat(data, uid) {
	let game = games.find((el) => {
			return el.uid === uid;
		}),
		sockets = getSocketsByUid(game.uid),
		cloneGame = _.clone(game);

	data.timestamp = new Date();
	game.chats.push(data);

	if (game.inProgress) {
		sendInprogressChats(game);
	} else {
		io.in(uid).emit('gameUpdate', secureGame(game));
	}
}

export function combineInprogressChats(game, userName) {
	let player, gameChats, tempChats;

	if (userName) {
		player = getInternalPlayerInGameByUserName(game, userName);
	}

	gameChats = player ? player.gameChats : game.internals.unSeatedGameChats;
	tempChats = gameChats.concat(game.chats);
	tempChats.sort((chat1, chat2) => {
		return chat1.timestamp - chat2.timestamp;
	});

	return tempChats;
}

export function sendInprogressChats(game) {
	let sockets = getSocketsByUid(game.uid);

	sockets.playerSockets.forEach((sock, index) => {
		let cloneGame = _.clone(game),
			userName = sock.handshake.session.passport.user,
			player = cloneGame.internals.seatedPlayers.find((user) => {
				return user.userName === userName;
			});

		cloneGame.tableState.playerPerceivedRole = cloneGame.internals.seatedPlayers[index].perceivedRole;

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
			let cloneGame = _.clone(game);

			cloneGame.chats = combineInprogressChats(cloneGame);
			sock.emit('gameUpdate', secureGame(cloneGame));
		});
	}
}