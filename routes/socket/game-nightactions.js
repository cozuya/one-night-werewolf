'use strict';

import { sendInprogressChats } from './gamechat.js';
import { games } from './game.js';
import _ from 'lodash';

export function updateUserNightActionEvent(socket, data) {
	let game = games.find((el) => {
			return el.uid === data.uid;
		}),
		player = game.internals.seatedPlayers.find((player) => {
			return player.userName === data.userName;
		}),
		chat = {
			gameChat: true,
			userName: player.userName,
			seat: player.seat,
			timestamp: new Date()
		},
		eventMap = {
			singleWerewolf() {
				let selectedCard = {
					8: 'CENTER LEFT',
					9: 'CENTER MIDDLE',
					10: 'CENTER RIGHT'
				},
				roleClicked = getTrueRoleBySeatNumber(game, data.action);

				player.nightAction.roleClicked = roleClicked;
				player.nightAction.seatClicked = data.action;
				player.nightAction.completed = true;
				chat.chat = `You select the ${selectedCard[data.action]} card and it is revealed to be a ${roleClicked.toUpperCase()}.`;
			},
			multiWerewolf() {
				// todo
			},
			insomniac() {
				let roleClicked = getTrueRoleBySeatNumber(game, data.action);

				player.nightAction.roleClicked = roleClicked;
				player.nightAction.seatClicked = data.action;
				player.nightAction.completed = true;
				chat.chat = `You look at your own card and it is revealed to be a ${roleClicked.toUpperCase()}.`;
			},
			troublemaker() {
				let seat1player = game.internals.seatedPlayers.find((player) => {
						return player.seat === parseInt(data.action[0]);
					}),
						seat2player = game.internals.seatedPlayers.find((player) => {
						return player.seat === parseInt(data.action[1]);
					});

				seat1player.trueRole = data.action[1]; // todo: need to delay this assignment until the end of the phase or beginning of phase 2 - otherwise could display "post swap" info to seer/ww. add cb to sendinprogresschats?
				seat2player.trueRole = data.action[0];
				player.nightAction.seatsClicked = data.action;
				player.nightAction.completed = true;
				chat.chat = `You swap the two cards between ${seat1player.userName.toUpperCase()} and ${seat2player.userName.toUpperCase()}.`;
			},
			robber() {
				let player = game.internals.seatedPlayers.find((player) => {
						return player.userName === data.userName;
					}),
						swappedPlayer = game.internals.seatedPlayers.find((player) => {
						return player.seat === parseInt(data.action);
					}),
					_role = player.trueRole;

				player.trueRole = swappedPlayer.trueRole; // todo: need to delay this assignment until the end of the phase or beginning of phase 2 - otherwise could display "post swap" info to seer/ww. add cb to sendinprogresschats?
				player.perceivedRole = swappedPlayer.trueRole;
				swappedPlayer.trueRole = _role;

				player.nightAction.seatClicked = data.action;
				player.nightAction.newRole = player.trueRole;
				player.nightAction.completed = true;
				chat.chat = `You exchange cards between yourself and ${swappedPlayer.userName.toUpperCase()} and view your new role, which is a ${player.trueRole.toUpperCase()}.`;
			},
			seer() {
				let selectedCard = {
					8: 'CENTER LEFT',
					9: 'CENTER MIDDLE',
					10: 'CENTER RIGHT'
				},
				rolesClicked = data.action.map((role) => {
					return getTrueRoleBySeatNumber(game, role);
				});

				player.nightAction.rolesClicked = rolesClicked;
				player.nightAction.seatsClicked = data.action;
				player.nightAction.completed = true;

				if (data.action.length === 1) {
					let playerClicked = game.internals.seatedPlayers[parseInt(data.action) - 1].userName;

					console.log(playerClicked);
					chat.chat = `You select to see the card of ${playerClicked} and it is a ${rolesClicked[0]}.`;
				} else {
					chat.chat = `You select to see the ${selectedCard[data.action[0]]} and ${selectedCard[data.action[0]]} cards and they are a ${rolesClicked[0]} and ${rolesClicked[1]}.`
				}
			},
			minion() {
				// todo
			},
			mason() {
				// todo
			}
		};

	console.log(data);
	if (!player.nightAction.completed) {
		eventMap[data.role]();
	}
	player.gameChats.push(chat);
	sendInprogressChats(game);
}

let getTrueRoleBySeatNumber = (game, num) => {
	num = parseInt(num);

	if (num < 8) {
		return game.internals.seatedPlayers[num - 1].trueRole;
	} else {
		return game.internals.centerRoles[num - 8];
	}
}