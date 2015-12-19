'use strict';

import { games, secureGame } from './game.js';
import _ from 'lodash';

export function startGame(game) {  // this fires twice which really can't happen so need to be fixed first
	let roles = game.roles,
		assignRoles = () => {
			let _roles = _.clone(roles);

			for (let seat in game.seated) {
				let roleIndex = Math.floor((Math.random() * _roles.length));

				game.internals[seat].trueRole = _roles[roleIndex];
				_roles.splice(roleIndex, 1);
			}

			_roles.forEach((role) => {  // spread op here?
				game.internals.centerRoles.push(role);
			});
		},
		werewolfRoleCount = roles.filter((role) => {
			return role === 'werewolf';
		}).length,
		werewolvesInCenterCount;

	assignRoles();
	werewolvesInCenterCount = game.internals.centerRoles.filter((role) => {
		return role === 'werewolf';
	}).length;

	if (game.kobk && werewolvesInCenterCount === werewolfRoleCount) {
		// need some sort of do while loop here
	}
	console.log(game.internals);
}