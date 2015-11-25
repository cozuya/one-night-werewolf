'use strict';

import account from './account'
import AppComponent from './components/App.jsx'
import React from 'react'
import { render } from 'react-dom'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import wwApp from './reducers/wwapp'

document.addEventListener('DOMContentLoaded', () => {
	let container = document.getElementById('game-container');

	account();

	console.log(`app started at ${new Date()}`);

	if (container) {
		let store = createStore(wwApp);
		console.log(store);

		render(
			<Provider store={store}>
				<AppComponent />
			</Provider>,
		container);
	}
});