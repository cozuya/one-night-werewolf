'use strict';

import React from 'react';

export default class LeftSidebar extends React.Component {
	constructor() {
		// this.handleChangeRole = this.handleChangeRole.bind(this);
		
		// this.state = {
		// 	roles: ['werewolf', 'werewolf']
		// }
	}

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

	gameList() {
		let roleMap = {
			werewolf: {
				initial: 'WW',
				team: 'werewolf'
			},
			minion: {
				initial: 'Mi',
				team: 'werewolf'
			},
			mason: {
				initial: 'Ma',
				team: 'village'
			},
			seer: {
				initial: 'S',
				team: 'village'
			},
			robber: {
				initial: 'R',
				team: 'village'
			},
			troublemaker: {
				initial: 'TM',
				team: 'village'
			},
			hunter: {
				initial: 'H',
				team: 'village'
			},			
			tanner: {
				initial: 'T',
				team: 'tanner'
			},
			insomniac: {
				initial: 'I',
				team: 'village'
			},
			villager: {
				initial: 'V',
				team: 'village'
			}
		},
		setClass = (role) => {
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
			)
		});
	}

	render() {
		return (
			<section className="section-left three wide column leftsidebar">
				{this.createButton()}
				{this.gameList()}
			</section>
		);
	}
};