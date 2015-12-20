'use strict';

import mongoose from 'mongoose';
import GameSettings from '../../models/gamesettings';
import { secureGame } from './game.js';

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
		socket.emit('gameUpdate', secureGame(games[gameIndex]));
	}
}

export function handleUpdatedGameSettings(socket, data) {
	let username = socket.handshake.session.passport.user;

	socket.set('nickname', username);

	GameSettings.findOne({username}, (err, settings) => {
		settings.gameSettings = data;
		settings.save();
		socket.emit('gameSettings', settings);
	});
}

export function sendUserGameSettings(socket) {
	try {
		var username = socket.handshake.session.passport.user;  // todo: this errors out some times/is undefined
	} catch (e) {
		console.log(e);
	}
	
	GameSettings.findOne({username}, (err, settings) => {
		if (err) {
			console.log(err);
		}

		socket.emit('gameSettings', settings);
	});
}