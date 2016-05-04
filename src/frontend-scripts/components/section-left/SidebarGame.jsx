'use strict';

import React from 'react';
import { roleMap } from '../../../../iso/util.js';

export default class SidebarGame extends React.Component {
	routeToGame(el) {
		this.props.sidebarGameClicked(el.currentTarget.getAttribute('data-uid'));
	}

	render() {
		let setClass = (role) => {
			return roleMap[role].team;
		},
		renderRoles = (roles) => {
			return roles.map((role, i) => {
				return (
					<div key={i} className={setClass(role)}>{roleMap[role].initial}</div>
				);
			});
		},
		{ game } = this.props,
		gameClasses = () => {
			let classes = 'ui vertical segment';

			if (game.gameState.isStarted && !game.gameState.isCompleted) {
				classes += ' inprogress';
			}

			if (game.gameState.isCompleted) {
				classes += ' completed';
			}

			return classes;
		}

		return (
			<div className={gameClasses()} key={this.props.key} data-uid={game.uid} onClick={this.routeToGame.bind(this)}>
				<div>
					<span className={game.kobk ? "gamename kobk" : "gamename"}>{game.name}</span>
					<span className="gamelength">{game.time}</span> 
					<span className="seatedcount">{game.seatedCount}/7</span>
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
	}
};