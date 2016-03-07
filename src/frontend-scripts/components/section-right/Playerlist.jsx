'use strict';

import React from 'react';

export default class Playerlist extends React.Component {
	componentDidUpdate() {
	}

	render() {
		return (
			<section className="playerlist">
				<div className="playerlist-header">
					<div>
						<h3 className="ui header">Lobby</h3>
						{(() => {
							if (Object.keys(this.props.userList).length) {
								return (
									<div>
										<span>{this.props.userList.list.length}</span>
										<i className="large user icon"></i>
										<span>{this.props.userList.totalSockets - this.props.userList.list.length}</span>
										<i className="large unhide icon"></i>
									</div>
								);
							}
						})()}
					</div>
					<div className="ui divider"></div>
				</div>
				<div className="playerlist-body">
				{(() => {
					if (Object.keys(this.props.userList).length) {
						let { list } = this.props.userList;
						
						list.sort((a, b) => {
							let aTotal = a.wins + a.losses,
								bTotal = b.wins + b.losses;

							if (a.userName === 'coz' || a.userName === 'stine') {
								return -1;
							}

							if (aTotal > 9 && bTotal > 9) {
								if (a.wins / aTotal >= b.wins / bTotal) {
									return -1;
								} else {
									return +1;
								}
							} else if (aTotal > 9) {
								return -1;
							} else if (bTotal > 9) {
								return +1;
							}

							if (a.wins >= b.wins) {
								return -1;
							} else if (b.wins > a.wins) {
								return +1;
							}

							if (a.userName > b.userName) {
								return +1;
							} else {
								return -1;
							}
						});

						return list.map((user, i) => {
							let percent = ((user.wins / (user.wins + user.losses)) * 100).toFixed(0),
								percentDisplay = (user.wins + user.losses) > 9 ? `${percent}%` : '';

							return (
								<div key={i}>
									<span style={{color: user.userName === 'coz' ? 'red' : ''}}>{user.userName}</span> <div className="userlist-stats-container">(<span className="userlist-stats">{user.wins}</span> / <span className="userlist-stats">{user.losses}</span>) <span className="userlist-stats"> {percentDisplay}</span></div>
								</div>
							);
						});
					}
				})()}
				</div>
			</section>
		);
	}
};