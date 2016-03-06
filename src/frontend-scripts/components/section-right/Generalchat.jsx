'use strict';

import React from 'react';
import $ from 'jquery';
import socket from 'socket.io-client';
socket = socket();

export default class Gamechat extends React.Component {
	constructor() {
		this.state = {
			lock: false,
		};
	}

	componentDidMount() {
		this.scrollChats();
		console.log(this.props);
	}

	componentDidUpdate(prevProps) {
		this.scrollChats();
	}	

	handleChatClearClick(e) {
		$(e.currentTarget).addClass('app-hidden').prev().find('input').val('');
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
		let input = $(e.currentTarget).find('input')[0],
			$button = $(e.currentTarget).find('button'),
			$clearIcon = $button.parent().next();

		e.preventDefault();

		if (input.value) {
			let chat = {
				userName: this.props.userInfo.userName,
				chat: input.value
			};

			socket.emit('newGeneralChat', chat);
			input.value = '';
			input.focus();
			$button.addClass('disabled');
			$clearIcon.addClass('app-hidden');
		}
	}

	scrollChats() {
		// let chatsContainer = document.querySelector('section.segment.chats'),
		// 	$chatPusher = $('div.chatpusher'),
		// 	chatHeight = 290,
		// 	chatCount = this.props.gameInfo.chats.length,
		// 	$lockIcon = $('section.gamechat > .ui.menu > i');

		// if (chatCount < 20) {
		// 	$chatPusher.css({
		// 		height: 290 - chatCount * 16,
		// 	});
		// } else {
		// 	$chatPusher.remove();
		// }

		// if (!this.state.lock) {
		// 	chatsContainer.scrollTop = chatsContainer.scrollHeight;
		// }
	}

	processChats() {
		return this.props.generalChats.map((chat, i) => {
			
			return (
				<div className="item" key={i}>
					<span className="chat-user">{chat.userName}: </span>
					<span>{chat.chat}</span>
				</div>
			);
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
			<section className="generalchat">
				<section className="ui pointing menu">
					<i className={this.state.lock ? 'large lock icon' : 'large unlock alternate icon'} onClick={this.handleChatLockClick.bind(this)}></i>
				</section>
				<section className="segment chats">
					<div className="chatpusher"></div>
					<div className="ui list">
						{this.processChats()}
					</div>
				</section>
				<form className="segment inputbar" onSubmit={this.handleSubmit.bind(this)}>
					<div className={this.props.userInfo.userName ? "ui action input" : "ui action input disabled"}>
						<input placeholder="Chat.." onKeyUp={this.handleKeyup.bind(this)} maxLength="300"></input>
						<button className="ui primary button disabled">Chat</button>
					</div>
					<i className="large delete icon app-hidden" onClick={this.handleChatClearClick.bind(this)}></i>
				</form>
			</section>
		);
	}
};