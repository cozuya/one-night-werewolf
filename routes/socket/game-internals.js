'use strict';

import { games, secureGame } from './game.js';
import _ from 'lodash';

export function startGame(game) {  // this fires twice which really can't happen so need to be fixed first
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

			_roles.forEach((role) => {  // spread op here?
				game.internals.centerRoles.push(role);
			});
		};

	assignRoles();

	if (game.kobk && !allWerewolvesNotInCenter) {
		// need some sort of do while loop here
	}
	console.log(game.internals);
}