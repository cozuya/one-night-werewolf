'use strict';

import { games } from './game.js';
import _ from 'lodash';

export function startGame(game) {
	let tempGame = _.clone(game);

	delete tempGame.name;
}