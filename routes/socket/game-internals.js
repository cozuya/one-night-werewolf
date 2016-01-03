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

				if (player.userName === 'jin') {
					player.trueRole = 'robber';
					player.perceivedRole = 'robber';
					player.nightAction = {};
					player.seat = 1;
				}

				if (player.userName === 'paul') {
					player.trueRole = 'werewolf';
					player.perceivedRole = 'werewolf';
					player.nightAction = {};
					player.seat = 2;
				}

				// if (player.userName === 'heihachi') {
				// 	player.trueRole = 'werewolf';
				// 	player.perceivedRole = 'werewolf';
				// 	player.nightAction = {};
				// 	player.seat = 3;
				// }

				// player.trueRole = role;
				// player.perceivedRole = role;
				// player.nightAction = {};
				// player.seat = index + 1;
				// _roles.splice(roleIndex, 1);
			});

			// game.internals.centerRoles = [..._roles];
			game.internals.centerRoles = ['werewolf', 'robber', 'troublemaker', 'robber', 'troublemaker', 'insomniac', 'robber', 'troublemaker']
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
	}, 50);
}

let beginNightPhases = (game) => {
	// round 1: all werewolves minions masons seers and (one robber or troublemaker)
	// round 2 through x: robbercount + troublemaker count minus 1
	// round x+1: all insomniacs

	let phases = [[]],
		roleChangerInPhase1 = false,
		insomniacs = [],
		werewolves, masons;

	game.internals.seatedPlayers.forEach((player) => {
		let playerMap = {
			seer: () => {
				let nightAction = {
					action: 'seer',
					phase: 1,
					gameChat: 'You wake up, and may look at one player\'s card, or two of the center cards.'
				};

				player.nightAction = nightAction;
				phases[0].push(player);
			},
			robber: () => {
				let nightAction = {
					action: 'robber',
					gameChat: 'You wake up, and may exchange your card with another player\'s, and view your new role.'
				};

				player.nightAction = nightAction;

				if (roleChangerInPhase1) {
					player.nightAction.phase = phases.length + 1;
					phases.push([player]);
				} else {
					player.nightAction.phase = 1;
					roleChangerInPhase1 = true;
					phases[0].push(player);
				}
			},
			troublemaker: () => {
				let nightAction = {
					action: 'troublemaker',
					gameChat: 'You wake up, and may switch cards between two other players without viewing them.'
				};

				player.nightAction = nightAction;
				player.nightAction.action = 'troublemaker';
				if (roleChangerInPhase1) {
					player.nightAction.phase = phases.length + 1;
					phases.push([player]);
				} else {
					player.nightAction.phase = 1;
					roleChangerInPhase1 = true;
					phases[0].push(player);
				}
			},
			insomniac: () => {
				let nightAction = {
					action: 'insomniac',
					gameChat: 'You wake up, and may view your card again.',
					completed: false
				};

				player.nightAction = nightAction;
				player.nightAction.action = 'insomniac';
				insomniacs.push(player);
			},
			werewolf: () => {
				phases[0].push(player);
			},
			minion: () => {
				phases[0].push(player);
			},
			mason: () => {
				phases[0].push(player);
			},
			villager: () => {
				return;
			},
			hunter: () => {
				return;
			},
			tanner: () => {
				return;
			}
		};

		playerMap[player.trueRole]();
	});

	if (insomniacs.length) {
		insomniacs.forEach((player) => {
			player.nightAction.phase = phases.length + 1;
		});

		phases.push([...insomniacs]);
	}

	werewolves = phases[0].filter((player) => {
		return player.trueRole === 'werewolf';
	});

	masons = phases[0].filter((player) => {
		return player.trueRole === 'mason';
	});

	phases[0].forEach((player) => {
		let playerMap = {
			werewolf: () => {
				let others = werewolves.map((werewolf) => {
						return werewolf.userName;
					}).filter((userName) => {
						return userName !== player.userName;
					}),
					nightAction = {
						action: 'werewolf',
						phase: 1,
						completed: false
					},
					message;
			
				if (werewolves.length === 1) {
					nightAction.singleWerewolf = true;
					message = 'You wake up, and see no other WEREWOLVES. You may look at a center card';				
				} else {
					message = 'You wake up, and see that the other WEREWOLVES in this game are:';
				}

				others.forEach((userName) => {
					message += ' ';
					message += userName.toUpperCase();
				});

				message += '.';
				nightAction.gameChat = message;
				player.nightAction = nightAction;
			},
			minion: () => {
				let others = werewolves.map((werewolf) => {
						return werewolf.userName;
					}),
					nightAction = {
						action: 'minion',
						others,
						phase: 1
					},
					message;

				if (!werewolves.length) {
					message = 'You wake up, and see that there are no WEREWOLVES. Be careful - you lose if no villager is eliminated'
				} else {
					message = 'You wake up, and see that the WEREWOLVES in this game are: ';
				}

				others.forEach((userName) => {
					message += ' ';
					message += userName.toUpperCase();
				});

				message += '.';

				nightAction.gameChat = message;
				player.nightAction = nightAction;
			},
			mason: () => {
				let others = masons.map((mason) => {
						return mason.userName;
					}).filter((userName) => {
						return userName !== player.userName;
					}),
					nightAction = {
						action: 'mason',
						phase: 1
					},
					message;

				if (!others.length === 1) {
					message = 'You wake up, and see that you are the only mason';
				} else {
					message = 'You wake up, and see that the MASONS in this game are: ';				
				}

				others.forEach((userName) => {
					message += ' ';
					message += userName.toUpperCase();
				});

				message += '.';			

				nightAction.gameChat = message;
				player.nightAction = nightAction;
			},
			troublemaker: () => {
				return;
			},
			robber: () => {
				return;
			},
			seer: () => {
				return;
			},
			insomniac: () => {
				return;
			},
			villager: () => {
				return;
			},
			hunter: () => {
				return;
			},
			tanner: () => {
				return;
			}
		};

		playerMap[player.trueRole]();
	});

	game.tableState.isNight = true;
	game.status = 'Night begins..';
	sendInprogressChats(game);
	setTimeout(() => {
		game.tableState.phase = 1;
		nightPhases(game, phases);
	}, 3000);
}

