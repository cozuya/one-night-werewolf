'use strict';

import React from 'react';
import $ from 'jquery';
import _ from 'lodash';
import { roleList, roleMap } from '../../../../iso/util';

// todo-alpha leaving game doesn't unseat you any more

export default class Gamechat extends React.Component {
	constructor() {
		this.state = {
			chatFilter: 'All',
			lock: false,
			hotkey: 'init',
			inputValue: ''
		};
	}

	componentDidMount() {
		this.scrollChats();
	}

	componentDidUpdate(prevProps) {
		const $input = $(this.refs.gameChatInput),
			{ selectedGamerole, selectedPlayer } = this.props,
			currentValue = this.state.inputValue;

		this.scrollChats();

		if (prevProps && !prevProps.gameInfo.gameState.cardsDealt && this.props.gameInfo.gameState.cardsDealt) {
			this.setState({inputValue: ''});
			$input.blur();
		}

		if (prevProps && prevProps.selectedGamerole.random !== selectedGamerole.random && selectedGamerole.role) {
			if (currentValue === 'I claim to be the ') {
				if (selectedGamerole.role === 'troublemaker') {
					this.setState({hotkey: 'troublemaker'});
				}
			}

			this.setState({inputValue: `${currentValue}${selectedGamerole.role}`});
		}

		if (prevProps && prevProps.selectedPlayer.random !== selectedPlayer.random && selectedPlayer.playerName.length) {
			if (currentValue === 'I claim to be the troublemaker and I swapped the cards between ') {
				this.setState({inputValue: `${currentValue}${selectedPlayer.playerName} and `});
			} else if (currentValue === 'I think that ') {
				this.setState({inputValue: `${currentValue}${selectedPlayer.playerName} is a `});
			} else {
				this.setState({inputValue: `${currentValue}${selectedPlayer.playerName}`});
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

			case 'troublemaker':
				textLeft = 'Back';
				textRight = 'I swapped..'
		}

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

	handleLeftHotkeyClick(e) {
		switch (this.state.hotkey) {
			case 'init':
				this.setState({inputValue: 'I claim to be the '});
				this.props.roleState('notify');
				setTimeout(() => {
					this.props.roleState('');
				}, 1000);
				break;

			case 'troublemaker':
				this.setState({hotkey: 'init'});
		}
	}

	handleRightHotkeyClick(e) {
		const $input = $(this.refs.gameChatInput);

		switch (this.state.hotkey) {
			case 'init':
				this.setState({inputValue: 'I think that '});
				break;

			case 'troublemaker':
				this.setState({inputValue: `${this.state.inputValue} and I swapped the cards between `});
				$input.focus();
				$input[0].setSelectionRange($input.val().length);
		}
	}

	handleChatClearClick(e) {
		this.setState({
			inputValue: '',
			hotkey: 'init'
		});
	}

	handleInputChange(e) {
		this.setState({inputValue: `${e.target.value}`});
	}

	handleSubmit(e) {
		const currentValue = this.state.inputValue,
			{ seatNumber } = this.props.userInfo,
			{ gameInfo, userInfo } = this.props;

		e.preventDefault();

		if (currentValue.length) {
			const chat = {
				userName: this.props.userInfo.userName,
				chat: currentValue,
				gameChat: false,
				uid: gameInfo.uid,
				inProgress: gameInfo.inProgress
			}

			if (gameInfo.gameState.isStarted && !gameInfo.gameState.isCompleted && userInfo.seatNumber) {
				const roles = _.uniq(gameInfo.roles),
					roleRegexes = roles.map((role) => {
						return new RegExp(`^i claim to be the ${role}`, 'i');
					});
				
				roleRegexes.forEach((regex) => {
					if (regex.test(currentValue)) {
						const claim = roles.filter((role) => {
							return currentValue.match(new RegExp(`${role}$`, 'i'));
						});

						chat.claim = claim[0];
					}
				});
			}

			this.props.socket.emit('addNewGameChat', chat, this.props.gameInfo.uid);
			this.setState({
				inputValue: '',
				hotkey: 'init'
			});
		}
	}

	scrollChats() {
		const chatsContainer = document.querySelector('section.segment.chats > .ui.list');
		
		if (!this.state.lock) {
			chatsContainer.scrollTop = 999;
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
			return new Date(a.timestamp) - new Date(b.timestamp);
		}).map((chat, i) => {
			const chatContents = chat.chat,
				// playerNames = Object.keys(gameInfo.seated).map((seatName) => {
				// 	return gameInfo.seated[seatName].userName;
				// }),
				players = Object.keys(gameInfo.seated).map((seatName) => {
					return {
						name: gameInfo.seated[seatName].userName
					};
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
											const toRegex = players.map((player) => {
												return player.name;
											}).concat(roles.map((role) => {
												return role.name;
											})).join('|');

										return new RegExp(toRegex, 'i');
									})()),
									combinedToProcess = roles.concat(players);

								combinedToProcess.forEach((item) => {
									const split = chatContents.split(new RegExp(item.name, 'i'));
									
									if (split.length > 1) {
										split.forEach((piece, index) => {
											if (index < split.length - 1) {
												console.log(split);
												const processor = {
													text: item.name,
													index: split[index + 1] === split[index] ? split[index - 1].length : split[index].length,
													type: item.team ? 'roleName' : 'playerName',
												};

												if (item.team) {
													processor.team = item.team;
												}

												console.log(processor);

												toProcessChats.push(processor);
											}
										});
									}
								});


								toProcessChats.sort((a, b) => {
									return a.index - b.index;
								});

								console.log(toProcessChats);
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
						const { gameInfo, userInfo } = this.props;

						return (
							<div className="expando-container">
								<i className={
									(() => {
										let classes = 'large delete icon';

										if (!this.state.inputValue.length) {
											classes += ' app-visibility-hidden';
										}

										return classes;
									})()
								}
								 onClick={this.handleChatClearClick.bind(this)}></i>
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
						<input value={this.state.inputValue} placeholder="Chat.." id="gameChatInput" ref="gameChatInput" onChange={this.handleInputChange.bind(this)} maxLength="300"></input>
						<button className={
							(() => {
								let classes = 'ui primary button';

								if (!this.state.inputValue.length) {
									classes += ' disabled';
								}

								return classes;
							})()
						}>Chat</button>
					</div>
				</form>
			</section>
		);
	}
};