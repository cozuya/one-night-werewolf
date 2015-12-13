'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

export default class Gamechat extends React.Component {
	constructor() {
		this.state = {
			chatFilter: 'All'
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
			$clearIcon = $button.parent().next();

		e.preventDefault();

		if (input.value) {
			this.props.newChat({
				userName: this.props.userInfo.userName,
				timestamp: new Date(),
				chat: input.value
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

	scrollChats() {
		let chatsContainer = document.querySelector('section.segment.chats'),
			$chatPusher = $('div.chatpusher'),
			chatHeight = 290,
			chatCount = this.props.gameInfo.chats.length;

		if (chatCount < 20) {
			$chatPusher.css({
				height: 290 - chatCount * 16,
			});
		}
		chatsContainer.scrollTop = chatsContainer.scrollHeight;
	}


	handleChatFilterClick(e) {
		let $el = $(e.currentTarget);

		if ($el.hasClass('active')) {
			return;
		}

		this.setState({
			chatFilter: $el.text()
		});

		$el.parent().find('.active').removeClass('active');
		$el.addClass('active');
	}

	processChats() {
		return this.props.gameInfo.chats.map((chat, i) => {
			if (chat.userName === 'GAME' && (this.state.chatFilter === 'Game' || this.state.chatFilter === 'All')) {
				return (
					<div className="item" key={i}>
						<span className="chat-user--game">[{chat.userName}]: </span>
						<span className="game-chat">{chat.chat}</span>
					</div>
				);
			} else if (chat.userName !== 'GAME' && this.state.chatFilter !== 'Game') {
				return (
					<div className="item" key={i}>
						<span className="chat-user">{chat.userName}: </span>
						{chat.chat}
					</div>
				);
			};
		});	
	}

	render() {
		return (
			<section className="gamechat">
				<section className="ui pointing menu">
					<a className="item active" onClick={this.handleChatFilterClick.bind(this)}>All</a>
					<a className="item" onClick={this.handleChatFilterClick.bind(this)}>Chat</a>
					<a className="item" onClick={this.handleChatFilterClick.bind(this)}>Game</a>
				</section>
				<section className="segment chats">
					<div className="chatpusher"></div>
					<div className="ui list">
						{this.processChats()}
					</div>
				</section>
				<form className="segment inputbar" onSubmit={this.handleSubmit.bind(this)}>
					<i className="large expand icon" onClick={this.clickExpand.bind(this)}></i>
					<div className="ui action input">
						<input placeholder="Chat.." ref="chatinput" onKeyUp={this.handleKeyup.bind(this)}></input>
						<button className="ui primary button disabled">Chat</button>
					</div>
					<i className="large delete icon app-hidden"></i>
				</form>
			</section>
		);
	}
};