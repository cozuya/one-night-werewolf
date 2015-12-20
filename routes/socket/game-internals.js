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
		};

	assignRoles();

	if (game.kobk && !allWerewolvesNotInCenter) {
		while (!allWerewolvesNotInCenter) {
			assignRoles();
		}
	}

	let getRoomSockets = () => {
		let sockets = Object.keys(io.sockets.adapter.rooms[game.uid]);
		let _sockets = [];

		for (let id of sockets) {
			_sockets.push(io.sockets.connected[id]);
		}

		return _sockets;
	};
	let roomSocketIds = getRoomSockets();
	console.log(roomSocketIds[0].handshake.session.passport.user);
	console.log(io.sockets.connected);
	// console.log(io.sockets.connected[roomSocketIds[0]]);
	// console.log(io.sockets.connected[roomSocketIds[0]].handshake.session.passport.user);
	// console.log(io.sockets.connected[roomSocketIds[0]].nickname);

}














