'use strict';

let Game = require('../../models/game'),
	Account = require('../../models/account'),
	{ games, userList } = require('./models'),
	{ secureGame, devStatus } = require('./util'),
	{ sendInProgressGameUpdate } = require('./user-events'),
	{ sendGameList } = require('./user-requests'),
	startGameCountdown = (game) => {
		let { startGamePause } = devStatus,
			countDown;

		game.gameState.isStarted = true;
		Object.keys(game.seated).forEach((seat, index) => {
			game.internals.seatedPlayers[index].userName = game.seated[seat].userName;
			game.internals.seatedPlayers[index].seatNumber = index;
		});

		countDown = setInterval(() => {
			if (startGamePause === 0) {
				clearInterval(countDown);
				startGame(game);
			} else {
				game.status = `Game starts in ${startGamePause} second${startGamePause === 1 ? '' : 's'}.`;
				sendInProgressGameUpdate(game);
			}
			startGamePause--;
		}, 1000);
	},
	highlightSeats = (player, seats, type) => {
		if (typeof seats === 'string') {
			switch (seats) {
				case 'nonplayer':
					player.tableState.seats.forEach((seat, index) => {
						if (index !== player.seatNumber) {
							seat.highlight = type;
						}
					});
					break;

				case 'otherplayers':
					player.tableState.seats.forEach((seat, index) => {
						if (index < 7 && index !== player.seatNumber) {
							seat.highlight = type;
						}
					});
					break;

				case 'centercards':
					player.tableState.seats.forEach((seat, index) => {
						if (index > 6) {
							seat.highlight = type;
						}
					});
					break;

				case 'player':
					player.tableState.seats[player.seatNumber].highlight = type;
					break;

				case 'clear':
					player.tableState.seats.forEach((seat) => {
						if (seat.highlight) {
							delete seat.highlight;
						}
					});
					break;
			}
		} else {
			seats.forEach((seatNumber) => {
				player.tableState.seats[seatNumber].highlight = type;
			});
		}
	};

module.exports.updateSeatedUsers = (socket, data) => {
	let game = games.find((el) => {
			return el.uid === data.uid;
		}),
		socketSession = socket.handshake.session;

	if (game) {
		socket.join(data.uid);
	}

	if (socketSession.passport && data.seatNumber && socketSession.passport.user === data.userInfo.userName) {
		game.seated[`seat${data.seatNumber}`] = {
			userName: data.userInfo.userName
		};
		game.seated[`seat${data.seatNumber}`].connected = true;

		if (Object.keys(game.seated).length === devStatus.seatedCountToStartGame) {
			startGameCountdown(game);
		} else {
			io.sockets.in(data.uid).emit('gameUpdate', secureGame(game));
		}

		sendGameList();
	} else if (game) {
		let completedDisconnectionCount = 0;

		if (game.gameState.isCompleted) {
			let playerSeat = Object.keys(game.seated).find((seatName) => {
				return game.seated[seatName].userName === data.userName;
			});

			game.seated[playerSeat].connected = false;
			Object.keys(game.seated).forEach((seatName) => {
				if (!game.seated[seatName].connected) {
					completedDisconnectionCount++;
				}
			});
			sendGameList(socket);
		} else {
			for (let key in game.seated) {
				if (game.seated[key].userName === socketSession.passport.user) {
					delete game.seated[key];
				}
			}
			sendGameList();
		}

		if (completedDisconnectionCount === 7) {
			let saveGame = new Game({
				uid: game.uid,
				time: game.time,
				date: new Date(),
				roles: game.roles,
				winningPlayers: game.internals.seatedPlayers.filter((player) => {
					return player.wonGame;
				}).map((player) => {
					return {
						userName: player.userName,
						originalRole: player.originalRole,
						trueRole: player.trueRole
					};
				}),
				losingPlayers: game.internals.seatedPlayers.filter((player) => {
					return !player.wonGame;
				}).map((player) => {
					return {
						userName: player.userName,
						originalRole: player.originalRole,
						trueRole: player.trueRole
					};
				}),
				reports: Object.keys(game.gameState.reportedGame).filter((seatNumber) => {
					return game.gameState.reportedGame[seatNumber];
				}).map((seatNumber) => {
					return game.internals.seatedPlayers[seatNumber].userName;
				}),
				kobk: game.kobk,
				chats: game.chats.filter((chat) => {
					return !chat.gameChat;
				})
			});

			saveGame.save();
		}


		socket.leave(game.uid);
		if (Object.keys(game.seated).length === 0 || completedDisconnectionCount === 7) {
			socket.emit('gameUpdate', {}, data.isSettings);
			io.sockets.in(data.uid).emit('gameUpdate', {});
			games.splice(games.indexOf(game), 1);
			sendGameList();
		} else {
			io.sockets.in(data.uid).emit('gameUpdate', secureGame(game));
			socket.emit('gameUpdate', {}, data.isSettings);
		}
	}
};

