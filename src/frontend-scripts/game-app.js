'use strict';

let React = require('react'),
	ReactDOM = require('react-dom'),
	LeftSidebar = require('./components/section-left/LeftSidebar.jsx'),
	Main = require('./components/section-main/Main.jsx'),
	RightSidebar = require('./components/section-right/RightSidebar.jsx'),
	store = require('./stores/stores.js');

document.addEventListener('DOMContentLoaded', () => {
	let container = document.getElementById('game-container');

	require('./account')();
	console.log(`app started at ${new Date()}`);

	if (container) {
		ReactDOM.render(<section className="ui grid">
							<LeftSidebar />
							<Main />
							<RightSidebar />
						</section>,
		container);

		console.log(store);
	}
});