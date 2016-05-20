'use strict';

module.exports.secureGame = (game) => {
	let _game = Object.assign({}, game);

	delete _game.internals;
	return _game;
};