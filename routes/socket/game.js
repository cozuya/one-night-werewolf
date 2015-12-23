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

	sendGameList();
}

export function updateGameChat(socket, data, uid) {
	let game = games.find((el) => {
		return el.uid === uid;
	});

	game.chats.push(data);

	if (data.isSeated && data.inProgress) {
		updateGameChatForSeatedPlayingUser(game, socket, data, uid);
	} else {
		io.sockets.in(uid).emit('gameUpdate', secureGame(game));
	}

	console.log(socket.handshake.session.passport.user);
	console.log(socket.id);
}

let updateGameChatForSeatedPlayingUser = (game, socket, data, uid) => {
	let user = game.internals[data.seat], // changing
		chats = game.chats;

	chats.concat(game.internals[game.internals.indexOf]); // changing
	
	chats.sort((chat1, chat2) => {
		return chat1.timestamp - chat2.timestamp;
	});

	socket.in(uid).emit('gameUpdate', secureGame(game));
};

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
		}

		seconds--;
		io.sockets.in(uid).emit('gameUpdate', secureGame(game));
	}, 1000);

	game.inProgress = true;
}