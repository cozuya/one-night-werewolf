'use strict';

let React = require('react'),
	Game = require('./components/Game.jsx');

document.addEventListener('DOMContentLoaded', () => {
	let container = document.getElementById('game-container');

	require('./account')();
	console.log('app started');


	console.log('Hello World!');

	if (container) {
		React.render(<Game />, container);
	}
});