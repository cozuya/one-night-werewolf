'use strict';

// let Chatroom = require('../models/chatroom');

let gamesInfo = [];

export function createGame(socket, game) {
	gamesInfo.push(game);

	let room = game.uid;

	socket.join(room);
};

export function sendGameInfo(socket, gameID) {
	let game = gamesInfo.find((el) => {
		return el.uid === gameID;
	});

	socket.emit('gameUpdate', game);
};