let startGame = (game) => {
	let allWerewolvesNotInCenter = false,
		assignRoles = () => {
			let _roles = [...game.roles];
			game.internals.seatedPlayers.forEach((player, index) => {
				let roleIndex = Math.floor((Math.random() * _roles.length)),
					role = _roles[roleIndex];

				if (role === 'werewolf' && !allWerewolvesNotInCenter) {
					allWerewolvesNotInCenter = true;
				}

				player.trueRole = role;
				player.originalRole = role;
				_roles.splice(roleIndex, 1);
			});

			game.internals.centerRoles = [..._roles];
		};

	assignRoles();

	if (game.kobk && !allWerewolvesNotInCenter) {
		while (!allWerewolvesNotInCenter) {
			assignRoles();
		}
	}

	game.status = 'Dealing..';
	game.gameState.cardsDealt = true;
	sendInProgressGameUpdate(game);	

	setTimeout(() => {
		let nightPhasePause = devStatus.nightPhasePause,
			countDown;
		game.internals.seatedPlayers.forEach((player, index) => {
			player.gameChats.push({
				gameChat: true,
				userName: player.userName,
				chat: [
					{text: 'The game begins and you receive the '},
					{
						text: player.trueRole,
						type: 'roleName'
					},
					{text: ' role.'}
				],
				timestamp: new Date()
			});
			player.tableState.seats[index].role = game.internals.seatedPlayers[index].trueRole;
		});

		game.internals.unSeatedGameChats.push({
			gameChat: true,
			chat: [{text: 'The game begins.'}],
			timestamp: new Date()
		});

		sendInProgressGameUpdate(game);
		countDown = setInterval(() => {
			game.status = `Night begins in ${nightPhasePause} second${nightPhasePause === 1 ? '' : 's'}.`;

			if (nightPhasePause === 0) {
				clearInterval(countDown);
				game.status = 'Night begins..';
				beginNightPhases(game);
			} else if (nightPhasePause === 1) {
				game.internals.seatedPlayers.forEach((player, index) => {
					player.tableState.seats[index].isFlipped = false;
				});
			} else if (nightPhasePause === 4) {
				game.internals.seatedPlayers.forEach((player, index) => {
					player.tableState.seats[index].isFlipped = true;
				});
			}

			sendInProgressGameUpdate(game);
			nightPhasePause--;
		}, 1000);
	}, 50);
};

