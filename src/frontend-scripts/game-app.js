'use strict';

let Game = require('./components/Game.jsx'),
	React = require('react'),
	ReactDOM = require('react-dom');

document.addEventListener('DOMContentLoaded', () => {
	let container = document.getElementById('game-container');

	require('./account')();
	console.log('app started');

	if (container) {
		ReactDOM.render(<Game />, container);
	}
});