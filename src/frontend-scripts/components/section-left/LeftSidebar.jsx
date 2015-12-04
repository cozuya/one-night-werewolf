'use strict';

import React from 'react';
import $ from 'jquery';
import Popup from 'semantic-ui-popup';
import { roleMap } from '../../../../iso/util.js';

$.fn.popup = Popup;

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

	gameList() {
		let setClass = (role) => {
			return roleMap[role].team;
		},
		renderRoles = (roles) => {
			return roles.map((role, i) => {
				return (
					<div key={i} className={setClass(role)}>{roleMap[role].initial}</div>
				);
			});
		};

		return this.props.gameList.map((game, i) => {
			return (
				<div className="ui vertical segment" key={i}>
					<div>
						<span className="gamename">{game.name}</span>
						<span className="gamelength">{game.time}</span>
						<span className="seatedcount">{game.seated.length}/7</span>
					</div>
					<div className="rolelist">
						<div>
							{renderRoles(game.roles.slice(0, 5))}
						</div>
						<div>
							{renderRoles(game.roles.slice(5, 10))}
						</div>
					</div>
				</div>
			);
		});

	}

	render() {
		return (
			<section className={this.visibleStatus()}>
				{this.createButton()}
				{this.gameList()}
			</section>
		);
	}
};