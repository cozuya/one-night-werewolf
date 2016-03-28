'use strict';

// prod
module.exports.devStatus = { // can't think of a better name.  This object assists in development.
	nightPhasePause: 5,
	phaseTime: 10,
	endingGame: 15,
	seatedCountToStartGame: 7,
	startGamePause: 5,
	playerCountToEndGame: 7,
	revealLosersPause: 5000,
	revealAllCardsPause: 11000
}

// dev 2p
// module.exports.devStatus = {
// 	nightPhasePause: 1,
// 	phaseTime: 1,
// 	endingGame: 3,
// 	seatedCountToStartGame: 2,
// 	startGamePause: 1,
// 	playerCountToEndGame: 2,
// 	revealLosersPause: 1000,
// 	revealAllCardsPause: 1500
// }

// dev 7p

// module.exports.devStatus = {
// 	nightPhasePause: 1,
// 	phaseTime: 1,
// 	endingGame: 3,
// 	seatedCountToStartGame: 7,
// 	startGamePause: 1,
// 	playerCountToEndGame: 7,
// 	revealLosersPause: 1000,
// 	revealAllCardsPause: 1500
// };

module.exports.secureGame = (game) => {
	let _game = Object.assign({}, game);

	delete _game.internals;
	return _game;
}