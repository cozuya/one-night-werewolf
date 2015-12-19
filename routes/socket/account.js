'use strict';

import mongoose from 'mongoose';
import GameSettings from '../../models/gamesettings';

export function checkUserStatus(socket, data, games) {
	let gameIndex;

	games.forEach((game, i) => {
		let inGame = Object.keys(game.seated).find((seat) => {
			return game.seated[seat].userName === socket.handshake.session.passport.user;
		});

		if (inGame) {
			gameIndex = i;
		}
	});

	if (gameIndex >= 0) {
		socket.emit('gameUpdate', games[gameIndex]);
	}
}

export function handleUpdatedGameSettings(socket, data) {
	let username = socket.handshake.session.passport.user;

	GameSettings.findOne({username}, (err, settings) => {
		settings.gameSettings = data;
		settings.save();
		socket.emit('gameSettings', settings);
	});
}

export function sendUserGameSettings(socket) {
	let username = socket.handshake.session.passport.user;

	GameSettings.findOne({username}, (err, settings) => {
		if (err) {
			console.log(err);
		}

		socket.emit('gameSettings', settings);
	});
}