let nightPhases = (game, phases) => {
	let phasesIndex = 0,
		phasesCount = phases.length,
		phasesTimer,
		phasesFn = () => {
			if (phasesIndex === phasesCount && phasesCount > 1) {
				// todo this whole block doesn't work.
				clearInterval(phasesTimer);
				game.tableState.isNight = false;
				game.status = 'Day begins..';
				game.internals.seatedPlayers.forEach((player, i) => {
					player.gameChats.push = {
						gameChat: true,
						userName: player.userName,
						chat: 'Night ends and the day phase begins.',
						seat: i + 1,
						timestamp: new Date()
					};
				});
				sendInprogressChats(game);
				setTimeout(() => {
					dayPhase(game);
				}, 50);
			} else {
				let seconds = 10,
					countDown,
					phasesPlayers = phases[phasesIndex];

				phasesPlayers.forEach((player) => {
					let chat = {
						gameChat: true,
						userName: player.userName,
						chat: player.nightAction.gameChat,
						seat: player.seat,
						timestamp: new Date()
					};
					
					player.gameChats.push(chat);
				});

				countDown = setInterval(() => {
					if (seconds === 0) {
						phasesPlayers.forEach((player) => {
							player.nightPhaseComplete = true;
							player.nightAction = {};
						});
						phasesIndex++;
						game.tableState.phase++;
						sendInprogressChats(game);
						clearInterval(countDown);
					} else {
						game.status = `Night phase ${phases.length === 1 ? 1 : (phasesIndex).toString()} of ${phasesCount} ends in ${seconds} second${seconds === 1 ? '' : 's'}.`;
						game.wtf = true;
						sendInprogressChats(game);
					}
					seconds--;
				}, 1000);
			}
		};

	phasesFn();

	if (phases.length > 1) {
		phasesIndex++;
		phasesTimer = setInterval(phasesFn, 10000);
	}
}

let dayPhase = (game) => {
	console.log('day starts');
}