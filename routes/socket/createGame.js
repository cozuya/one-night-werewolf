'use strict';

// let Chatroom = require('../models/chatroom');

let gamesInfo = [];

export function createGame(socket, game) {
	let room = game.uid;

	gamesInfo.push(game);

	socket.join(room);
};

export function sendGameInfo(socket, gameID) {
	let game = gamesInfo.find((el) => {
		return el.uid === gameID;
	});

	socket.emit('gameUpdate', game);
};

export function updateGameInfo(data) {
	let game = games.find((el) => {
		return el.uid === data.gameID;
	}),
	index = games.indexOf(game);

	games[index].seated[`seat${data.seatNumber}`] = data.user;
	sendGameInfo();
}