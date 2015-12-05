'use strict';

import LeftSidebar from './section-left/LeftSidebar.jsx'
import Main from './section-main/Main.jsx'
import RightSidebar from './section-right/RightSidebar.jsx'
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { updateUser, updateMidsection, updateGamelist } from '../actions/actions.js';
import socket from 'socket.io-client';

socket = socket();


class App extends React.Component {
	componentWillMount() {
		let { dispatch } = this.props,
			classList = document.getElementById('game-container').classList;

			if (classList.length) {
				dispatch(updateUser(classList[0].split('username-')[1]));
			}

		socket.on('gameList', (list) => {
			dispatch(updateGamelist(list));
		});

		socket.emit('getGameList');

		// temp for dev of game, remove below
		dispatch(updateMidsection('game'));
	}

	leftSidebarHandleCreateGameClick() {
		let { dispatch } = this.props;

		dispatch(updateMidsection('createGame'));
	}

	onCreateGameSubmit() {
		let { dispatch } = this.props;

		dispatch(updateMidsection('game'));
	}


	render() {
		return (
			<section className="ui grid">
				<LeftSidebar
					userName={this.props.userName}
					midsection={this.props.midSection}
					gameList={this.props.gameList}
					onCreateGameButtonClick={this.leftSidebarHandleCreateGameClick.bind(this)}
				/>
				<Main
					userName={this.props.userName}
					midsection={this.props.midSection}
					onCreateGameSubmit={this.onCreateGameSubmit.bind(this)}
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
