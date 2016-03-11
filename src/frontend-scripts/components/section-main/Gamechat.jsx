'use strict';

import React from 'react';
import $ from 'jquery';
import socket from 'socket.io-client';
import { roleList, roleMap } from '../../../../iso/util';
socket = socket();

export default class Gamechat extends React.Component {
	constructor() {
		this.state = {
			chatFilter: 'All',
			lock: false,
			hotkey: 'init'
		};
	}

	componentDidMount() {
		this.scrollChats();
	}

	componentDidUpdate(prevProps) {
		this.scrollChats();

		if (prevProps && prevProps.selectedGamerole.random !== this.props.selectedGamerole.random && this.props.selectedGamerole.role) {
			let $input = $('form.inputbar input');

			$input.val($input.val() + this.props.selectedGamerole.role).next().removeClass('disabled');
		}
	}	

	displayHotkeys() {
		let textLeft, textRight;

		switch (this.state.hotkey) {
			case 'init':
				textLeft = 'I claim..';
				textRight = 'I think..';
				break;
		}

		return (
			<div className="hotkey-container app-hidden">
				<div className="hotkey-left" onClick={this.handleLeftHotkeyClick.bind(this)}>
					{textLeft}
				</div>
				<div className="hotkey-right" onClick={this.handleRightHotkeyClick.bind(this)}>
					{textRight}
				</div>
			</div>
		);
	}

	handleLeftHotkeyClick(e) {
		let keyText = $(e.currentTarget).text(),
			$input = $(e.currentTarget).parent().parent().next().find('input');

		switch (keyText) {
			case 'I claim..':
				$input.val('I claim to be the ');
				this.props.roleState('notify');
				setTimeout(() => {
					this.props.roleState('');
				}, 1000);
				break;
		}
	}

	handleRightHotkeyClick(e) {
		console.log(e.currentTarget);
	}

	handleChatClearClick(e) {
		$(e.currentTarget).addClass('app-hidden').prev().find('input').val('');
	}

	clickExpand(e) {
		let $icon = $(e.currentTarget);

		$icon.toggleClass('expand').toggleClass('compress');
		$icon.next().toggleClass('app-hidden');
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
			$clearIcon = $button.parent().next(),
			{ seatNumber } = this.props.userInfo;

		e.preventDefault();

		if (input.value) {
			let chat = {
				userName: this.props.userInfo.userName,
				chat: input.value,
				gameChat: false,
				seat: seatNumber ? parseInt(seatNumber.split('seatNumber')[1]) : '',
				inProgress: this.props.gameInfo.inProgress
			};

			socket.emit('newGameChat', chat, this.props.gameInfo.uid);
			input.value = '';
			input.focus();
			$button.addClass('disabled');
			$clearIcon.addClass('app-hidden');
		}
	}

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

	handleTimestamps(timestamp) {
		let { userInfo } = this.props;

		if (userInfo.userName && userInfo.gameSettings && userInfo.gameSettings.enableTimestamps) {
			let minutes = (`0${new Date(timestamp).getMinutes()}`).slice(-2),
				seconds = (`0${new Date(timestamp).getSeconds()}`).slice(-2);

			return (
				<span className="chat-timestamp">
					({minutes}: {seconds})
				</span>
			);
		}
	}

	processChats() {
		let { gameInfo } = this.props;

		return gameInfo.chats.map((chat, i) => {
			let chatContents = chat.chat,
				playerRegexes = Object.keys(gameInfo.seated).map((seatName) => {
					return gameInfo.seated[seatName].userName;
				}).map((playerName) => {
					return {
						playerName,
						regex: new RegExp(playerName, 'gi')
					};
				}),
				roleRegexes = _.uniq(gameInfo.roles).map((role) => {
					return {
						role,
						team: roleMap[role].team,
						regex: new RegExp(role, 'gi')
					};
				}).concat({
					role: 'werewolves',
					team: 'werewolf',
					regex: /werewolves/gi
				});

			roleRegexes.forEach((roleRegex) => {
				chatContents = chatContents.replace(roleRegex.regex, `<span class="chat-role--${roleRegex.team}">${roleRegex.role}</span>`);
			});

			playerRegexes.forEach((playerRegex) => {
				chatContents = chatContents.replace(playerRegex.regex, `<span class="chat-player">${playerRegex.playerName}</span>`);
			});

			if (chat.gameChat && (this.state.chatFilter === 'Game' || this.state.chatFilter === 'All')) {
				return (
					<div className="item" key={i}>
						<span className="chat-user--game">[GAME] {this.handleTimestamps.call(this, chat.timestamp)}: </span>
						<span className="game-chat" dangerouslySetInnerHTML={{__html: chatContents}}></span>
					</div>
				);
			} else if (!chat.gameChat && this.state.chatFilter !== 'Game') {
				return (
					<div className="item" key={i}>
						<span className="chat-user">{chat.userName}{this.props.userInfo.seatNumber ? '' : ' (Observer)'}{this.handleTimestamps.call(this, chat.timestamp)}: </span>
						<span dangerouslySetInnerHTML={{__html: chatContents}}></span>
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
					<a className={this.state.chatFilter === 'All' ? 'item active' : 'item'} onClick={this.handleChatFilterClick.bind(this)}>All</a>
					<a className={this.state.chatFilter === 'Chat' ? 'item active' : 'item'} onClick={this.handleChatFilterClick.bind(this)}>Chat</a>
					<a className={this.state.chatFilter === 'Game' ? 'item active' : 'item'} onClick={this.handleChatFilterClick.bind(this)}>Game</a>
					<i className={this.state.lock ? 'large lock icon' : 'large unlock alternate icon'} onClick={this.handleChatLockClick.bind(this)}></i>
				</section>
				<section className="segment chats">
					<div className="chatpusher"></div>
					<div className="ui list">
						{this.processChats()}
					</div>
				</section>
				<form className="segment inputbar" onSubmit={this.handleSubmit.bind(this)}>
					{(() => {
						let gameInfo = this.props.gameInfo,
							userInfo = this.props.userInfo,
							classes = 'expando-container';

						if (!gameInfo.inProgress || !userInfo.seatNumber || !gameInfo.tableState.isNight) {
							classes += ' app-visibility-hidden';
						}
						
						return (
							<div className={classes}>
								<i className="large expand icon" onClick={this.clickExpand.bind(this)}></i>
								{this.displayHotkeys()}
							</div>
						);
						
					})()}
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