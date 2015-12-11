'use strict';

import LeftSidebar from './section-left/LeftSidebar.jsx'
import Main from './section-main/Main.jsx'
import RightSidebar from './section-right/RightSidebar.jsx'
import React, { Component, PropTypes } from 'react';
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

			socket.emit('checkNewlyConnectedUserStatus');
			socket.emit('getUserGameSettings');
		}

		socket.on('gameSettings', (settings) => {
			let user = this.props.userInfo;

			delete settings.__v
			delete settings._id
			delete settings.username;

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

	componentDidUpdate() {
	}

	onLeaveCreateGame() {
		let { dispatch } = this.props;

		dispatch(updateMidsection('default'));
	}

	leftSidebarHandleCreateGameClick() {
		let { dispatch } = this.props;

		dispatch(updateMidsection('createGame'));
	}

	rightSidebarHandleSettingClick() {
		let { dispatch } = this.props;

		dispatch(updateMidsection('settings'));
	}

	handleRouteToDefault() {
		let { dispatch } = this.props;

		dispatch(updateMidsection('default'));
	}

	onCreateGameSubmit(game) {
		let { dispatch } = this.props,
			userInfo = this.props.userInfo;

		dispatch(updateGameInfo(game));
		dispatch(updateMidsection('game'));
		dispatch(updateUser(userInfo));
		socket.emit('createGame', game);
	}

	makeQuickDefault() {
		// dev only
		let { dispatch } = this.props,
			userInfo = this.props.userInfo,
			game = {
				inProgress: false,
				kobk: true,
				name: 'New Game',
				roles: ['werewolf', 'werewolf', 'seer', 'robber', 'troublemaker', 'insomniac', 'hunter', 'villager', 'villager', 'villager'],
				seated: {
					seat1: {
						userName: this.props.userInfo.userName
					}
				},
				seatedCount: 1,
				time: '3:00',
				uid: Math.random().toString(36).substring(6)
			};


		dispatch(updateGameInfo(game));
		dispatch(updateMidsection('game'));
		dispatch(updateUser(userInfo));
		socket.emit('createGame', game);
	}

	updateSeatedUsersInGame(seatNumber) {
		let uid = this.props.gameInfo.uid,
			userInfo = this.props.userInfo,
			data = {
				uid,
				seatNumber,
				userInfo
			};

		socket.emit('updateSeatedUsers', data);
	}

	render() {
		return (
			<section className="ui grid">
				<LeftSidebar
					userInfo={this.props.userInfo}
					midsection={this.props.midSection}
					gameList={this.props.gameList}
					onCreateGameButtonClick={this.leftSidebarHandleCreateGameClick.bind(this)}
				/>
				<Main
					userInfo={this.props.userInfo}
					midsection={this.props.midSection}
					onCreateGameSubmit={this.onCreateGameSubmit.bind(this)}
					leaveCreateGame={this.onLeaveCreateGame.bind(this)}
					gameInfo={this.props.gameInfo}
					updateSeatedUsers={this.updateSeatedUsersInGame.bind(this)}
					quickDefault={this.makeQuickDefault.bind(this)}
				/>
				<RightSidebar
					userInfo={this.props.userInfo}
					settingClick={this.rightSidebarHandleSettingClick.bind(this)}
					routeToDefault={this.handleRouteToDefault.bind(this)}
				/>
			</section>
		);
	}
};

let select = (state) => {
	return state;
}

export default connect(select)(App);
