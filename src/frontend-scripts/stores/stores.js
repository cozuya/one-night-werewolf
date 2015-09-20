'use strict';

let alt = require('../alt'),
	actions = require('../actions/actions');

class UserListHighlightMentionedStore {
	constructor() {
		this.mentionedUser = {};

		this.bindListeners({
			handleUserMentioned: actions.userListHighlightMentionedAction.mentionedUser
		});
	}

	handleUserMentioned(mentionedUser) {
		this.mentionedUser = mentionedUser;
	}
}

exports.userListHighlightMentionedStore = alt.createStore(UserListHighlightMentionedStore, 'UserListHighlightMentionedStore');

class UserListClickedStore {
	constructor() {
		this.clickedUser = {};

		this.bindListeners({
			handleUserClick: actions.userListClickAction.clickedUser
		});
	}

	handleUserClick(clickedUser) {
		this.clickedUser = clickedUser;
	}
}

exports.userListClickedStore = alt.createStore(UserListClickedStore, 'UserListClickedStore');

class UserListStore {
	constructor() {
		this.users = [];

		this.bindListeners({
			handleUpdateUsers: actions.userListUpdate.updateUserList
		});
	}

	handleUpdateUsers(users) {
		this.users = users;
	}
}

exports.userListStore = alt.createStore(UserListStore, 'UserListStore');