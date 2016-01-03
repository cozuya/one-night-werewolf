'use strict';

import { sendInprogressChats } from './gamechat.js';
import { games } from './game.js';
import _ from 'lodash';

export function updateUserNightActionEvent(socket, data) {
	let game = games.find((el) => {
			return el.uid === data.uid;
		}),
		eventMap = {
			singleWerewolf() {
				let roleClicked = getTrueRoleBySeatNumber(data.action);

				// todo: update tableState object for this socket and emit gameupdate then update table.jsx componentdidupdate to add the role's class to the clicked card and then revealcard the clicked card and then emit a gamechat with that info.
			}
		}
	console.log(data);
	console.log(game.internals.seatedPlayers);
	eventMap[data.role]();
}

let getTrueRoleBySeatNumber = (game, num) => {
	num = parseInt(num);

	if (num < 8) {
		return game.internals.seatedPlayers[num - 1].trueRole;
	} else {
		return game.internals.centerRoles[num - 8];
	}
}