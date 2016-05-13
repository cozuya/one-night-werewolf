'use strict';

import LeftSidebar from './section-left/LeftSidebar.jsx';
import Main from './section-main/Main.jsx';
import RightSidebar from './section-right/RightSidebar.jsx';
import React from 'react';
import { connect } from 'react-redux';
import { updateUser, updateMidsection, updateGameList, updateGameInfo, updateUserList, updateGeneralChats } from '../actions/actions.js';
import socket from 'socket.io-client';

socket = socket();

class App extends React.Component {
	componentWillMount() {
		let { dispatch } = this.props,
			{ classList } = document.getElementById('game-container');

		if (classList.length) {
			let username = classList[0].split('username-')[1];

			dispatch(updateUser({userName: username}));
			socket.emit('getUserGameSettings', username);
		}

		socket.on('manualDisconnection', () => {
			window.location.pathname = '/observe';
		});

		socket.on('gameSettings', (settings) => {
			let { userInfo } = this.props;

			userInfo.gameSettings = settings;
			dispatch(updateUser(userInfo));
		});

		socket.on('gameList', (list) => {
			dispatch(updateGameList(list));
		});

		socket.on('gameUpdate', (game, isSettings) => {
			if (this.props.midSection !== 'game' && Object.keys(game).length) {
				dispatch(updateGameInfo(game));
				dispatch(updateMidsection('game'));
			} else if (!Object.keys(game).length) {
				if (isSettings) {
					dispatch(updateMidsection('settings'));
				} else {
					dispatch(updateMidsection('default'));
				}
				dispatch(updateGameInfo(game));
			} else {
				dispatch(updateGameInfo(game));
			}
		});

		socket.on('userList', (list) => {
			dispatch(updateUserList(list));
		});

		socket.on('updateSeatForUser', (seatNumber) => {
			let { userInfo } = this.props;

			userInfo.seatNumber = seatNumber;
			dispatch(updateUser(userInfo));
		});

		socket.on('generalChats', (chats) => {
			dispatch(updateGeneralChats(chats));
		});
	}

	handleRoute(route) {
		let { dispatch } = this.props;

		dispatch(updateMidsection(route));
	}

	handleCreateGameSubmit(game) {
		let { dispatch, userInfo } = this.props;

		userInfo.seatNumber = '0';
		dispatch(updateGameInfo(game));
		dispatch(updateMidsection('game'));
		dispatch(updateUser(userInfo));
		socket.emit('addNewGame', game);
	}

	handleGeneralChatSubmit(chat) {
		socket.emit('addNewGeneralChat', chat);
	}

	handleUserNightActionEventSubmit(event) {
		socket.emit('userNightActionEvent', event);
	}

	handleUpdateTruncateGameSubmit(event) {
		socket.emit('updateTruncateGame', event);
	}

	handleUpdateSelectedForEliminationSubmit(event) {
		socket.emit('updateSelectedForElimination', event);
	}

	handleUpdateReportGameSubmit(event) {
		socket.emit('updateReportGame', event);
	}

	handleUpdateGameSettingsSubmit(event) {
		socket.emit('updateGameSettings', event);
	}

	handleNewGameChatSubmit(chat, uid) {
		socket.emit('addNewGameChat', chat, uid);
	}

	handleSidebarGameClicked(uid) {
		socket.emit('getGameInfo', uid);
	}

	// ***** begin dev helpers *****

	// componentDidUpdate(prevProps) {  // note: this breaks everything if these players try to leave a finished game
	// 	let autoPlayers = ['Jaina', 'Rexxar', 'Malfurian', 'Thrall', 'Valeera'],
	// 		{ userInfo, gameInfo, dispatch } = this.props,
	// 		prevSeatedNames = [];

	// 		if (Object.keys(prevProps).length && prevProps.gameInfo && prevProps.gameInfo.seated) {
	// 			prevSeatedNames = Object.keys(prevProps.gameInfo.seated).map((seatName) => {
	// 				return prevProps.gameInfo.seated[seatName].userName;
	// 			});
	// 		}

	// 	if (!prevSeatedNames.indexOf(userInfo.userName) !== -1 && autoPlayers.indexOf(userInfo.userName) !== -1 && !Object.keys(gameInfo).length) {
	// 		userInfo.seatNumber = (autoPlayers.indexOf(userInfo.userName) + 1).toString();
	// 		dispatch(updateUser(userInfo));
	// 		socket.emit('updateSeatedUsers', {
	// 			uid: 'devgame',
	// 			seatNumber: userInfo.seatNumber,
	// 			userInfo
	// 		});
	// 	}
	// }


