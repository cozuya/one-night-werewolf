'use strict';

import React from 'react';

export default class LeftSidebar extends React.Component {
	render() {
		return (
			<section className="section-left three wide column">
				<button className="ui button primary">Create a new game</button>
			</section>
		);
	}
};