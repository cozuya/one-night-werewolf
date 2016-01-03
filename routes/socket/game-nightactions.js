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
		eventMap = {
			singleWerewolf() {
				let chat = {
					gameChat: true,
					userName: player.userName,
					seat: player.seat,
					timestamp: new Date()
				},
				selectedCard = {
					8: 'MIDDLE LEFT',
					9: 'MIDDLE CENTER',
					10: 'MIDDLE RIGHT'
				},
				roleClicked = getTrueRoleBySeatNumber(game, data.action);

				player.nightAction.roleClicked = roleClicked;
				player.nightAction.seatClicked = data.action;
				player.nightAction.completed = true;
				chat.chat = `You select the ${selectedCard[data.action]} card and it is revealed to be a ${roleClicked.toUpperCase()}.`;
				player.gameChats.push(chat);
			}
		}
	console.log(data);
	eventMap[data.role]();
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