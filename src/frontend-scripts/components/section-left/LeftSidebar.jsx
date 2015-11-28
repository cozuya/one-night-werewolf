'use strict';

import React from 'react';

export default class LeftSidebar extends React.Component {
	render() {
		let userName = this.props.userName,
			createButton = (() => {
				if (userName) {
					return (
						<button className="ui button primary">Create a new game</button>
					)
				} else {
					return (
						<button className="ui button disabled">Sign in to make games</button>
					)
				}
			})();

		return (
			<section className="section-left three wide column">
				{createButton}
			</section>
		);
	}
};