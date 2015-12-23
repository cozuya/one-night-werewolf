'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

export default class Gamechat extends React.Component {
	constructor() {
		this.state = {
			chatFilter: 'All',
			lock: false
		};
	}

	clickExpand(e) {
	}

	handleKeyup(e) {
		let $input = $(e.currentTarget),
			inputValue = $input.val(),
			$button = $input.next(),
			$clearIcon = $input.parent().next();

		if (inputValue.length) {
			$button.removeClass('disabled');
			$clearIcon.removeClass('app-hidden');
		} else {
			$button.addClass('disabled');
			$clearIcon.addClass('app-hidden');
		}
	}

	handleSubmit(e) {
		let input = ReactDOM.findDOMNode(this.refs.chatinput),
			$button = $(e.currentTarget).find('button'),
			$clearIcon = $button.parent().next(),
			seat = Object.keys(this.props.gameInfo.seated).find((seat) => {
				return this.props.gameInfo.seated[seat] === this.props.userInfo.userName;
			});

		e.preventDefault();

		if (input.value) {
			this.props.newChat({
				userName: this.props.userInfo.userName,
				timestamp: new Date(),
				chat: input.value,
				gameChat: false,
				seat,
				inProgress: this.props.gameInfo.inProgress
			});

			input.value = '';
			input.focus();
			$button.addClass('disabled');
			$clearIcon.addClass('app-hidden');
		}
	}

	componentDidMount() {
		this.scrollChats();
	}

	componentDidUpdate() {
		this.scrollChats();
	}

	// shouldComponentUpdate() {
	// 	let gameInfo = this.props.gameInfo;

	// 	console.log(this.props.gameInfo.chats);

	// 	if (gameInfo.inProgress && !gameInfo.chats.length) {
	// 		console.log('Hello World!');
	// 		return false;
	// 	}

	// 	return true;
	// }

	scrollChats() {
		let chatsContainer = document.querySelector('section.segment.chats'),
			$chatPusher = $('div.chatpusher'),
			chatHeight = 290,
			chatCount = this.props.gameInfo.chats.length,
			$lockIcon = $('section.gamechat > .ui.menu > i');

		if (chatCount < 20) {
			$chatPusher.css({
				height: 290 - chatCount * 16,
			});
		} else {
			$chatPusher.remove();
		}

		if (!this.state.lock) {
			chatsContainer.scrollTop = chatsContainer.scrollHeight;
		}
	}


	handleChatFilterClick(e) {
		this.setState({
			chatFilter: $(e.currentTarget).text()
		});
	}

	processChats() {
		let gameInfo = this.props.gameInfo;

		// console.log(this.props.gameInfo.chats);

		return gameInfo.chats.map((chat, i) => {
			if (chat.gameChat && (this.state.chatFilter === 'Game' || this.state.chatFilter === 'All')) {
				return (
					<div className="item" key={i}>
						<span className="chat-user--game">[GAME]: </span>
						<span className="game-chat">{chat.chat}</span>
					</div>
				);
			} else if (!chat.gameChat && this.state.chatFilter !== 'Game') {
				let isSeated = !!Object.keys(gameInfo.seated).find((seat) => {
					return gameInfo.seated[seat].userName === chat.userName;
				});

				return (
					<div className="item" key={i}>
						<span className="chat-user">{chat.userName}{isSeated ? '' : ' (Observer)'}: </span>
						{chat.chat}
					</div>
				);
			};
		});	
	}

	handleChatLockClick(e) {
		if (this.state.lock) {
			this.setState({lock: false});
		} else {
			this.setState({lock: true});
		}
	}

	render() {
		return (
			<section className="gamechat">
				<section className="ui pointing menu">
					<a className={this.state.chatFilter === 'All' ? "item active" : "item"} onClick={this.handleChatFilterClick.bind(this)}>All</a>
					<a className={this.state.chatFilter === 'Chat' ? "item active" : "item"} onClick={this.handleChatFilterClick.bind(this)}>Chat</a>
					<a className={this.state.chatFilter === 'Game' ? "item active" : "item"} onClick={this.handleChatFilterClick.bind(this)}>Game</a>
					<i className={this.state.lock ? "large lock icon" : "large unlock alternate icon"} onClick={this.handleChatLockClick.bind(this)}></i>
				</section>
				<section className="segment chats">
					<div className="chatpusher"></div>
					<div className="ui list">
						{this.processChats()}
					</div>
				</section>
				<form className="segment inputbar" onSubmit={this.handleSubmit.bind(this)}>
					<i className="large expand icon" onClick={this.clickExpand.bind(this)}></i>
					<div className={this.props.userInfo.userName ? "ui action input" : "ui action input disabled"}>
						<input placeholder="Chat.." ref="chatinput" onKeyUp={this.handleKeyup.bind(this)}></input>
						<button className="ui primary button disabled">Chat</button>
					</div>
					<i className="large delete icon app-hidden"></i>
				</form>
			</section>
		);
	}
};