let beginNightPhases = (game) => {
	// round 1: all werewolves minions masons seers and (one robber or troublemaker)
	// round 2 through x: robbercount + troublemaker count minus 1
	// round x+1: all insomniacs

	let phases = [[]],
		roleChangerInPhase1 = false,
		insomniacs = [],
		werewolves, masons;
	// todo-alpha players phases should be randomized - right now it goes in order of seatnumber and its possible to predict what cards are in the center by which player was last in phases.

	game.internals.seatedPlayers.forEach((player, index) => {
		switch (player.trueRole) {
			case 'seer':
				player.tableState.nightAction = {
					action: 'seer',
					phase: 1,
					gameChat: [{text: 'You wake up, and may look at one player\'s card, or two of the center cards.'}],
					highlight: 'nonplayer'
				};

				phases[0].push(player);
				break;

			case 'robber':
				player.tableState.nightAction = {
					action: 'robber',
					gameChat: [{text: 'You wake up, and may exchange your card with another player\'s, and view your new role (but do not take an additional night action).'}],
					highlight: 'otherplayers'
				};

				if (roleChangerInPhase1) {
					player.tableState.nightAction.phase = phases.length + 1;
					phases.push([player]);
				} else {
					player.tableState.nightAction.phase = 1;
					roleChangerInPhase1 = true;
					phases[0].push(player);
				}
				break;
			
			case 'troublemaker':
				player.tableState.nightAction = {
					action: 'troublemaker',
					gameChat: [{text: 'You wake up, and may switch cards between two other players without viewing them.'}],
					highlight: 'otherplayers'
				};

				if (roleChangerInPhase1) {
					player.tableState.nightAction.phase = phases.length + 1;
					phases.push([player]);
				} else {
					player.tableState.nightAction.phase = 1;
					roleChangerInPhase1 = true;
					phases[0].push(player);
				}
				break;

			case 'insomniac':
				player.tableState.nightAction = {
					action: 'insomniac',
					gameChat: [{text: 'You wake up, and may view your card again.'}],
					highlight: 'player'
				};

				insomniacs.push(player);
				break;

			default:
				if (player.trueRole === 'werewolf' || player.trueRole === 'minion' || player.trueRole === 'mason') {
					phases[0].push(player);
				}
		}
	});
	
	// todo-alpha insert dummy night phases also need to make sure that in cases where there's more than one role-changing role that person isn't ALWAYS in the first available night phase i.e. center cards can have dummy roles in earlier phases

	// game.internals.centerRoles.forEach((role) => {
	// 	let count = 1;

	// 	if (role === 'insomniac' && !insomniacs.length || role === 'robber' || role === 'troublemaker') {
	// 		count++;
	// 	}

	// 	for (let i = 0; i < count; i++) {
	// 		phases.push([]);
	// 	}
	// });

	if (insomniacs.length) {
		insomniacs.forEach((player, index) => {
			player.tableState.nightAction.phase = phases.length + 1;
		});

		phases.push([...insomniacs]);
	}

	werewolves = phases[0].filter((player) => {
		return player.trueRole === 'werewolf';
	});

	masons = phases[0].filter((player) => {
		return player.trueRole === 'mason';
	});

	phases[0].forEach((player, index) => {
		let others, nightAction, message;

		switch (player.trueRole) {
			case 'werewolf':
				nightAction = {
					phase: 1
				},
			
				others = werewolves.filter((werewolf) => {
					return werewolf.userName !== player.userName;
				});

				if (werewolves.length === 1) {
					message = [
						{text: 'You wake up, and see no other ',},
						{
							text: 'werewolves',
							type: 'roleName'
						},
						{text: '. You may look at a center card'}
					];
					nightAction.highlight = 'centercards';
					nightAction.action = 'singleWerewolf';
				} else {
					message = [
						{text: 'You wake up, and see that the other '},
						{
							text: `${others.length > 1 ? 'werewolves' : 'werewolf'}`,
							type: 'roleName'
						},
						{text: ` in this game ${others.length > 1 ? 'are' : 'is'} `}
					];

					werewolves.forEach((player, index) => {
						message.push({
							text: player.userName,
							type: 'playerName'
						});

						if (index <= werewolves.length - 3 && werewolves.length !== 1) {
							message.push({text: ', '});
						}

						if (index === werewolves.length - 2) {
							message.push({text: ' and '});
						}
					});

					nightAction.highlight = others.map((other) => {
						return other.seatNumber;
					});

					nightAction.action = 'werewolf';
				}

				message.push({text: '.'});
				nightAction.gameChat = message;
				player.tableState.nightAction = nightAction;
				break;

			case 'minion':
				nightAction = {
					action: 'minion',
					phase: 1
				};

				if (!werewolves.length) {
					message = [
						{text: 'You wake up, and see that there are no '},
						{
							text: 'werewolves',
							type: 'roleName'
						},
						{text: 'in this game. Be careful - you lose if no village team player is eliminated.'}
					];
					game.internals.soloMinion = true;
				} else {
					message = [
						{text: 'You wake up, and see that the '},
						{
							text: `${werewolves.length === 1 ? 'werewolf' : 'werewolves'}`,
							type: 'roleName'
						},
						{text: ` in this game ${werewolves.length === 1 ? 'is' : 'are'}`}
					];

					werewolves.forEach((player, index) => {
						message.push({text: ' '});

						message.push({
							text: player.userName,
							type: 'playerName'
						});

						if (index >= werewolves.length - 3 && werewolves.length !== 1) {
							message.push({text: ', '});
						}

						if (index === werewolves.length - 2) {
							message.push({text: ' and '});
						}
					});

					nightAction.highlight = werewolves.map((werewolf) => {
						return werewolf.seatNumber;
					});
				}

				message.push({text: '.'});
				nightAction.gameChat = message;
				player.tableState.nightAction = nightAction;
				break;
			
			case 'mason': {
				others = masons.filter((mason) => {
						return mason.userName !== player.userName;
					});

				nightAction = {
					action: 'mason',
					phase: 1
				};

				if (!others.length) {
					message = [
						{text: 'You wake up, and see that you are the only '},
						{
							type: 'roleName',
							text: 'mason'
						}
					];
				} else {
					message = [
						{text: 'You wake up, and see that the '},
						{
							type: 'roleName',
							text: others.length === 1 ? 'mason' : 'masons'
						},
						{text: ` in this game ${others.length == 1 ? 'is' : 'are'} `}
					];

					nightAction.highlight = others.map((other) => {
						return other.seatNumber;
					});

					others.forEach((player, index) => {
						message.push({
							text: player.userName,
							type: 'playerName'
						});

						if (index !== others.length && others.length > 1) {
							message.push({text: ', '});
						}

						if (index === others.length - 1) {
							message.push({text: 'and '});
						}
					});
				}


				message.push({text: '.'});
				nightAction.gameChat = message;
				player.tableState.nightAction = nightAction;
			}
		}
	});
	
	game.gameState.isNight = true;
	sendInProgressGameUpdate(game);
	setTimeout(() => {
		game.gameState.phase = 1;
		nightPhases(game, phases);
	}, 3000);
};

