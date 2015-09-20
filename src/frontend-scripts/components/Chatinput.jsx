'use strict';

let React = require('react'),
	socket = require('socket.io-client')(),
	actions = require('../actions/actions'),
	stores = require('../stores/stores'),
	$ = require('jquery');

class Preview extends React.Component {
	render() {
		return (
			<section className="preview-container">
				<p dangerouslySetInnerHTML={{__html: this.props.inputValue}}></p>
			</section>
		)
	}
}

module.exports = class ChatInput extends React.Component {
	constructor() {
		this.handleSubmit = this.handleSubmit.bind(this);
		this.onClickedUser = this.onClickedUser.bind(this);
		this.handleKeyup = this.handleKeyup.bind(this);
		this.setUsers = this.setUsers.bind(this);

		this.state = {
			inputValue: ''
		};
	}

	handleSubmit(e) {	
		let input = React.findDOMNode(this.refs.chatinput),
			$button = $('section.input-container button');

		e.preventDefault();
		this.props.onChatSubmit(input.value.trim());

		if (/@\[([^)]+)\]/g.test(input.value)) {
			actions.userListHighlightMentionedAction.mentionedUser({user: input.value.trim().split('@[')[1].split(']')[0]});
		}
		
		input.value = '';
		input.focus();
		$button.addClass('disabled');
		this.setState({inputValue: ''});
	}

	componentDidMount() {
		stores.userListClickedStore.listen(this.onClickedUser);
		stores.userListStore.listen(this.setUsers);
	}

	componentWillUnmount() {
		stores.userListClickedStore.unlisten(this.onClickedUser);
		stores.userListStore.unlisten(this.setUsers);
	}

	setUsers(store) {
		this.users = store.users.map((el) => {
				return el.userName;
		});
	}

	onClickedUser(store) {
		let input = React.findDOMNode(this.refs.chatinput),
			clickedUser = `@[${store.clickedUser.user.userName}]`;

		input.value = `${input.value}${clickedUser}`;
		this.handleKeyup();
	}

	handleKeyup() {
		let inputValue = React.findDOMNode(this.refs.chatinput).value,
			$button = $('section.input-container button');

		if (inputValue.length) {
			$button.removeClass('disabled');
		} else {
			$button.addClass('disabled');
		}

		inputValue = inputValue.replace(/@\[([^)]+)\]/g, (match) => {  // bad regex, only replaces one instance, needs some work.
				let user = match.split('@[')[1].split(']')[0],
					userInList = this.users.indexOf(user) >= 0;  // should prevent xss unless I'm dumb enough to allow users to be named "<script>"

				return userInList ? `<span class="mentioned-user">${user}</span>` : user;
		});

		this.setState({inputValue});
	}

	render() {
		return (
			<section className="input-container">
				<form onSubmit={this.handleSubmit}>
					<input className="ui input" placeholder="Chat.." ref="chatinput" onKeyUp={this.handleKeyup} />
					<button className="ui primary button disabled">Chat</button>
				</form>
				<Preview inputValue={this.state.inputValue} />
			</section>
		);
	}
};