'use strict';

import mongoose from 'mongoose';
import Account from '../../models/account';
import { games, deleteGame, sendGameList } from './game';
import { secureGame, getInternalPlayerInGameByUserName } from './util';
import { combineInprogressChats } from './gamechat';

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
	}

	io.sockets.emit('userList', {
		list: userList,
		totalSockets: Object.keys(io.sockets.sockets).length
	});
}

export function checkUserStatus(socket) {
	if (socket.handshake.session.passport && Object.keys(socket.handshake.session.passport).length) {
		let { user } = socket.handshake.session.passport,
			sockets = io.sockets.sockets,
			gameUserIsIn = games.find((game) => {
				return Object.keys(game.seated).find((seat) => {
					return game.seated[seat].userName === user;
				});
			}),
			oldSocket = sockets.find((sock) => {
				if (sock.handshake.session.passport && Object.keys(sock.handshake.session.passport).length) {
					return sock.id !== socket.id && sock.handshake.session.passport.user === user;
				}
			});

		if (oldSocket) {
			sockets.splice(sockets.indexOf(oldSocket), 1);
		}

		if (gameUserIsIn && gameUserIsIn.inProgress) {
			let internalPlayer = getInternalPlayerInGameByUserName(gameUserIsIn, user),
				cloneGame = Object.assign({}, gameUserIsIn);

			cloneGame.chats = combineInprogressChats(cloneGame, user);
			socket.join(gameUserIsIn.uid);
			socket.emit('gameUpdate', secureGame(cloneGame));
			socket.emit('updateSeatForUser', internalPlayer.seat);
		}
	} else {
		io.sockets.emit('userList', {
			list: userList,
			totalSockets: Object.keys(io.sockets.sockets).length
		});
	}

	sendGeneralChats(socket);
	sendGameList(socket);
}

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
}

export function sendUserGameSettings(socket, username) {
	Account.findOne(username, (err, account) => {
		if (err) {
			console.log(err);
		}

		socket.emit('gameSettings', account.gameSettings);
		userList.unshift({
			userName: username,
			wins: account.wins,
			losses: account.losses
		});
		io.sockets.emit('userList', {
			list: userList,
			totalSockets: Object.keys(io.sockets.sockets).length
		});
	});
}

export function handleNewGeneralChat(data) {
	if (generalChats.length === 100) {
		generalChats.pop();
		// todo push/save to db
	}

	data.time = new Date();
	generalChats.push(data);

	io.sockets.emit('generalChats', generalChats);
}

export function sendGeneralChats(socket) {
	socket.emit('generalChats', generalChats);
}