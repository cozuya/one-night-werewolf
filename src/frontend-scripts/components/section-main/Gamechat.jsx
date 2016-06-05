'use strict';

import React from 'react';
import $ from 'jquery';
import _ from 'lodash';
import { roleList, roleMap } from '../../../../iso/util';

export default class Gamechat extends React.Component {
	constructor() {
		this.state = {
			chatFilter: 'All',
			lock: false,
			hotkey: 'init',
			expandoExpanded: true
		};
	}

	componentDidMount() {
		this.scrollChats();
	}

	componentDidUpdate(prevProps) {
		const $input = $(this.refs.gameChatInput);

		this.scrollChats();

		if (prevProps && !prevProps.gameInfo.gameState.cardsDealt && this.props.gameInfo.gameState.cardsDealt) {
			$input.val('').blur();
		}

		if (prevProps && prevProps.selectedGamerole.random !== this.props.selectedGamerole.random && this.props.selectedGamerole.role) {
			$input.val(`${$input.val()}${this.props.selectedGamerole.role}`).next().removeClass('disabled');
		}

		if (prevProps && prevProps.selectedPlayer.random !== this.props.selectedPlayer.random && this.props.selectedPlayer.playerName.length) {
			if ($input.val() === 'I think that ') {
				$input.val(`${$input.val()}${this.props.selectedPlayer.playerName} is a `).next().removeClass('disabled');				
			} else {
				$input.val(`${$input.val()}${this.props.selectedPlayer.playerName}`).next().removeClass('disabled');
			}
		}
	}	

	createHotkeys() {
		let textLeft, textRight;

		switch (this.state.hotkey) {   // todo-release expand this functionality to include nightaction events
			case 'init':
				textLeft = 'I claim..';
				textRight = 'I think..';
				break;
		}

		if (this.state.expandoExpanded) {
			return (
				<div className="hotkey-container">
					<div className="hotkey-left" onClick={this.handleLeftHotkeyClick.bind(this)}>
						{textLeft}
					</div>
					<div className="hotkey-right" onClick={this.handleRightHotkeyClick.bind(this)}>
						{textRight}
					</div>
				</div>
			);
		}
	}

	handleLeftHotkeyClick(e) {
		const keyText = $(e.currentTarget).text(),
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
		const keyText = $(e.currentTarget).text(),
			$input = $(e.currentTarget).parent().parent().next().find('input');

		switch (keyText) {
			case 'I think..':
				$input.val('I think that ');
				break;
		}
	}

	handleChatClearClick(e) {
		$(e.currentTarget).addClass('app-hidden').prev().find('input').val('');
	}

	clickExpand(e) {
		this.setState({expandoExpanded: !this.state.expandoExpanded});
	}

	handleKeyup(e) {
		const $input = $(e.currentTarget),
			inputValue = $input.val(),
			$button = $input.next(),
			$clearIcon = $input.parent().next();

		if (inputValue.length) {
			$button.removeClass('disabled');  // todo-release get this jquery nonsense out of here but I'm too lazy and there's other stuff to do
			$clearIcon.removeClass('app-hidden');
		} else {
			$button.addClass('disabled');
			$clearIcon.addClass('app-hidden');
		}
	}

	handleSubmit(e) {
		const input = $(e.currentTarget).find('input')[0],
			$button = $(e.currentTarget).find('button'),
			$clearIcon = $button.parent().next(),
			{ seatNumber } = this.props.userInfo,
			{ gameInfo, userInfo } = this.props;

		e.preventDefault();

		if (input.value) {
			const chat = {
				userName: this.props.userInfo.userName,
				chat: input.value,
				gameChat: false,
				uid: gameInfo.uid,
				inProgress: gameInfo.inProgress
			}

			if (gameInfo.gameState.isStarted && !gameInfo.gameState.isCompleted && userInfo.seatNumber) {
				const roles = _.uniq(gameInfo.roles),
					roleRegexes = roles.map((role) => {
						return new RegExp(`^i claim to be the ${role}`, 'gi');
					});
				
				roleRegexes.forEach((regex) => {
					if (regex.test(input.value)) {
						const claim = roles.filter((role) => {
							return input.value.match(new RegExp(`${role}$`, 'gi'));
						});

						chat.claim = claim[0];
					}
				});
			}

			this.props.socket.emit('addNewGameChat', chat, this.props.gameInfo.uid);
			input.value = '';
			input.focus();
			$button.addClass('disabled');
			$clearIcon.addClass('app-hidden');
		}
	}

	scrollChats() {
		const chatsContainer = document.querySelector('section.segment.chats');
		
		if (!this.state.lock) {
			chatsContainer.scrollTop = 0;
		}
	}

	handleChatFilterClick(e) {
		this.setState({
			chatFilter: $(e.currentTarget).text()
		});
	}

