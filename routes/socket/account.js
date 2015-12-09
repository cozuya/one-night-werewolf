'use strict';

export function checkUserStatus(socket, data, games) {
	let gameIndex;

	games.forEach((game, i) => {
		let inGame = Object.keys(game.seated).find((seat) => {
			return game.seated[seat].userName === data.userName;
		});

		if (inGame) {
			gameIndex = i;
		}
	});

	if (gameIndex >= 0) {
		socket.emit('gameUpdate', games[gameIndex]);
	}
}