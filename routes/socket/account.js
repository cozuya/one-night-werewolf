'use strict';

import mongoose from 'mongoose';
import GameSettings from '../../models/gamesettings';
import { games, secureGame } from './game.js';
import _ from 'lodash';

export function checkUserStatus(socket) {
	games.forEach((game, i) => {
		let currentGame = Object.keys(game.seated).find((seat) => {
			return game.seated[seat].userName === socket.handshake.session.passport.user;
		});

		if (currentGame) {
			let tempChats = game.chats,
				cloneGame = _.clone(currentGame);

			console.log(cloneGame);	
			socket.join(game.uid);
			socket.emit('gameUpdate', secureGame(cloneGame));
		}
	});
}

export function handleUpdatedGameSettings(socket, data) {
	let username = socket.handshake.session.passport.user;

	GameSettings.findOne({username}, (err, settings) => {
		for (let setting in data) {
			settings.gameSettings[setting] = data[setting];
		}
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