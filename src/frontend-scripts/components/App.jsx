'use strict';

import LeftSidebar from './section-left/LeftSidebar.jsx'
import Main from './section-main/Main.jsx'
import RightSidebar from './section-right/RightSidebar.jsx'
import React from 'react';
import { connect } from 'react-redux';
import { updateUser, updateMidsection, updateGameList, updateGameInfo } from '../actions/actions.js';
import socket from 'socket.io-client';

socket = socket();

class App extends React.Component {
	componentWillMount() {
		let { dispatch } = this.props,
			classList = document.getElementById('game-container').classList;

		if (classList.length) {
			let name = {
				userName: classList[0].split('username-')[1]
			}

			dispatch(updateUser(name));
			socket.emit('getUserGameSettings');
			setTimeout(() => {
				// probably a better way to do this but oh well
				socket.emit('checkNewlyConnectedUserStatus');
			}, 500);
		}

		socket.on('gameSettings', (settings) => {
			let user = this.props.userInfo;

			// todo: this needs to also update the gameInfo object on the front and possibly back end.
			user.gameSettings = settings.gameSettings;
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

		socket.emit('getGameList');
	}

	handleRoute(route) {
		let { dispatch } = this.props;

		dispatch(updateMidsection(route));
	}

	handleCreateGameSubmit(game) {
		let { dispatch, userInfo } = this.props;

		console.log(game);
		userInfo.seatNumber = '0'; // todo: remove this when a player leaves a game they're seated at
		dispatch(updateGameInfo(game));
		dispatch(updateMidsection('game'));
		dispatch(updateUser(userInfo));
		socket.emit('createGame', game);
	}

	// ***** dev helpers only *****
	makeQuickDefault() {
		let { dispatch } = this.props,
			userInfo = this.props.userInfo,
			game = {
				inProgress: false,
				kobk: true,
				name: 'New Game',
				// roles: ['werewolf', 'werewolf', 'seer', 'robber', 'troublemaker', 'insomniac', 'hunter', 'villager', 'villager', 'villager'],
				roles: ['werewolf', 'werewolf', 'robber', 'troublemaker', 'mason', 'minion', 'troublemaker', 'mason', 'robber', 'troublemaker'],
				seated: {
					seat0: {
						userName: this.props.userInfo.userName
					}
				},
				status: 'Waiting for more players..',
				chats: [],
				tableState: {
					cardsDealt: false
				},
				seatedCount: 1,
				time: ':3',
				uid: Math.random().toString(36).substring(6)
			};

		userInfo.seatNumber = '0';
		dispatch(updateGameInfo(game));
		dispatch(updateMidsection('game'));
		dispatch(updateUser(userInfo));
		socket.emit('createGame', game);
	}

	// ***** end dev helpers *****

	updateSeatedUsersInGame(seatNumber) {
		let uid = this.props.gameInfo.uid,
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