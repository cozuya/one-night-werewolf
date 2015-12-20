'use strict';

import { games, secureGame } from './game.js';
import _ from 'lodash';

export function startGame(game) {
	let roles = game.roles,
		allWerewolvesNotInCenter = false,
		assignRoles = () => {
			let _roles = _.clone(roles);

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
		};

	assignRoles();

	if (game.kobk && !allWerewolvesNotInCenter) {
		console.log('hi');
		while (!allWerewolvesNotInCenter) {
			console.log('there');
			assignRoles();
		}
	}
}