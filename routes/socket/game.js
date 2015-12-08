'use strict';

// let Chatroom = require('../models/chatroom');

let games = [];

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


	if (typeof data.user !== 'undefined') {
		game.seated[`seat${data.seatNumber}`] = data.user;
		game.seatedCount++;
	} else {
		for (let key in game.seated) {
			if (game.seated.hasOwnProperty(key)) {
				if (game.seated[key].userName === socket.handshake.session.passport.user) {
					delete game.seated[key];
					game.seatedCount--;
				}
			}
		}
		socket.leave(game.uid);
	}

	socket.broadcast.to(data.uid).emit('gameUpdate', game).emit('gameUpdate', game);
	sendGameList();
}