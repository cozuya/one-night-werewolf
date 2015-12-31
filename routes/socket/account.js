'use strict';

import mongoose from 'mongoose';
import GameSettings from '../../models/gamesettings';
import { games } from './game.js';
import { secureGame, getInternalPlayerInGameByUserName } from './util.js';
import { combineInprogressChats } from './gamechat.js';
import _ from 'lodash';

export function checkUserStatus(socket) {
	let gameUserIsIn = games.find((game) => {
		return !!Object.keys(game.seated).find((seat) => {
			return game.seated[seat].userName === socket.handshake.session.passport.user;
		});
	}),
	chats, cloneGame;

	if (gameUserIsIn) {
		let internalPlayer = getInternalPlayerInGameByUserName(gameUserIsIn, socket.handshake.session.passport.user);

		cloneGame = _.clone(gameUserIsIn);
		cloneGame.chats = combineInprogressChats(cloneGame, socket.handshake.session.passport.user);
		cloneGame.tableState.playerPerceivedRole = internalPlayer.perceivedRole;
		socket.join(gameUserIsIn.uid);
		socket.emit('gameUpdate', secureGame(cloneGame));
	}
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