let nightPhases = (game, phases) => {
	let phasesIndex = 0,
		phasesCount = phases.length,
		phasesTimer,
		endPhases = () => {
			clearInterval(phasesTimer);
			game.status = 'Day begins..';
			game.internals.unSeatedGameChats.push({
				gameChat: true,
				chat: [{text: 'Night ends and the day begins.'}],
				timestamp: new Date()
			});
			game.gameState.isNight = false;

			sendInProgressGameUpdate(game);
			setTimeout(() => {
				dayPhase(game);
			}, 50);
		},
		phasesFn = () => {
			if (phasesIndex === phasesCount && phasesCount > 1) {
				endPhases();
			} else {
				let phaseTime = devStatus.phaseTime,
					startPhaseTime = phaseTime,
					countDown,
					phasesPlayers = phases[phasesIndex];

				phasesPlayers.forEach((player) => {
					let chat = {
						gameChat: true,
						userName: player.userName,
						chat: player.tableState.nightAction.gameChat,
						timestamp: new Date()
					};
					
					player.gameChats.push(chat);
				});

				countDown = setInterval(() => {
					if (phaseTime === 0) {	
						phasesIndex++;
						game.gameState.phase++;
						sendInProgressGameUpdate(game);

						if (phasesCount === 1) {
							endPhases();
						}

						clearInterval(countDown);
					} else {
						game.status = `Night phase ${phases.length === 1 ? 1 : (phasesIndex).toString()} of ${phasesCount} ends in ${phaseTime} second${phaseTime === 1 ? '' : 's'}.`;

						if (phaseTime === startPhaseTime - 1 || phaseTime === startPhaseTime - 3) {
							phasesPlayers.forEach((player) => {
								if (player.tableState.nightAction.highlight) {
									highlightSeats(player, player.tableState.nightAction.highlight, 'notify');
								}
							});
						} else if (phaseTime === startPhaseTime - 2 || phaseTime === startPhaseTime - 4) {
							phasesPlayers.forEach((player) => {
								if (player.tableState.nightAction.highlight) {
									highlightSeats(player, 'clear');
								}
							});
						}

						sendInProgressGameUpdate(game);
					}
					phaseTime--;
				}, 1000);
			}
		};

	phasesFn();

	if (phases.length > 1) {
		phasesIndex++;
		phasesTimer = setInterval(phasesFn, 10000);
	}
};