	handleTimestamps(timestamp) {
		const { userInfo } = this.props;

		if (userInfo.userName && userInfo.gameSettings && userInfo.gameSettings.enableTimestamps) {
			const minutes = (`0${new Date(timestamp).getMinutes()}`).slice(-2),
				seconds = (`0${new Date(timestamp).getSeconds()}`).slice(-2);

			return (
				<span className="chat-timestamp">
					({minutes}: {seconds})
				</span>
			);
		}
	}

	processChats() {
		const { gameInfo } = this.props;

		return gameInfo.chats.sort((a, b) => {
			return new Date(b.timestamp) - new Date(a.timestamp);
		}).map((chat, i) => {
			const chatContents = chat.chat,
				playerNames = Object.keys(gameInfo.seated).map((seatName) => {
					return gameInfo.seated[seatName].userName;
				}),
				isSeated = () => {
					return !!Object.keys(gameInfo.seated).find((seatName) => {
						return gameInfo.seated[seatName].userName === chat.userName;
					});
				},
				roles = [{
						name: 'masons',
						team: 'village'
					}, ..._.uniq(gameInfo.roles).map((name) => { // javascript!
						return {
							name,
							team: roleMap[name].team
						};
					}),
					{
						name: 'werewolves',
						team: 'werewolf'
					}
				];

			if (chat.gameChat && (this.state.chatFilter === 'Game' || this.state.chatFilter === 'All')) {
				return (
					<div className="item" key={i}>
						<span className="chat-user--game">[GAME] {this.handleTimestamps.call(this, chat.timestamp)}: </span>
						<span className="game-chat">
							{(() => {
								return chatContents.map((chatSegment, index) => {
									if (chatSegment.type) {
										let classes;

										if (chatSegment.type === 'playerName') {
											classes = 'chat-player';
										} else {
											classes = `chat-role--${roles.find((role) => {
												return role.name === chatSegment.text;
											}).team}`;
										}

										return <span key={index} className={classes}>{chatSegment.text}</span>;
									} else {
										return chatSegment.text;
									}
								});
							})()}
						</span>
					</div>
				);
			} else if (!chat.gameChat && this.state.chatFilter !== 'Game') {
				return (
					<div className="item" key={i}>
						<span className="chat-user">{chat.userName}{isSeated() ? '' : ' (Observer)'}{this.handleTimestamps.call(this, chat.timestamp)}: </span>
						<span>
							{(() => {
								const toProcessChats = [],
									splitChat = chatContents.split((() => {
										const toRegex = playerNames.concat(roles.map((role) => {
											return role.name;
										})).join('|');

									return new RegExp(toRegex, 'i');
								})());

								playerNames.forEach((name) => {
									const split = chatContents.split(new RegExp(name, 'i'));

									if (split.length > 1) {
										split.forEach((piece, index) => {
											if (index < split.length - 1) {
												toProcessChats.push({
													text: name,
													index: split[index].length,
													type: 'playerName'
												});
											}
										});
									}
								});

								roles.forEach((role) => {
									const split = chatContents.split(new RegExp(role.name, 'i'));

									if (split.length > 1) {
										split.forEach((piece, index) => {
											if (index < split.length - 1) {
												toProcessChats.push({
													text: role.name,
													index: split[index].length,
													type: 'roleName',
													team: role.team
												});
											}
										});
									}
								});

								toProcessChats.sort((a, b) => {
									return a.index - b.index;
								});

								return splitChat.map((piece, index) => {
									if (index) {
										const item = toProcessChats[index - 1];

										return (
											<span key={index}>
												<span className={item.team ? `chat-role--${item.team}` : 'chat-player'}>{item.text}</span>{piece}
											</span>
										);
									} else {
										return piece;
									}
								});
							})()}
						</span>
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
					<div className="ui list">
						{this.processChats()}
					</div>
				</section>
				<form className="segment inputbar" onSubmit={this.handleSubmit.bind(this)}>
					{(() => {
						let classes = 'expando-container';

						const { gameInfo, userInfo } = this.props;

						if (!userInfo.seatNumber || !gameInfo.gameState.isDay) {
							classes += ' app-visibility-hidden';
						}

						return (
							<div className={classes}>
								<i className={
									(() => {
										let classes = 'large';

										if (this.state.expandoExpanded) {
											classes += ' compress icon';
										} else {
											classes += ' expand icon';
										}

										return classes;
									})()
								} onClick={this.clickExpand.bind(this)}></i>
								{(() => {
									if (gameInfo.gameState.isStarted && userInfo.seatNumber) {
										{return this.createHotkeys()}
									}
								})()}
							</div>
						);
					})()}
					<div className={
						(() => {
							let classes = 'ui action input';

							const { gameState } = this.props.gameInfo;

							if (!this.props.userInfo.userName || gameState.cardsDealt && !gameState.isDay) {
								classes += ' disabled';
							}

							return classes;							
						})()
					}>
						<input placeholder="Chat.." ref="gameChatInput" onKeyUp={this.handleKeyup.bind(this)} maxLength="300"></input>
						<button className="ui primary button disabled">Chat</button>
					</div>
					<i className="large delete icon app-hidden" onClick={this.handleChatClearClick.bind(this)}></i>
				</form>
			</section>
		);
	}
};