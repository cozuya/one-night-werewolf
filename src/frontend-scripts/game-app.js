'use strict';

let React = require('react'),
	ReactDOM = require('react-dom'),
	Provider = require('react-redux'),
	createStore = require('redux').createStore,
	LeftSidebar = require('./components/section-left/LeftSidebar.jsx'),
	Main = require('./components/section-main/Main.jsx'),
	RightSidebar = require('./components/section-right/RightSidebar.jsx'),
	wwApp = require('./reducers/wwapp'),
	account = require('./account');

document.addEventListener('DOMContentLoaded', () => {
	let container = document.getElementById('game-container');

	account();

	console.log(`app started at ${new Date()}`);

	console.log(wwApp);

	if (container) {

		let store = createStore(wwApp);

		ReactDOM.render(<Provider className="ui grid" store={store}>
							<LeftSidebar />
							<Main />
							<RightSidebar />
						</Provider>,
		container);
	}
});