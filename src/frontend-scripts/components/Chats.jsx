'use strict';

let React = require('react'),
	socket = require('socket.io-client')(),
	actions = require('../actions/actions'),
	stores = require('../stores/stores');

module.exports = class Chats extends React.Component {
	constructor() {
		this.state = {
			data: []
		};
	}
	
	componentDidMount() {
		socket.on('chatsEmit', (chats) => {
			this.setState({data: chats});
		});
		socket.emit('getChats');
	}

	render() {
		return (
			<section className="chats-container ten wide column">
				<Chat data={this.state.data} />
			</section>
		);
	}
};

class Chat extends React.Component {
	constructor() {
		this.onUpdatedUsers = this.onUpdatedUsers.bind(this);
	}

	componentDidMount() {
		stores.userListStore.listen(this.onUpdatedUsers);
	}

	componentWillUnmount() {
		stores.userListStore.unlisten(this.onUpdatedUsers);
	}

	onUpdatedUsers(store) {
		this.users = store.users.map((el) => {
			return el.userName;
		});
	}

	componentDidUpdate() {
		let chatsContainer = document.querySelector('section.chats-container');

		chatsContainer.scrollTop = chatsContainer.scrollHeight;
	}

	render() {
		let chats = this.props.data.map((chat, i) => {
			chat.chatMsg = chat.chatMsg.replace(/@\[([^)]+)\]/g, (match) => {  // bad regex, only replaces one instance, needs some work.
				let user = match.split('@[')[1].split(']')[0],
					userInList = this.users.indexOf(user) >= 0;  // should prevent xss unless I'm dumb enough to allow users to be named "<script>"

				return userInList ? `<span class="mentioned-user">${user}</span>` : user;
			});

			return (
				<li key={i}>{chat.author}: <span dangerouslySetInnerHTML={{__html: chat.chatMsg}}></span></li>
			)
		});
		
		return (
			<ul>
				{chats}
			</ul>
		);
	}
};