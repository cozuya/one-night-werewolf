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
				player.gameChats.push(chat);
			},
			insomniac() {
				let roleClicked = getTrueRoleBySeatNumber(game, data.action);

				player.nightAction.roleClicked = roleClicked;
				player.nightAction.seatClicked = data.action;
				player.nightAction.completed = true;
				chat.chat = `You look at your own card and it is revealed to be a ${roleClicked.toUpperCase()}.`;
				player.gameChats.push(chat);
			}
		}

	console.log(data);
	if (!player.nightAction.completed) {
		eventMap[data.role]();
	}
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