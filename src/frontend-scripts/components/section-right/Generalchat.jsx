'use strict';

import React from 'react';
import $ from 'jquery';

export default class Gamechat extends React.Component {
	constructor() {
		this.state = {
			lock: false,
		};
	}

	componentDidMount() {
		this.scrollChats();
	}

	componentDidUpdate(prevProps) {
		this.scrollChats();
	}	

	handleChatClearClick(e) {
		$(e.currentTarget).addClass('app-hidden').prev().find('input').val(''); // todo-release redo all this jquery junk
	}

	handleKeyup(e) {
		const $input = $(e.currentTarget),
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
		const input = $(e.currentTarget).find('input')[0],
			$button = $(e.currentTarget).find('button'),
			$clearIcon = $button.parent().next();

		e.preventDefault();

		if (input.value) {
			this.props.socket.emit('addNewGeneralChat', {
				userName: this.props.userInfo.userName,
				chat: input.value
			});
			input.value = '';
			input.focus();
			$button.addClass('disabled');
			$clearIcon.addClass('app-hidden');
		}
	}

	scrollChats() {
		const chatsContainer = document.querySelector('.genchat-container');
			
		if (!this.state.lock) {
			chatsContainer.scrollTop = 254;
		}
	}

	processChats() {
		return this.props.generalChats.map((chat, i) => {		
			return (
				<div className="item" key={i}>
					<span className={chat.userName === 'coz' ? 'chat-user admin' : chat.userName === 'stine' ? 'chat-user admin' : 'chat-user'}>{chat.userName}: </span>
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

	handleScroll(e) {
		// todo-release address issue with reverse scrolling

		// const $chatcontainer = $(e.currentTarget).find('.list'),
		// 	$list = $chatcontainer.find('.list'),
		// 	height = $chatcontainer.innerHeight();

		// console.log($chatcontainer[0].scrollTop);
		// console.log(height);
	}

	render() {
		return (
			<section className="generalchat">
				<section className="generalchat-header">
					<div className="clearfix">
						<h3 className="ui header">Chat</h3>
						<i className={this.state.lock ? 'large lock icon' : 'large unlock alternate icon'} onClick={this.handleChatLockClick.bind(this)}></i>
					</div>
					<div className="ui divider right-sidebar-divider"></div>
				</section>
				<section className="segment chats" onScroll={this.handleScroll.bind(this)}>
					<div className="ui list genchat-container">
						{this.processChats()}
					</div>
				</section>
				<form className="segment inputbar" onSubmit={this.handleSubmit.bind(this)}>
					<div className={this.props.userInfo.userName ? 'ui action input' : 'ui action input disabled'}>
						<input placeholder="Chat.." onKeyUp={this.handleKeyup.bind(this)} maxLength="300"></input>
						<button className="ui primary button disabled">Chat</button>
					</div>
					<i className="large delete icon app-hidden" onClick={this.handleChatClearClick.bind(this)}></i>
				</form>
			</section>
		);
	}
};