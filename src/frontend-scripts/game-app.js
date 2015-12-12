'use strict';

import account from './account';
import AppComponent from './components/App.jsx';
import React from 'react';
import { render } from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import wwApp from './reducers/wwapp';
import polyfills from '../../iso/polyfills.js';

document.addEventListener('DOMContentLoaded', () => {
	let container = document.getElementById('game-container');

	account();
	polyfills();
	
	console.log(`app started at ${new Date()}`);

	if (container) {
		let store = createStore(wwApp);

		render(
			<Provider store={store}>
				<AppComponent />
			</Provider>,
		container);
	}
});