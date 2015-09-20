'use strict';

let React = require('react'),
	Chatroom = require('./components/Chatroom.jsx');

document.addEventListener('DOMContentLoaded', () => {
	require('./account')();
	console.log('app started');

	if (document.getElementById('chat-container')) {
		React.render(<Chatroom />, document.getElementById('chat-container'));
	}
});