'use strict';

import React from 'react';
import $ from 'jquery';
import SidebarGame from './SidebarGame.jsx';

export default class LeftSidebar extends React.Component {
	createGameClick() {
		this.props.onCreateGameButtonClick();
	}

	visibleStatus() {
		let classes = 'section-left three wide column leftsidebar';

		if (this.props.midsection === 'game') {
			classes += ' app-hidden';
		}

		return classes;
	}

	createButton() {
		let userName = this.props.userInfo.userName,
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

	gameClicked(el) {
		let uid = $(el.currentTarget).attr('data-uid');

		this.props.onGameClick(uid);
	}

	render() {
		return (
			<section className={this.visibleStatus()}>
				{this.createButton()}
				{this.props.gameList.map((game, i) => {
					return <SidebarGame clickedGame={this.gameClicked.bind(this)} key={i} game={game} />
				})}
			</section>
		);
	}
};