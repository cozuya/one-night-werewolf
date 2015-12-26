'use strict';

import { games, secureGame } from './game.js';
import _ from 'lodash';

export function getSocketsByUid(uid) {
	let game = games.find((el) => {
			return el.uid === uid;
		}),
		seatedPlayerNames = Object.keys(game.seated).map((seat) => {
			return game.seated[seat].userName;
		}),
		sockets = {},
		roomSockets = Object.keys(io.sockets.adapter.rooms[game.uid]).map((sockedId) => {
			return io.sockets.connected[sockedId];
		});

		sockets.playerSockets = roomSockets.filter((socket) => {
			return seatedPlayerNames.indexOf(socket.handshake.session.passport.user) >= 0;
		}),
		sockets.observerSockets = roomSockets.filter((socket) => {
			return seatedPlayerNames.indexOf(socket.handshake.session.passport.user) === -1;
		});

	return sockets;
}

export function startGame(game) {
	let allWerewolvesNotInCenter = false,
		assignRoles = () => {
			let _roles = _.clone(game.roles);

			game.internals.seatedPlayers.map((player, index) => {
				let roleIndex = Math.floor((Math.random() * _roles.length)),
					role = _roles[roleIndex];

				if (role === 'werewolf' && !allWerewolvesNotInCenter) {
					allWerewolvesNotInCenter = true;
				}

				player.trueRole = role;
				player.seat = index + 1;
				_roles.splice(roleIndex, 1);
			});

			game.internals.centerRoles = [..._roles];
		},
		chat = {
			timestamp: new Date(),
			gameChat: true,
			inProgress: true
		};

	Object.keys(game.seated).map((seat, i) => {
		return game.internals.seatedPlayers[i] = {
			userName: game.seated[seat].userName
		};
	});

	assignRoles();

	if (game.kobk && !allWerewolvesNotInCenter) {
		while (!allWerewolvesNotInCenter) {
			assignRoles();
		}
	}

	game.internals.seatedPlayers.forEach((player, i) => {
		// let userName = player.userName
		// ,
		// 	socket = sockets.playerSockets.find((playerSocket) => {
		// 		return playerSocket.handshake.session.passport.user === userName;
		// 	})
			;

		chat.userName = player.userName;
		chat.chat= `The game begins and you receive the ${player.trueRole.toUpperCase()} role.`;

		player.gameChats = [];
		updateInprogressChat(game, chat, player);
	});

	updateInprogressChat(game, chat);
	beginPreNightPhase(game);
}

export function updateInprogressChat(game, chat, player) {
	// todo: verify that all this works for game and non game.

	let cloneGame = _.clone(game),
		gameChats = player ? player.gameChats : game.internals.unSeatedGameChats,
		sockets = getSocketsByUid(game.uid),
		tempChats;

	if (chat.gameChat) {
		gameChats.push(chat);
	} else {
		game.chats.push(chat);
	}

	tempChats = gameChats.concat(cloneGame.chats);
	tempChats.sort((chat1, chat2) => {
		return chat1.timestamp - chat2.timestamp;
	});
	cloneGame.chats = tempChats;

	if (chat.gameChat) {
		if (player) {
			let playerSocket = sockets.playerSockets.find((sock) => {
				return player.userName === sock.handshake.session.passport.user;
			});

			playerSocket.emit('gameUpdate', secureGame(cloneGame));
		} else {
			sockets.observerSockets.forEach((socket) => {
				socket.emit('gameUpdate', secureGame(cloneGame));
			});
		}
	} else {
		io.in(game.uid).emit('gameUpdate', secureGame(game));
	}
}

let beginPreNightPhase = () => {
	// todo: 12/25 - deal with this race condition/overwriting the sendnewgamechat of starting the game
	// game.status = 'Dealing..';
	// io.in(game.uid).emit('gameUpdate', secureGame(game));
}