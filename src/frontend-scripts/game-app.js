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
	
	console.log('%c%s', 'color: teal; background: #eee; font-size: 20px; font-style: italic; font-family: verdana', 'Welcome to One Night Werewolf');
	
	if (container) {
		let store = createStore(wwApp);

		render(
			<Provider store={store}>
				<AppComponent />
			</Provider>,
		container);
	}
});