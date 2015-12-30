'use strict';

// let Chatroom = require('../models/chatroom');

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

export function sendInprogressChats(game, gameInit) {
	let sockets = getSocketsByUid(game.uid);

	game.internals.seatedPlayers.forEach((player, index) => {
		let socket = sockets.playerSockets.find((sock) => {
				return sock.handshake.session.passport.user === player.userName;
			}),
			cloneGame = _.clone(game);

		if (gameInit) { // todo: this doesn't work on refreshing browser - turns everyone into a werewolf.. need to rethink.
			cloneGame.tableState.playerPerceivedRole = cloneGame.internals.seatedPlayers[index].trueRole; 
		}

		cloneGame.chats = combineInprogressChats(cloneGame, player.userName);
		socket.emit('gameUpdate', secureGame(cloneGame));
	});

	if (sockets.observerSockets.length) {
		sockets.observerSockets.forEach((sock) => {
			let cloneGame = _.clone(game);

			cloneGame.chats = combineInprogressChats(cloneGame);
			sock.emit('gameUpdate', secureGame(cloneGame));
		});
	}
}