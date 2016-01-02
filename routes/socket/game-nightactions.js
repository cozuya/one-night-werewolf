'use strict';

import { sendInprogressChats } from './gamechat.js';
import { games } from './game.js';
import _ from 'lodash';

export function updateUserNightActionEvent(socket, data) {
	let game = games.find((el) => {
		return el.uid === data.uid;
	});

	console.log(data);
}