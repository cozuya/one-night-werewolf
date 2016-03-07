'use strict';

import mongoose from 'mongoose';
import Account from '../../models/account';
import { games, deleteGame } from './game';
import { secureGame, getInternalPlayerInGameByUserName } from './util';
import { combineInprogressChats } from './gamechat';
import _ from 'lodash';

export let userList = [];
let generalChats = [];

export function handleSocketDisconnect(socket) {
	let { passport } = socket.handshake.session;

	if (passport && Object.keys(passport).length) {
		let userIndex = userList.findIndex((user) => {
				return user.userName === passport.user;
			}),
			game = games.find((game) => {
				return Object.keys(game.seated).find((seatName) => {
					return game.seated[seatName].userName === passport.user;
				});
			});

		userList.splice(userIndex, 1);

		if (game) {
			if (!game.inProgress) {
				let seatedKeys = Object.keys(game.seated),
					userSeatName = seatedKeys.find((seatName) => {
						return game.seated[seatName].userName === passport.user;
					});

				if (seatedKeys.length === 1) {
					deleteGame(game);
				} else {
					delete game.seated[userSeatName];
					io.sockets.in(game.uid).emit('gameUpdate', game);
				}
			}

			io.sockets.emit('gameList', games);					
		}

		io.sockets.emit('userList', {list: userList, totalSockets: Object.keys(io.sockets.sockets).length});
	}
}

export function checkUserStatus(socket) {
	let { user } = socket.handshake.session.passport,
		gameUserIsIn = games.find((game) => {
			return Object.keys(game.seated).find((seat) => {
				return game.seated[seat].userName === user;
			});
		}),
		chats, cloneGame;

	// console.log(user);
	// console.log(gameUserIsIn);

	if (user && gameUserIsIn && gameUserIsIn.inProgress) {
		let internalPlayer = getInternalPlayerInGameByUserName(gameUserIsIn, user);
		cloneGame = _.clone(gameUserIsIn);
		cloneGame.chats = combineInprogressChats(cloneGame, user);
		socket.join(gameUserIsIn.uid);
		socket.emit('gameUpdate', secureGame(cloneGame));
		socket.emit('updateSeatForUser', internalPlayer.seat);
	}
};

export function handleUpdatedGameSettings(socket, data) {
	Account.findOne({username: socket.handshake.session.passport.user}, (err, account) => {
		if (err) {
			console.log(err);
		}

		for (let setting in data) {
			account.gameSettings[setting] = data[setting];
		}

		account.save();
		socket.emit('gameSettings', account.gameSettings);
	});
};

export function sendUserGameSettings(socket) {
	var username;

	try {
		username = socket.handshake.session.passport.user;  // todo: this errors out some times/is undefined
	} catch (e) {
		console.log('sendUserGameSettings errored out');
	}

	Account.findOne({username}, (err, account) => {
		if (err) {
			console.log(err);
		}

		socket.emit('gameSettings', account.gameSettings);
		userList.unshift({
			userName: username,
			wins: account.wins,
			losses: account.losses
		});
		io.sockets.emit('userList', {list: userList, totalSockets: Object.keys(io.sockets.sockets).length});
	});
};

export function handleNewGeneralChat(data) {
	if (generalChats.length === 100) {
		generalChats.pop();
		// todo push/save to db
	}

	data.time = new Date();
	generalChats.push(data);

	io.sockets.emit('generalChats', generalChats);
};

export function sendGeneralChats(socket) {
	socket.emit('generalChats', generalChats);
};