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

				seat1player.trueRole = data.action[1];
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

				player.trueRole = swappedPlayer.trueRole;
				player.perceivedRole = swappedPlayer.trueRole;
				swappedPlayer.trueRole = _role;

				player.nightAction.seatClicked = data.action;
				player.nightAction.completed = true;
				chat.chat = `You exchange cards between yourself and ${swappedPlayer.userName.toUpperCase()} and view your new role, which is a ${player.trueRole.toUpperCase()}.`;
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