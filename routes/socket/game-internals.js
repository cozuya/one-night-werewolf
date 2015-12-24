'use strict';

import { games, secureGame } from './game.js';
import _ from 'lodash';

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
		seatedPlayerNames = Object.keys(game.seated).map((seat) => {
				return game.seated[seat].userName;
		}),
		roomSockets = Object.keys(io.sockets.adapter.rooms[game.uid]).map((sockedId) => {
			return io.sockets.connected[sockedId];
		}),
		playerSockets = roomSockets.filter((socket) => {
			return seatedPlayerNames.indexOf(socket.handshake.session.passport.user) >= 0;  // todo: need to check against non logged in users
		}),
		observerSockets = roomSockets.filter((socket) => {
			return seatedPlayerNames.indexOf(socket.handshake.session.passport.user) === -1;
		});

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
		let userName = player.userName,
			socket = _.find(playerSockets, (playerSocket) => {
				return playerSocket.handshake.session.passport.user === userName;
			});

		player.socket = socket;
		player.gameChats = [];
		sendNewGameChat(game, player, `The game begins and you receive the ${player.trueRole.toUpperCase()} role.`);
	});

	sendNewGameChat(game, undefined, 'The game begins.', observerSockets);
	beginPreNightPhase(game);
}

let sendNewGameChat = (game, player, message, observerSockets) => {
	let userName = player ? player.userName : undefined,
		chat = {
			userName,
			timestamp: new Date(),
			chat: message,
			gameChat: true,
			inProgress: true
		},
		cloneGame = _.clone(game),
		gameChats = userName ? player.gameChats : game.internals.unSeatedGameChats,
		tempChats;

	gameChats.push(chat);

	tempChats = gameChats.concat(cloneGame.chats);
	tempChats.sort((chat1, chat2) => {
		return chat1.timestamp - chat2.timestamp;
	});
	cloneGame.chats = tempChats;

	if (player) {
		player.socket.emit('gameUpdate', secureGame(cloneGame));
	} else {
		observerSockets.forEach((socket) => {
			socket.emit('gameUpdate', secureGame(cloneGame));
		});
	}
}

let beginPreNightPhase = () => {
	// todo: 12/25 - deal with this race condition/overwriting the sendnewgamechat of starting the game
	// game.status = 'Dealing..';
	// io.in(game.uid).emit('gameUpdate', secureGame(game));
}