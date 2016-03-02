'use strict';

// let Chatroom = require('../models/chatroom');

import { startGame } from './game-internals.js';
import { secureGame, getInternalPlayerInGameByUserName, devStatus } from './util.js';
import { combineInprogressChats } from './gamechat.js';
import _ from 'lodash';

export let deleteGame = (game) => {
	games.splice(games.indexOf(game), 1);
};

export let games = [];

export function sendGameList() {
	io.sockets.emit('gameList', games.map((game) => {
		return {
			kobk: game.kobk,
			time: game.time,
			name: game.name,
			roles: game.roles,
			seatedCount: Object.keys(game.seated).length,
			inProgress: game.inProgress,
			uid: game.uid
		};
	}));
}

export function createGame(socket, game) {
	game.internals = {
		unSeatedGameChats: [],
		seatedPlayers: []
	};

	games.push(game);
	sendGameList();
	socket.join(game.uid);
};

export function sendGameInfo(socket, uid) {
	let game = games.find((el) => {
			return el.uid === uid;
		}),
		cloneGame = _.clone(game);

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
}

export function updateSeatedUsers(socket, data) {
	let game = games.find((el) => {
		return el.uid === data.uid;
	});

	socket.join(data.uid);

	// console.log(data);

	if (data.seatNumber !== null) {
		game.seated[`seat${data.seatNumber}`] = data.userInfo;

		if (game.seatedCount === devStatus.seatedCountToStartGame) {
			startGameCountdown(game);
		} else {
			io.sockets.in(data.uid).emit('gameUpdate', secureGame(game));
		}
	} else {
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
}

let startGameCountdown = (game) => {
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