module.exports.updateUserNightActionEvent = (socket, data) => {
	let game = games.find((el) => {
			return el.uid === data.uid;
		}),
		player = game.internals.seatedPlayers.find((player) => {
			return player.userName === data.userName;
		}),
		chat = {
			gameChat: true,
			userName: player.userName,
			timestamp: new Date()
		},
		getTrueRoleBySeatNumber = (num) => {
			num = parseInt(num);

			return num < 7 ? game.internals.seatedPlayers[num].trueRole : game.internals.centerRoles[num - 7];
		},
		updatedTrueRoles = [],
		eventMap = {
			singleWerewolf() {
				let selectedCard = {
					7: 'center left',
					8: 'center middle',
					9: 'center right'
				},
				seat = player.tableState.seats[parseInt(data.action)],
				roleClicked = getTrueRoleBySeatNumber(data.action);

				seat.isFlipped = true;
				seat.role = roleClicked;
				player.tableState.nightAction.completed = true;
				setTimeout(() => {
					seat.isFlipped = false;
					sendInProgressGameUpdate(game);
				}, 3000);
				chat.chat = [
					{text: `You select the ${selectedCard[data.action]} card and it is revealed to be ${selectedCard[data.action] === 'insomniac' ? 'an' : 'a'} `},
					{
						type: 'roleName',
						text: roleClicked
					},
					{text: '.'}
				];
			},
			insomniac() {
				let roleClicked = getTrueRoleBySeatNumber(data.action),
					seat = player.tableState.seats[parseInt(data.action)];

				seat.isFlipped = true;
				seat.role = roleClicked;
				setTimeout(() => {
					seat.isFlipped = false;
					sendInProgressGameUpdate(game);
				}, 3000);				
				player.tableState.nightAction.completed = true;
				chat.chat = [
					{text: `You look at your own card and it is revealed to be ${roleClicked === 'insomniac' ? 'an' : 'a'} `},
					{
						type: 'roleName',
						text: roleClicked
					},
					{text: '.'}
				];
			},
			troublemaker() {
				let action1 = parseInt(data.action[0]),
					action2 = parseInt(data.action[1]),
					seat1player = game.internals.seatedPlayers.find((player) => {
						return player.seatNumber === action1;
					}),
					seat2player = game.internals.seatedPlayers.find((player) => {
						return player.seatNumber === action2;
					}),
					seat1 = player.tableState.seats[action1],
					seat2 = player.tableState.seats[action2];

				updatedTrueRoles = game.internals.seatedPlayers.map((player, index) => {
					if (player.userName === seat1player.userName) {
						return seat2player.trueRole;
					} else if (player.userName === seat2player.userName) {
						return seat1player.trueRole;
					} else {
						return player.trueRole;
					}
				});

				player.tableState.nightAction.completed = true;
				seat1.swappedWithSeat = action2;
				seat2.swappedWithSeat = action1;
				chat.chat = [
					{text: 'You swap the two cards between '},
					{
						type: 'playerName',
						text: seat1player.userName
					},
					{text: ' and '},
					{
						type: 'playerName',
						text: seat2player.userName
					},
					{text: '.'}
				];
			},
			robber() {
				let action = parseInt(data.action),
					playerSeat = player.tableState.seats[player.seatNumber],
					swappedPlayerSeat = player.tableState.seats[action],
					swappedPlayer = game.internals.seatedPlayers.find((play) => {
						return play.seatNumber === action;
					}),
					_role = swappedPlayer.trueRole;

				updatedTrueRoles = game.internals.seatedPlayers.map((play) => {
					if (play.userName === player.userName) {
						return swappedPlayer.trueRole;
					}

					if (play.userName === swappedPlayer.userName) {
						return player.trueRole;
					}

					return play.trueRole;
				});

				player.tableState.nightAction.completed = true;
				swappedPlayerSeat.swappedWithSeat = player.seatNumber;
				playerSeat.swappedWithSeat = swappedPlayer.seatNumber;
				setTimeout(() => {
					swappedPlayerSeat.isFlipped = true;
					swappedPlayerSeat.role = _role; 
				}, 2000);
				setTimeout(() => {
					swappedPlayerSeat.isFlipped = false;
					sendInProgressGameUpdate(game);
				}, 5000);

				chat.chat = [
					{text: 'You exchange cards between yourself and '},
					{
						type: 'playerName',
						text: swappedPlayer.userName
					},
					{text: ` and view your new role, which is ${_role === 'insomniac' ? 'an' : 'a'} `},
					{
						type: 'roleName',
						text: _role
					},
					{text: '.'}
				];
			},
			seer() {
				let selectedCard = {
					7: 'center left',
					8: 'center middle',
					9: 'center right'
				};

				player.tableState.nightAction.completed = true;

				if (data.action.length === 1) {
					let playerClicked = game.internals.seatedPlayers[parseInt(data.action[0])],
						seat = player.tableState.seats[parseInt(data.action[0])];

					seat.isFlipped = true;
					seat.role = playerClicked.originalRole;
					setTimeout(() => {
						seat.isFlipped = false;
						sendInProgressGameUpdate(game);
					}, 3000);
					chat.chat = [
						{text: 'You select to see the card of '},
						{
							type: 'playerName',
							text: playerClicked.userName
						},
						{text: ` and it is ${playerClicked.originalRole === 'insomniac' ? 'an' : 'a'} `},
						{
							type: 'roleName',
							text: playerClicked.originalRole
						},
						{text: '.'}
					];
				} else {
					let seats = [player.tableState.seats[parseInt(data.action[0])], player.tableState.seats[parseInt(data.action[1])]],
						rolesClicked = data.action.map((role) => {
							return getTrueRoleBySeatNumber(role);
						});

					seats[0].isFlipped = true;
					seats[1].isFlipped = true;
					seats[0].role = rolesClicked[0];
					seats[1].role = rolesClicked[1];
					setTimeout(() => {
						seats[0].isFlipped = false;
						seats[1].isFlipped = false;
						sendInProgressGameUpdate(game);
					}, 3000);
					chat.chat = [
						{text: `You select to see the ${selectedCard[data.action[1]]} and ${selectedCard[data.action[0]]} cards and they are ${rolesClicked[1] === 'insomniac' ? 'an' : 'a'} `},
						{
							type: 'roleName',
							text: rolesClicked[1]
						},
						{text: ` and ${rolesClicked[0] === 'insomniac' ? 'an' : 'a'} `},
						{
							type: 'roleName',
							text: rolesClicked[0]
						},
						{text: '.'}
					];
				}
			}
		};

	eventMap[data.role]();

	if (updatedTrueRoles.length) { // todo-release refactor this whole stupid idea
		game.internals.seatedPlayers.map((player, index) => {
			player.trueRole = updatedTrueRoles[index];
			return player;
		});
	}

	player.gameChats.push(chat);
	sendInProgressGameUpdate(game);
};

