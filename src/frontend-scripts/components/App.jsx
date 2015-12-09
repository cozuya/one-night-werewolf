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
			dispatch(updateUser({
				userName: classList[0].split('username-')[1],
			}));
		}

		socket.on('gameList', (list) => {
			dispatch(updateGameList(list));
		});

		socket.on('gameUpdate', (game) => {
			dispatch(updateGameInfo(game));
			if (this.props.midsection !== 'game') {
				dispatch(updateMidsection('game'));
			}
		});

		socket.emit('getGameList');
	}

	componentDidUpdate() {
		// console.log(this.props.userInfo);
	}

	leftSidebarHandleCreateGameClick() {
		let { dispatch } = this.props;

		dispatch(updateMidsection('createGame'));
	}

	onCreateGameSubmit(game) {
		let { dispatch } = this.props,
			userInfo = this.props.userInfo;

		console.log(game);

		userInfo.isSeated = true;

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
						isSeated: true,
						userName: this.props.userInfo.userName
					}
				},
				seatedCount: 1,
				time: '3:00',
				uid: Math.random().toString(36).substring(6)
			};

		userInfo.isSeated = true;

		dispatch(updateGameInfo(game));
		dispatch(updateMidsection('game'));
		dispatch(updateUser(userInfo));
		socket.emit('createGame', game);
	}

	updateSeatedUsersInGame(seatNumber, user) {
		// method needs work

		let uid = this.props.gameInfo.uid,
			{ dispatch } = this.props,
			userInfo = this.props.userInfo,
			data = {
				uid,
				seatNumber,
				user
			};

		socket.emit('getGameInfo', uid);

		if (!data.user) {
			dispatch(updateMidsection('default'));
		}

		console.log(user);
		console.log(userInfo);

		if (user.userName === userInfo.userName) {
			userInfo.isSeated = true;
			dispatch(updateUser(userInfo));
		} else {
			userInfo.isSeated = false;
			dispatch(updateUser(userInfo));
		}

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
					gameInfo={this.props.gameInfo}
					updateSeatedUsers={this.updateSeatedUsersInGame.bind(this)}
					quickDefault={this.makeQuickDefault.bind(this)}
				/>
				<RightSidebar />
			</section>
		);
	}
};

let select = (state) => {
	return state;
}

export default connect(select)(App);
