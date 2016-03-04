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
				{(() => {
					let userList = this.props.userList;

					userList.sort((a, b) => { // todo this doesn't work and you're bad and you should feel bad
						let aTotal = a.wins + a.losses,
							bTotal = b.wins + b.losses;

						if (a.userName === 'coz') {
							return +1;
						}

						if (aTotal > 9 && bTotal > 9) {
							if (a.wins / aTotal >= b.wins / bTotal) {
								return -1;
							} else {
								return +1;
							}
						} else if (aTotal > 9) {
							return +1;
						} else if (bTotal > 9) {
							return +1;
						}

						return 0;
					});

					return userList.map((user, i) => {
						let percent = ((user.wins / (user.wins + user.losses)) * 100).toFixed(0),
							percentDisplay = (user.wins + user.losses) > 9 ? `${percent}%` : '';

						return (
							<div key={i}>
								<span style={{color: user.userName === 'coz' ? 'red' : ''}}>{user.userName}</span> <div className="userlist-stats-container">(<span className="userlist-stats">{user.wins}</span> / <span className="userlist-stats">{user.losses}</span>) <span className="userlist-stats"> {percentDisplay}</span></div>
							</div>
						);
					});
				})()}
			</section>
		);
	}
};