module.exports.updateSelectedElimination = (data) => {
	let game = games.find((el) => {
			return el.uid === data.uid;
		}),
		player = game.internals.seatedPlayers[parseInt(data.seatNumber)],
		{ selectedForElimination } = data;

	player.selectedForElimination = selectedForElimination;
	highlightSeats(player, 'clear');
	highlightSeats(player, [parseInt(selectedForElimination)], 'selection');
	sendInProgressGameUpdate(game);
};

let dayPhase = (game) => {
	let seconds = (() => {
		let _time = game.time.split(':');

		return !_time[0] ? parseInt(_time[1]) : parseInt(_time[0]) * 60 + parseInt(_time[1]);
	})(),
	countDown = setInterval(() => {
		if (seconds === 0) {
			game.status = 'The game ends.';
			clearInterval(countDown);
			eliminationPhase(game);
		} else {
			let status;
			
			if (game.internals.truncateGame) {
				seconds = 16;
				game.internals.truncateGame = false;
			}

			if (seconds < 60) {
				status = `Day ends in ${seconds} second${seconds === 1 ? '' : 's'}`;

				if (seconds === devStatus.endingGame) {
					game.internals.seatedPlayers.forEach((player) => {
						highlightSeats(player, 'otherplayers', 'notify');
						player.gameChats.push({
							gameChat: true,
							userName: player.userName,
							chat: [{text: 'The game is coming to an end and you must select a player for elimination.'}],
							timestamp: new Date()
						});
						player.tableState.isVotable = {
							enabled: true
						};
					});
				}

				if (seconds === devStatus.endingGame - 1 || seconds === devStatus.endingGame - 3) {
					game.internals.seatedPlayers.forEach((player) => {
						if (!player.tableState.isVotable.selectedForElimination) {
							highlightSeats(player, 'clear');
						}
					});
				}

				if (seconds === devStatus.endingGame - 2) {
					game.internals.seatedPlayers.forEach((player) => {
						if (!player.tableState.isVotable.selectedForElimination) {
							highlightSeats(player, 'otherplayers', 'notify');
						}
					});
				}

				if (seconds < devStatus.endingGame) {
					status += '. VOTE NOW';
				}

				status += '.';
			} else {
				let minutes = Math.floor(seconds / 60),
					remainder = seconds - minutes * 60;

				status = `Day ends in ${minutes}:${remainder < 10 ? `0${remainder}` : remainder}.`;  // yo dawg, I heard you like template strings.
			}

			game.status = status;
			sendInProgressGameUpdate(game);
			seconds--;
		}
	}, 1000);

	game.gameState.isDay = true;
};

