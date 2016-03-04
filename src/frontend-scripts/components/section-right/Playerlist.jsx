'use strict';

import React from 'react';

export default class Playerlist extends React.Component {
	componentWillUpdate (nextProps) {
		// todo sort list here?
	}

	render() {
		return (
			<section className="playerlist">
				<h3 className="ui header">Logged in players:</h3>
				<div className="ui divider"></div>
				{this.props.userList.map((user, i) => {
					let percent = ((user.wins / (user.wins + user.losses)) * 100).toFixed(0);

					return (
						<div className="" key={i}>
							{user.userName} (<span className="userlist-stats">{user.wins}</span> / <span className="userlist-stats">{user.losses}</span>) <span className="userlist-stats"> {isNaN(percent) ? '-' : percent}%</span>
						</div>
					);
				})}
			</section>
		);
	}
};