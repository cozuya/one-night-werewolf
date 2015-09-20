'use strict';

let React = require('react'),
	socket = require('socket.io-client')(),
	actions = require('../actions/actions'),
	stores = require('../stores/stores');

class UserList extends React.Component {
	handleClick(user) {
		actions.userListClickAction.clickedUser({user});
	}

	render() {
		return (
			<ul>
				{this.props.data.map((user, i) => {
					return (
						<li key={i} onClick={this.handleClick.bind(this, user)} className={user.wasMentioned ? "mentioned-lobby-user" : ""}>{user.userName}</li>
					)
				})}
			</ul>
		);
	}
}

module.exports = class Lobby extends React.Component {
	constructor() {
		this.highlightMentionedUser = this.highlightMentionedUser.bind(this);
		this.state = {
			data: []
		};
	}

	componentDidMount() {
		stores.userListHighlightMentionedStore.listen(this.highlightMentionedUser);
		socket.emit('getUsers');
		socket.on('usersEmit', (users) => {
			this.setState({data: users});
			actions.userListUpdate.updateUserList(users);
		});
	}

	componentWillUnmount() {
		stores.userListHighlightMentionedStore.unlisten(this.highlightMentionedUser);
	}

	highlightMentionedUser(store) {
		socket.emit('mentionedUser', store.mentionedUser.user);
	}

	render() {
		return (
			<section className="lobby-container six wide column">
				<h2>Lobby</h2>
				<UserList data={this.state.data} />
			</section>
		);
	}
};