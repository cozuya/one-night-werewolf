'use strict';

import React from 'react';

export default class LeftSidebar extends React.Component {
	createGameClick() {
		this.props.onCreateGameClick();
	}

	createButton() {
		let userName = this.props.userName,
			gameBeingCreated = this.props.midsection === 'createGame',
			disabledText;

		if (userName && !gameBeingCreated) {
			return (
				<button className="ui button primary" onClick={this.createGameClick.bind(this)}>Create a new game</button>
			)
		} else {
			if (gameBeingCreated) {
				disabledText = 'Creating a new game..';
			} else {
				disabledText = 'Sign in to make games';
			}
			return (
				<button className="ui button disabled">{disabledText}</button>
			)
		}
	};

	render() {
		return (
			<section className="section-left three wide column">
				{this.createButton()}
			</section>
		);
	}
};