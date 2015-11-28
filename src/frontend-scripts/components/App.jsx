'use strict';

import LeftSidebar from './section-left/LeftSidebar.jsx'
import Main from './section-main/Main.jsx'
import RightSidebar from './section-right/RightSidebar.jsx'
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { updateUser } from '../actions/actions.js';

class App extends React.Component {
	componentWillMount() {
		let { dispatch } = this.props,
			classList = document.getElementById('game-container').classList,
			user;

			if (classList.length) {
				user = classList[0].split('username-')[1];
				dispatch(updateUser(user));
			}
	}

	render() {
		return (
			<section className="ui grid">
				<LeftSidebar userName={this.props.userName} />
				<Main userName={this.props.userName} />
				<RightSidebar />
			</section>
		);
	}
};

let select = (state) => {
	return state;
}

export default connect(select)(App);