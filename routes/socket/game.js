'use strict';

// let Chatroom = require('../models/chatroom');

import { startGame } from './game-internals.js';
import _ from 'lodash';

let deleteGame = (game) => {
	let index = games.indexOf(game);

	games.splice(index, 1);
};

export let games = [];

export function sendGameList() {
	let gameList = games.map((game) => {
		return {
			kobk: game.kobk,
			time: game.time,
			name: game.name,
			roles: game.roles,
			seatedCount: game.seatedCount,
			inProgress: game.inProgress,
			uid: game.uid
		};
	});

	io.emit('gameList', gameList);
}

export function createGame(socket, game) {
	games.push(game);
	sendGameList();
	socket.join(game.uid);
};

export function sendGameInfo(socket, uid) {
	let game = games.find((el) => {
		return el.uid === uid;
	});

	socket.join(uid);
	socket.emit('gameUpdate', game);
}

export function updateSeatedUsers(socket, data) {
	let game = games.find((el) => {
		return el.uid === data.uid;
	});

	if (data.seatNumber !== null) {
		game.seated[`seat${data.seatNumber}`] = data.userInfo;
		game.seatedCount++;
		io.sockets.in(data.uid).emit('gameUpdate', game);
	} else {
		for (let key in game.seated) {
			if (game.seated.hasOwnProperty(key)) {
				if (game.seated[key].userName === socket.handshake.session.passport.user) {
					delete game.seated[key];
					game.seatedCount--;
				}
			}
		}

		if (Object.keys(game.seated).length === 0) {
			deleteGame(game);
		}

		socket.leave(game.uid);
		io.sockets.in(data.uid).emit('gameUpdate', game);
		socket.emit('gameUpdate', {});
	}

	sendGameList();
}

export function updateGameChat(socket, data, uid) {
	let game = games.find((el) => {
		return el.uid === uid;
	});

	game.chats.push(data);
	io.sockets.in(uid).emit('gameUpdate', game);
}

export function startGameCountdown(socket, uid) {
	let game = games.find((el) => {
		return el.uid === uid;
	}),
	seconds = 2,
	countDown = setInterval(() => {
		if (seconds === 0) {
			clearInterval(countDown);
			startGame(game);
		} else {
			game.status = `Seats full!  Game starts in ${seconds} second${seconds === 1 ? '' : 's'}.`;
		}

		seconds--;
		io.sockets.in(uid).emit('gameUpdate', game);
	}, 1000);

	game.inProgress = true;
}