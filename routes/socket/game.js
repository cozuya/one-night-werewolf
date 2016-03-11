'use strict';

// let Chatroom = require('../models/chatroom');

import { startGame } from './game-internals.js';
import { secureGame, getInternalPlayerInGameByUserName, devStatus } from './util.js';
import { combineInprogressChats, sendInprogressChats } from './gamechat.js';
import { userList } from './account.js';

export let games = [];

export let deleteGame = (game) => {
	games.splice(games.indexOf(game), 1);
};

export function handleUpdatedTruncateGame(data) {
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
}

export function sendGameList(socket) {
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
}

export function createGame(socket, game) {
	game.internals = {
		unSeatedGameChats: [],
		seatedPlayers: [],
		truncateGameCount: 0
	};

	games.push(game);
	sendGameList();
	socket.join(game.uid);
}

export function sendGameInfo(socket, uid) {
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
}

export function sendUserList(socket) {
	socket.emit('userList', {
		list: userList,
		totalSockets: Object.keys(io.sockets.sockets).length
	});
}

export function updateSeatedUsers(socket, data) {
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