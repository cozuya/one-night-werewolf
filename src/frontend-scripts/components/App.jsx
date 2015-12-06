'use strict';

import LeftSidebar from './section-left/LeftSidebar.jsx'
import Main from './section-main/Main.jsx'
import RightSidebar from './section-right/RightSidebar.jsx'
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { updateUser, updateMidsection, updateGamelist, updateGameInfo } from '../actions/actions.js';
import socket from 'socket.io-client';

socket = socket();

class App extends React.Component {
	componentWillMount() {
		let { dispatch } = this.props,
			classList = document.getElementById('game-container').classList;

			if (classList.length) {
				dispatch(updateUser({userName: classList[0].split('username-')[1]}));
			}

		socket.on('gameList', (list) => {
			dispatch(updateGamelist(list));
		});

		socket.emit('getGameList');

		// temp for dev of game, remove below
		// dispatch(updateMidsection('game'));
	}

	leftSidebarHandleCreateGameClick() {
		let { dispatch } = this.props;

		dispatch(updateMidsection('createGame'));
	}

	onCreateGameSubmit(game) {
		let { dispatch } = this.props;
		dispatch(updateGameInfo(game));
		dispatch(updateMidsection('game'));
		socket.emit('createGame', game);
	}

	componentDidUpdate() {
		// console.log(this.props);
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