let eliminationPhase = (game) => {
	let index = 0,
		{ seatedPlayers } = game.internals,
		countDown;

	game.chats.push({
		gameChat: true,
		chat: [{text: 'The game ends.'}],
		timestamp: new Date()
	});

	game.status = 'The game ends.';

	seatedPlayers.forEach((player) => {
		highlightSeats(player, 'clear');
	});
	
	game.gameState.eliminations = [];

	countDown = setInterval(() => {
		if (index === 7) {
			clearInterval(countDown);
			endGame(game);
		} else {
			let noSelection = index === 6 ? 0 : index + 1;

			game.gameState.eliminations[index] = {
				seatNumber: seatedPlayers[index].selectedForElimination ? parseInt(seatedPlayers[index].selectedForElimination) : noSelection
			};

			sendInProgressGameUpdate(game);
			index++;
		}
	}, 1000);
};

let endGame = (game) => {
	let playersSelectedForElimination = game.gameState.eliminations.map((elimination) => {
			return elimination.seatNumber;
		}),
		modeMap = {},
		maxCount = 1,
		eliminatedPlayersIndex = [],
		{ seatedPlayers } = game.internals,
		werewolfTeamInGame = false,
		werewolfEliminated = false,
		tannerEliminations = [];

	playersSelectedForElimination.forEach((el) => {
		if (!modeMap[el]) {
			modeMap[el] = 1;
		} else {
			modeMap[el]++;
		}

		if (modeMap[el] > maxCount) {
			eliminatedPlayersIndex = [el];
			maxCount = modeMap[el];
		} else if (modeMap[el] === maxCount) {
			eliminatedPlayersIndex.push(el);
			maxCount = modeMap[el];
		}
	});

	seatedPlayers.forEach((player, index) => { // todo-release hunter's fade out thingy should happen later/not give away that he or she is a hunter
		if (player.trueRole === 'hunter' && eliminatedPlayersIndex.indexOf(index) !== -1 && eliminatedPlayersIndex.length !== 7) {
			eliminatedPlayersIndex.push(parseInt(player.selectedForElimination));
		}

		if (player.trueRole === 'werewolf' || player.trueRole === 'minion') {
			werewolfTeamInGame = true;
		}
	});

	game.gameState.eliminations.forEach((elimination) => {
		let transparent = false;

		if (eliminatedPlayersIndex.length === 7 || eliminatedPlayersIndex.indexOf(elimination.seatNumber) === -1) {
			transparent = true;
		}

		elimination.transparent = transparent;
	});

	game.gameState.isCompleted = true;
	sendInProgressGameUpdate(game);
	eliminatedPlayersIndex.forEach((eliminatedPlayerIndex) => {
		if (seatedPlayers[eliminatedPlayerIndex].trueRole === 'werewolf' || seatedPlayers[eliminatedPlayerIndex].trueRole === 'minion' && game.internals.soloMinion) {
			werewolfEliminated = true;
		}

		if (seatedPlayers[eliminatedPlayerIndex].trueRole === 'tanner') {
			tannerEliminations.push(eliminatedPlayerIndex);
		}
	});

	seatedPlayers.forEach((player, index) => {
		if (!werewolfEliminated && (player.trueRole === 'werewolf' || player.trueRole === 'minion') && !tannerEliminations.length || 
			
			tannerEliminations.indexOf(index) !== -1 || 
			
			(werewolfEliminated && player.trueRole !== 'werewolf' && player.trueRole !== 'minion' && player.trueRole !== 'tanner' && eliminatedPlayersIndex.length !== 7) || 
			
			((player.trueRole === 'werewolf' || player.trueRole === 'minion' && !game.internals.soloMinion) && eliminatedPlayersIndex.length === 7) || 
			
			(eliminatedPlayersIndex.length === 7 && !werewolfTeamInGame)) {
			player.wonGame = true;
		}
	});

	if (eliminatedPlayersIndex.length !== 7) {
		setTimeout(() => {
			eliminatedPlayersIndex.forEach((eliminatedPlayerIndex) => {
				game.tableState.seats[eliminatedPlayerIndex] = {
					role: seatedPlayers[eliminatedPlayerIndex].trueRole,
					isFlipped: true
				};
			});

			sendInProgressGameUpdate(game);
		}, devStatus.revealLosersPause);
	}

	setTimeout(() => {
		let winningPlayers = seatedPlayers.filter((player) => {
				return player.wonGame;
			}),
			winningPlayersIndex = winningPlayers.map((player) => {
				return player.seatNumber;
			}),
			winningPlayerNames = winningPlayers.map((player) => {
				return player.userName;
			}),
			winningPlayersList = winningPlayers.map((player) => {
				return player.userName;
			}).join(' '),
			wonGameChat = {
				gameChat: true,
				chat: [],
				timestamp: new Date()
			};

		if (winningPlayers.length) {
			wonGameChat.chat.push(
				{text: `The winning player${winningPlayerNames.length === 1 ? '' : 's'} ${winningPlayerNames.length === 1 ? 'is' : 'are'} `}
			);

			winningPlayerNames.forEach((name, index) => {
				wonGameChat.chat.push({
					text: name,
					type: 'playerName'
				});

				if (winningPlayerNames.length > 2 && index < winningPlayerNames.length - 2) {
					wonGameChat.chat.push({text: ', '});
				} else if (winningPlayerNames.length - 2 === index) {
					wonGameChat.chat.push({text: ' and '});
				}
			});
		} else {
			wonGameChat.chat.push({text: 'There are no winning players in this game'});
		}

		wonGameChat.chat.push({text: '.'});
		game.chats.push(wonGameChat);

		game.tableState.seats.forEach((seat, index) => {
			if (index < 7) {
				seat.role = seatedPlayers[index].trueRole;
			} else {
				seat.role = game.internals.centerRoles[index - 7];
			}

			if (winningPlayersIndex.indexOf(index) !== -1) {
				seat.highlight = 'proceed';
			}

			seat.isFlipped = true;
		});

		sendInProgressGameUpdate(game);

		Account.find({username: {$in: seatedPlayers.map((player) => {
			return player.userName;
		})}}, (err, results) => {
			if (err) {
				console.log(err);
			}
			
			results.forEach((player) => {
				let winner = false;

				if (winningPlayerNames.indexOf(player.username) !== -1) {
					player.wins++;
					winner = true;
				} else {
					player.losses++;
				}

				player.games.push(game.uid);
				player.save(() => {
					let userEntry = userList.find((user) => {
						return user.userName === player.username;
					});

					if (userEntry) {
						if (winner) {
							userEntry.wins++;
						} else {
							userEntry.losses++;
						}

						io.sockets.emit('userList', {
							list: userList,
							totalSockets: Object.keys(io.sockets.sockets).length
						});
					}
				});
			});
		});

	}, devStatus.revealAllCardsPause);
};