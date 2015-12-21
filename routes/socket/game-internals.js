'use strict';

import { games, secureGame } from './game.js';
import _ from 'lodash';

export function startGame(game) {
	let allWerewolvesNotInCenter = false,
		assignRoles = () => {
			let _roles = _.clone(game.roles);

			for (let seat in game.seated) {
				let roleIndex = Math.floor((Math.random() * _roles.length)),
					role = _roles[roleIndex];

				if (role === 'werewolf' && !allWerewolvesNotInCenter) {
					allWerewolvesNotInCenter = true;
				}

				game.internals[seat].trueRole = role;
				_roles.splice(roleIndex, 1);
			}

			game.internals.centerRoles = [..._roles];
		},
		roomSockets = Object.keys(io.sockets.adapter.rooms[game.uid]).map((sockedId) => {
			return io.sockets.connected[sockedId];
		}),
		playerSockets = roomSockets.filter((socket) => {
			let players = Object.keys(game.seated).map((seat) => {
				return game.seated[seat].userName;
			});

			return players.indexOf(socket.handshake.session.passport.user) >= 0;
		});

	assignRoles();

	if (game.kobk && !allWerewolvesNotInCenter) {
		while (!allWerewolvesNotInCenter) {
			assignRoles();
		}
	}

	for (let seat in game.seated) {
		let userName = game.seated[seat].userName,
			socket = playerSockets.find((player) => {
				return player.handshake.session.passport.user === userName;
			});

		game.internals[seat].userName = userName;
		game.internals[seat].socket = socket;
		game.internals[seat].gameChats = [];

		sendNewGameChat(game, userName, `The game begins and you receive the ${game.internals[seat].trueRole.toUpperCase()} role.`);
	}

	sendNewGameChat(game, undefined, 'The game begins.');
	// beginNightPhase();  todo
}

let sendNewGameChat = (game, userName, message) => {
	let chat = {
		userName,
		timestamp: new Date(),
		chat: message,
		gameChat: true
	},
	cloneGame = _.clone(game),
	user = game.internals.find((seat) => {
		return seat.userName === userName;
	}),
	currentChats = cloneGame.chats,
	socket = user.socket;

	console.log(user);
	user.gameChats.push(chat);

	// todo: not totally straight best way to go forward on this is yet.

}