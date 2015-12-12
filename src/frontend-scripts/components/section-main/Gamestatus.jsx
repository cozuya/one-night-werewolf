'use strict';

import React from 'react';

export default class Gamestatus extends React.Component {
	constructor() {
		
	}

	componentDidMount() {
		console.log(this.props.gameInfo);
	}

	render() {
		return (
			<section className="gamestatus">
				<p>{this.props.gameInfo.status}</p>
			</section>
		);
	}
};