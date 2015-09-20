'use strict';

let React = require('react'),
	socket = require('socket.io-client')(),
	Chats = require('./Chats.jsx'),
	Lobby = require('./Lobby.jsx'),
	ChatInput = require('./Chatinput.jsx');

module.exports = class Chatroom extends React.Component {
	handleChatSubmit(chat) {
		socket.emit('newChat', chat);
	}

	render() {
		return (
			<section className="chatroom-container ui grid">
				<div className="row">
					<Chats />
					<Lobby />
				</div>
				<ChatInput onChatSubmit={this.handleChatSubmit} />
			</section>
		);
	}
};