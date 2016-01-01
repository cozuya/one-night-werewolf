'use strict';

import { games } from './game.js';
import { secureGame } from './util.js';
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
				player.perceivedRole = role;
				player.nightAction = {};
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

	game.status = 'Dealing..';
	game.tableState.cardsDealt = 'in progress';
	io.in(game.uid).emit('gameUpdate', secureGame(game));

	setTimeout(() => {
		let seconds = 1,
			countDown;

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

		game.tableState.cardsDealt = true;
		sendInprogressChats(game);
		countDown = setInterval(() => {
			if (seconds === 0) {
				clearInterval(countDown);
				beginNightPhases(game);
			} else {
				game.status = `Night begins in ${seconds} second${seconds === 1 ? '' : 's'}.`;
				sendInprogressChats(game);
			}
			seconds--;
		}, 1000);
	}, 2000);
}

let beginNightPhases = (game) => {
	// round 1: all werewolves minions masons seers and (one robber or troublemaker)
	// round 2 through x: robbercount + troublemaker count minus 1
	// round x+1: all insomniacs

	let phases = [[]],
		roleChangerInPhase1 = false,
		werewolfCount = 0,
		insomniacs = [];

	game.internals.seatedPlayers.forEach((player) => {
		switch (player.trueRole) {
			case 'werewolf':
				werewolfCount++;
				phases[0].push(player);
				break;
			case 'minion':
				phases[0].push(player);
				break;
			case 'mason':
				phases[0].push(player);
				break;
			case 'seer':
				player.nightAction.action = 'seer';
				phases[0].push(player);
				break;
			case 'robber':
				player.nightAction.action = 'robber';
				if (roleChangerInPhase1) {
					phases.push([player]);
				} else {
					roleChangerInPhase1 = true;
					phases[0].push(player);
				}
				break;
			case 'troublemaker':
				player.nightAction.action = 'troublemaker';
				if (roleChangerInPhase1) {
					phases.push([player]);
				} else {
					roleChangerInPhase1 = true;
					phases[0].push(player);
				}
				break;
			case 'insomniac':
				player.nightAction.action = 'insomniac';
				insomniacs.push(player);
				break;
		}
	});

	if (insomniacs.length) {
		phases.push([...insomniacs]);
	}

	phases[0].forEach((phasePlayers) => {
		let werewolves = phasePlayers.filter((player) => {
				if (player.trueRole === 'werewolf') {
					return player.userName;
				}
			}),
			masons = phasePlayers.filter((player) => {
				if (player.trueRole === 'mason') {
					return player.userName;
				}
			});

		// todo: set up gamechat text for all werewolves minions and masons.  Should do this here.

		phasePlayers.forEach((player) => {
			if (player.trueRole === 'werewolf') {
				player.nightAction = {
					action: 'werewolf',
					werewolves
				};
			}

			if (player.trueRole === 'minion') {
				player.nightAction = {
					action: 'minion',
					werewolves
				};
			}

			if (player.trueRole === 'mason') {
				player.nightAction = {
					action: 'mason',
					masons
				};
			}
		});
	});

	game.tableState.isNight = true;
	nightPhases(game, phases, werewolfCount);
}

let nightPhases = (game, phases, werewolfCount) => {
	phases.forEach((phasePlayers, index) => {   // not working as desired
		let seconds = 10,
			countDown;

		countDown = setInterval(() => {
			if (seconds === 0) {
				clearInterval(countDown);
				phasePlayers.forEach((player) => {
					player.nightAction = undefined;
				});
				sendInprogressChats(game);
			} else {
				game.status = `Night phase ${(index + 1).toString()} of ${phases.length} ends in ${seconds} second${seconds === 1 ? '' : 's'}.`;
				sendInprogressChats(game);
			}
			seconds--;
		}, 1000);
	});


	console.log(phases);
}