	makeQuickDefault() {
		let { dispatch, userInfo } = this.props,
			game = {
				kobk: false,
				name: 'New Game',
				// roles: ['werewolf', 'werewolf', 'werewolf', 'werewolf', 'werewolf', 'villager', 'villager', 'villager', 'villager', 'villager'],
				roles: ['werewolf', 'werewolf', 'seer', 'robber', 'troublemaker', 'robber', 'hunter', 'villager', 'villager', 'insomniac'],
				// roles: ['werewolf', 'werewolf', 'robber', 'troublemaker', 'mason', 'minion', 'troublemaker', 'mason', 'robber', 'troublemaker'],
				seated: {
					seat0: {
						userName: userInfo.userName,
						connected: true
					}
				},
				status: 'Waiting for more players..',
				chats: [],
				gameState: {
					reportedGame: {
						0: false,
						1: false,
						2: false,
						3: false,
						4: false,
						5: false,
						6: false
					}
				},
				tableState: {
					seats: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]
				},
				time: ':16',
				// uid: Math.random().toString(36).substring(2)
				uid: 'devgame'
			};

		userInfo.seatNumber = '0';
		dispatch(updateGameInfo(game));
		dispatch(updateMidsection('game'));
		dispatch(updateUser(userInfo));
		socket.emit('addNewGame', game);
	}

	// ***** end dev helpers *****

	handleSeatingUser(seatNumber) {
		let { gameInfo } = this.props,
			{ dispatch, userInfo } = this.props,
			data = {
				uid: gameInfo.uid,
				seatNumber,
				userName: userInfo.userName
			};

		userInfo.seatNumber = seatNumber;
		socket.emit('updateSeatedUser', data);
		dispatch(updateUser(userInfo));
	}
	
	handleLeaveGame(seatNumber, isSettings = false) {
		let { dispatch, userInfo } = this.props;

		if (userInfo.seatNumber) {
			userInfo.seatNumber = '';
			dispatch(updateUser(userInfo));
		}
		
		socket.emit('leaveGame', {
			userName: this.props.userInfo.userName,
			seatNumber,
			isSettings,
			uid: this.props.gameInfo.uid
		});
	}

	render() {
		return (
			<section className="ui grid">
				{(() => {
					if (this.props.midSection !== 'game') {
						return (
							<LeftSidebar
								userInfo={this.props.userInfo}
								midSection={this.props.midSection}
								gameList={this.props.gameList}
								onCreateGameButtonClick={this.handleRoute.bind(this)}
								sidebarGameClicked={this.handleSidebarGameClicked.bind(this)}
							/>
						);
					}
				})()}
				<Main
					userInfo={this.props.userInfo}
					midSection={this.props.midSection}
					onCreateGameSubmit={this.handleCreateGameSubmit.bind(this)}
					onUserNightActionEventSubmit={this.handleUserNightActionEventSubmit.bind(this)}
					onUpdateTruncateGameSubmit={this.handleUpdateTruncateGameSubmit.bind(this)}
					onUpdateSelectedForEliminationSubmit={this.handleUpdateSelectedForEliminationSubmit.bind(this)}
					onUpdateReportGame={this.handleUpdateReportGameSubmit.bind(this)}
					onUpdatedGameSettings={this.handleUpdateGameSettingsSubmit.bind(this)}
					onLeaveCreateGame={this.handleRoute.bind(this)}
					onNewGameChat={this.handleNewGameChatSubmit.bind(this)}
					gameInfo={this.props.gameInfo}
					onLeaveSettings={this.handleRoute.bind(this)}
					onSeatingUser={this.handleSeatingUser.bind(this)}
					onLeaveGame={this.handleLeaveGame.bind(this)}
					quickDefault={this.makeQuickDefault.bind(this)}
					onSettingsButtonClick={this.handleRoute.bind(this)}
				/>
				{(() => {
					if (this.props.midSection === 'game' && this.props.userInfo.gameSettings && !this.props.userInfo.gameSettings.disableRightSidebarInGame || !this.props.userInfo.userName || this.props.midSection !== 'game') {
						return (
							<RightSidebar
								userInfo={this.props.userInfo}
								userList={this.props.userList}
								generalChats={this.props.generalChats}
								onGeneralChatSubmit={this.handleGeneralChatSubmit.bind(this)}
							/>
						);
					}
				})()}
			</section>
		);
	}
};

let select = (state) => {
	return state;
}

export default connect(select)(App);