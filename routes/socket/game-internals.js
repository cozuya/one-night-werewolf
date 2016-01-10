'use strict';

import { games } from './game.js';
import { secureGame } from './util.js';
import { sendInprogressChats } from './gamechat.js';
import { updatedTrueRoles } from './game-nightactions.js';
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
					player.trueRole = 'seer';
					player.perceivedRole = 'seer';
					player.nightAction = {};
					player.seat = 1;
				}

				if (player.userName === 'paul') {
					player.trueRole = 'werewolf';
					player.perceivedRole = 'werewolf';
					player.nightAction = {};
					player.seat = 2;
				}

				if (player.userName === 'heihachi') {
					player.trueRole = 'troublemaker';
					player.perceivedRole = 'troublemaker';
					player.nightAction = {};
					player.seat = 3;
				}

				// player.trueRole = role;
				// player.perceivedRole = role;
				// player.nightAction = {};
				// player.seat = index + 1;
				// _roles.splice(roleIndex, 1);
			});

			// game.internals.centerRoles = [..._roles];
			game.internals.centerRoles = ['werewolf', 'robber', 'troublemaker', 'robber', 'troublemaker', 'insomniac', 'robber', 'troublemaker'];
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
		let seconds = 1, // 5
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
		switch (player.trueRole) {
			case 'seer':
				player.nightAction = {
					action: 'seer',
					phase: 1,
					gameChat: 'You wake up, and may look at one player\'s card, or two of the center cards.'
				};
				phases[0].push(player);
				break;

			case 'robber':
				player.nightAction = {
					action: 'robber',
					gameChat: 'You wake up, and may exchange your card with another player\'s, and view your new role.'
				};

				if (roleChangerInPhase1) {
					player.nightAction.phase = phases.length + 1;
					phases.push([player]);
				} else {
					player.nightAction.phase = 1;
					roleChangerInPhase1 = true;
					phases[0].push(player);
				}
				break;
			
			case 'troublemaker':
				player.nightAction = {
					action: 'troublemaker',
					gameChat: 'You wake up, and may switch cards between two other players without viewing them.'
				};
				player.nightAction.action = 'troublemaker';

				if (roleChangerInPhase1) {
					player.nightAction.phase = phases.length + 1;
					phases.push([player]);
				} else {
					player.nightAction.phase = 1;
					roleChangerInPhase1 = true;
					phases[0].push(player);
				}
				break;

			case 'insomniac':
				player.nightAction = {
					action: 'insomniac',
					gameChat: 'You wake up, and may view your card again.',
					completed: false
				};

				player.nightAction.action = 'insomniac';
				insomniacs.push(player);
				break;

			default:
				if (player.trueRole === 'werewolf' || player.trueRole === 'minion' || player.trueRole === 'mason') {
					phases[0].push(player);
				}
				break;
		};
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
		let others, nightAction, message;

		switch (player.trueRole) {
			case 'werewolf':
				nightAction = {
					action: 'werewolf',
					phase: 1,
					completed: false
				},
			
				others = werewolves.map((werewolf) => {
					return werewolf.userName;
				}).filter((userName) => {
					return userName !== player.userName;
				});

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
				nightAction.otherSeats = werewolves.map((player) => {
					return player.seat;
				});
				player.nightAction = nightAction;
				break;

			case 'minion':
				nightAction = {
					action: 'minion',
					phase: 1
				};

				others = werewolves.map((werewolf) => {
					return werewolf.userName;
				});

				if (!werewolves.length) {
					message = 'You wake up, and see that there are no WEREWOLVES in this game. Be careful - you lose if no villager is eliminated'
				} else {
					message = 'You wake up, and see that the WEREWOLVES in this game are: ';
				}

				others.forEach((userName) => {
					message += ' ';
					message += userName.toUpperCase();
				});

				message += '.';

				nightAction.others = werewolves.map((werewolf) => {
					return werewolf.seat;
				});
				nightAction.gameChat = message;
				player.nightAction = nightAction;
				break;
			
			case 'mason': {
				let otherMasons = masons.filter((mason) => {
						return mason.userName !== player.userName;
					}),
					otherMasonsNames = otherMasons.map((mason) => {
						return mason.userName;
					}),
					otherMasonsSeatNumbers = otherMasons.map((mason) => {
						return mason.seat;
					});
				
				nightAction = {
					action: 'mason',
					phase: 1
				};

				if (!otherMasons.length === 1) {
					message = 'You wake up, and see that you are the only mason';
				} else {
					message = 'You wake up, and see that the MASONS in this game are: ';				
				}

				otherMasonsNames.forEach((userName) => {
					message += ' ';
					message += userName.toUpperCase();
				});

				message += '.';		

				nightAction.others = otherMasonsSeatNumbers;
				nightAction.gameChat = message;
				player.nightAction = nightAction;
			}
		}
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
		endPhases = () => {
			clearInterval(phasesTimer);
			game.tableState.isNight = false;
			game.status = 'Day begins..';
			game.internals.seatedPlayers.forEach((player, i) => {
				player.gameChats.push({
					gameChat: true,
					userName: player.userName,
					chat: 'Night ends and the day begins.',						
					seat: i + 1,
					timestamp: new Date()
				});
			});

			// todo unseated game chat
			sendInprogressChats(game);
			setTimeout(() => {
				dayPhase(game);
			}, 50);
		},
		phasesFn = () => {
			if (phasesIndex === phasesCount && phasesCount > 1) {
				endPhases();
			} else {
				let seconds = 1, // 10
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

						if (updatedTrueRoles.length) {
							game.internals.seatedPlayers.map((player, index) => {
								player.trueRole = updatedTrueRoles[index];

								return player;
							});
						}
						
						phasesIndex++;
						game.tableState.phase++;
						sendInprogressChats(game);
						if (phasesCount === 1) {
							endPhases();
						}
						clearInterval(countDown);
					} else {
						game.status = `Night phase ${phases.length === 1 ? 1 : (phasesIndex).toString()} of ${phasesCount} ends in ${seconds} second${seconds === 1 ? '' : 's'}.`;
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

export function updateSelectedElimination(data) {
	let game = games.find((el) => {
			return el.uid === data.uid;
		}),
		player = game.internals.seatedPlayers[parseInt(data.seatNumber) - 1];

	player.selectedForElimination = parseInt(data.selectedForElimination - 1);	
};

let dayPhase = (game) => {
	let seconds = (() => {
		let _time = game.time.split(':');

		return !_time[0] ? parseInt(_time[1]) : parseInt(_time[0]) * 60 + parseInt(_time[1]);
	})(),
	countDown = setInterval(() => {
		if (seconds === 0) {
			clearInterval(countDown);
			// todo: "the game ends!" both gamechat
			eliminationPhase(game);
		} else {
			let status;

			if (seconds < 60) {
				status = `Day ends in ${seconds} second${seconds === 1 ? '' : 's'}`;

				if (seconds === 15) {
					game.internals.seatedPlayers.forEach((player) => {
						player.gameChats.push({
							gameChat: true,
							userName: player.userName,
							chat: 'The game is coming to an end and you must select a player for elimination.',
							seat: player.seat,
							timestamp: new Date()
						});

						// todo unseated game chat
					});
					game.tableState.isVotable = {
						enabled: true,
						completed: false
					};
				}

				if (seconds < 15) {
					status += '. VOTE NOW';
				}

				status += '.';
			} else {
				let minutes = Math.floor(seconds / 60),
					remainder = seconds - minutes * 60;

				status = `Day ends in ${minutes}: ${remainder < 10 ? `0${remainder}` : remainder}.`;  // yo dawg, I heard you like template strings.
			}

			game.status = status;
			sendInprogressChats(game);
			seconds--;
		}
	}, 1000);
};

let eliminationPhase = (game) => {
	console.log('elim starts');
	game.tableState.phase = 'elimination';

	game.internals.seatedPlayers.forEach((player, index) => {
		if (!player.selectedForElimination) {
			player.selectedForElimination = index === 6 ? '0' : (index + 1).toString();
		}
	});

	sendInprogressChats(game);

	console.log(game.internals.seatedPlayers[0]);
};