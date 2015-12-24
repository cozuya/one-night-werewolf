'use strict';

// let Chatroom = require('../models/chatroom');

import { startGame } from './game-internals.js';
import _ from 'lodash';

let deleteGame = (game) => {
	let index = games.indexOf(game);

	games.splice(index, 1);
};

export let games = [];

export function secureGame(game) {
	let _game = _.clone(game);

	delete _game.internals;
	return _game;
};


export function sendGameList(socket) {
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

	socket.emit('gameList', gameList);
}

export function createGame(socket, game) {
	game.internals = {
		unSeatedGameChats: [],
		seatedPlayers: []
	};

	games.push(game);
	sendGameList(socket);
	socket.join(game.uid);
};

export function sendGameInfo(socket, uid) {
	let game = games.find((el) => {
		return el.uid === uid;
	});

	socket.join(uid);
	socket.emit('gameUpdate', secureGame(game));
}

export function updateSeatedUsers(socket, data) {
	let game = games.find((el) => {
		return el.uid === data.uid;
	});

	if (data.seatNumber !== null) {
		game.seated[`seat${data.seatNumber}`] = data.userInfo;
		game.seatedCount++;
		io.sockets.in(data.uid).emit('gameUpdate', secureGame(game));
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
		io.sockets.in(data.uid).emit('gameUpdate', secureGame(game));
		socket.emit('gameUpdate', {});
	}
	sendGameList(socket);
}

export function updateGameChat(socket, data, uid) {
	let game = games.find((el) => {
			return el.uid === uid;
		});

	data.timestamp = new Date();
	game.chats.push(data);

	if (data.inProgress) {
		let cloneGame = _.clone(game);

		if (data.seat) {
			let tempChats = cloneGame.chats;

			tempChats = tempChats.concat(game.internals.seatedPlayers[data.seat - 1].gameChats);
			tempChats.sort((chat1, chat2) => {
				return chat1.timestamp - chat2.timestamp;
			});
			cloneGame.chats = tempChats;
		}
		io.in(uid).emit('gameUpdate', secureGame(cloneGame));
	} else {
		io.in(uid).emit('gameUpdate', secureGame(game));
	}
}

export function startGameCountdown(uid) {
	let game = games.find((el) => {
		return el.uid === uid;
	}),
	seconds = 2,
	countDown = setInterval(() => {
		if (seconds === 0) {
			clearInterval(countDown);
			startGame(game);
		} else {
			game.status = `Shuffling.. Game starts in ${seconds} second${seconds === 1 ? '' : 's'}.`;
			io.sockets.in(uid).emit('gameUpdate', secureGame(game));
		}
		seconds--;
	}, 1000);

	game.inProgress = true;
}