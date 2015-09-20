'use strict';

let	alt = require('../alt');

class UserListClickAction {
	clickedUser(user) {
		this.dispatch(user);
	}
}

exports.userListClickAction = alt.createActions(UserListClickAction);

class UserListUpdate {
	updateUserList(users) {
		this.dispatch(users);
	}
}

exports.userListUpdate = alt.createActions(UserListUpdate);

class UserListHighlightMentionedAction {
	mentionedUser(user) {
		this.dispatch(user);
	}
}

exports.userListHighlightMentionedAction = alt.createActions(UserListHighlightMentionedAction);