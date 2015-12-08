'use strict';

import React from 'react';
import $ from 'jquery';
import { roleMap } from '../../../../iso/util.js';
import socket from 'socket.io-client';

socket = socket();

export default class SidebarGame extends React.Component {
	routeToGame(el) {
		socket.emit('getGameInfo', $(el.currentTarget).attr('data-uid'));
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
		game = this.props.game;

		return (
			<div className="ui vertical segment" key={this.props.key} data-uid={game.uid} onClick={this.routeToGame}>
				<div>
					<span className="gamename">{game.name}</span>
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