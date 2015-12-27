'use strict';

import { games, secureGame } from './game.js';
import { sendInprogressChats } from './gamechat.js';
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
		player.gameChats = [{
			gameChat: true,
			userName: player.userName,
			chat: `The game begins and you receive the ${player.trueRole.toUpperCase()} role.`,
			seat: i + 1,
			timestamp: new Date()
		}];
	});

	game.internals.unSeatedGameChats.push({
		gameChat: true,
		chat: 'The game begins.',
		timestamp: new Date()
	});

	sendInprogressChats(game);
	beginPreNightPhase(game);
}

let beginPreNightPhase = () => {
	// todo: deal with this race condition/overwriting the sendnewgamechat of starting the game
	// game.status = 'Dealing..';
	// io.in(game.uid).emit('gameUpdate', secureGame(game));
}