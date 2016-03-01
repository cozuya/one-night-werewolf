'use strict';

import React from 'react';

export default class Playerlist extends React.Component {
	// componentDidUpdate() {
	// 	console.log(this.props);
	// }

	render() {
		return (
			<section className="playerlist">
				<h3 className="ui header">Logged in players:</h3>
				<div className="ui divider"></div>
				{this.props.userList.map((user, i) => {
					return (
						<div className="" key={i}>
							{user.user}
						</div>
					);
				})}
			</section>
		);
	}
};