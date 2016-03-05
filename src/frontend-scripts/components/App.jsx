'use strict';

import LeftSidebar from './section-left/LeftSidebar.jsx'
import Main from './section-main/Main.jsx'
import RightSidebar from './section-right/RightSidebar.jsx'
import React from 'react';
import { connect } from 'react-redux';
import { updateUser, updateMidsection, updateGameList, updateGameInfo, updateUserList } from '../actions/actions.js';
import socket from 'socket.io-client';

socket = socket();

class App extends React.Component {
	componentWillMount() {
		let { dispatch } = this.props,
			{ classList } = document.getElementById('game-container');

		if (classList.length) {
			dispatch(updateUser({
				userName: classList[0].split('username-')[1]
			}));
			socket.emit('getUserGameSettings');
		}

		setTimeout(() => {
			// probably a better way to do this but oh well
			socket.emit('checkNewlyConnectedUserStatus');
		}, 500);

		socket.on('gameSettings', (settings) => {
			let user = this.props.userInfo;

			user.gameSettings = settings;
			dispatch(updateUser(user));
		});

		socket.on('gameList', (list) => {
			dispatch(updateGameList(list));
		});

		socket.on('gameUpdate', (game) => {
			if (this.props.midsection !== 'game' && Object.keys(game).length) {
				dispatch(updateGameInfo(game));
				dispatch(updateMidsection('game'));
			} else {
				dispatch(updateMidsection('default'));
				dispatch(updateGameInfo(game));
			}
		});

		socket.on('userList', (list) => {
			dispatch(updateUserList(list));
		});

		socket.on('updateSeatForUser', (seatNumber) => {
			let user = this.props.userInfo;

			user.seatNumber = seatNumber;
			dispatch(updateUser(user));
		})

		socket.emit('getGameList');
		socket.emit('getUserList');
	}

	handleRoute(route) {
		let { dispatch } = this.props;

		dispatch(updateMidsection(route));
	}

	handleCreateGameSubmit(game) {
		let { dispatch, userInfo } = this.props;

		userInfo.seatNumber = '0'; // todo: remove this when a player leaves a game they're seated at  - not sure if this todo is still valid
		dispatch(updateGameInfo(game));
		dispatch(updateMidsection('game'));
		dispatch(updateUser(userInfo));
		socket.emit('createGame', game);
	}

	// ***** dev helpers only *****

	componentDidUpdate(prevProps) {
		// let autoPlayers = ['Jaina', 'Rexxar', 'Malfurian', 'Thrall', 'Valeera'],
		// 	{ userInfo, gameInfo, dispatch } = this.props,
		// 	prevSeatedNames = [];

		// 	if (Object.keys(prevProps).length && prevProps.gameInfo && prevProps.gameInfo.seated) {
		// 		prevSeatedNames = Object.keys(prevProps.gameInfo.seated).map((seatName) => {
		// 			return prevProps.gameInfo.seated[seatName].userName;
		// 		});
		// 	}

		// if (!prevSeatedNames.indexOf(userInfo.userName) !== -1 && autoPlayers.indexOf(userInfo.userName) !== -1 && !Object.keys(gameInfo).length) {
		// 	userInfo.seatNumber = (autoPlayers.indexOf(userInfo.userName) + 1).toString();
		// 	dispatch(updateUser(userInfo));
		// 	socket.emit('updateSeatedUsers', {
		// 		uid: 'devgame',
		// 		seatNumber: userInfo.seatNumber,
		// 		userInfo
		// 	});
		// }
	}

	makeQuickDefault() {
		let { dispatch, userInfo } = this.props,
			game = {
				inProgress: false,
				kobk: false,
				name: 'New Game',
				roles: ['werewolf', 'werewolf', 'villager', 'villager', 'villager', 'villager', 'villager', 'villager', 'villager', 'villager'],
				// roles: ['werewolf', 'werewolf', 'seer', 'robber', 'troublemaker', 'insomniac', 'hunter', 'villager', 'villager', 'villager'],
				// roles: ['werewolf', 'werewolf', 'robber', 'troublemaker', 'mason', 'minion', 'troublemaker', 'mason', 'robber', 'troublemaker'],
				seated: {
					seat0: {
						userName: userInfo.userName
					}
				},
				status: 'Waiting for more players..',
				chats: [],
				tableState: {
					cardsDealt: false
				},
				time: ':03',
				// uid: Math.random().toString(36).substring(2)
				uid: 'devgame'
			};

		userInfo.seatNumber = '0';
		dispatch(updateGameInfo(game));
		dispatch(updateMidsection('game'));
		dispatch(updateUser(userInfo));
		socket.emit('createGame', game);
	}

	// ***** end dev helpers *****

	updateSeatedUsersInGame(seatNumber) {
		let { uid } = this.props.gameInfo,
			{ dispatch, userInfo } = this.props,
			data = {
				uid,
				seatNumber,
				userInfo
			};

		userInfo.seatNumber = seatNumber;
		dispatch(updateUser(userInfo));
		socket.emit('updateSeatedUsers', data);
	}

	render() {
		return (
			<section className="ui grid">
				<LeftSidebar
					userInfo={this.props.userInfo}
					midsection={this.props.midSection}
					gameList={this.props.gameList}
					onCreateGameButtonClick={this.handleRoute.bind(this)}
				/>
				<Main
					userInfo={this.props.userInfo}
					midsection={this.props.midSection}
					onCreateGameSubmit={this.handleCreateGameSubmit.bind(this)}
					onLeaveCreateGame={this.handleRoute.bind(this)}
					gameInfo={this.props.gameInfo}
					onLeaveSettings={this.handleRoute.bind(this)}
					updateSeatedUsers={this.updateSeatedUsersInGame.bind(this)}
					quickDefault={this.makeQuickDefault.bind(this)}
				/>
				<RightSidebar
					userInfo={this.props.userInfo}
					userList={this.props.userList}
					onSettingsButtonClick={this.handleRoute.bind(this)}
				/>
			</section>
		);
	}
};

let select = (state) => {
	return state;
}

export default connect(select)(App);