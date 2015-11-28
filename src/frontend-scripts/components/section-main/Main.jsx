'use strict';

import React from 'react';
import Menu from '../menu/Menu.jsx';

export default class Main extends React.Component {
	render() {
		return (
			<section className="section-main ten wide column">
				<Menu userName={this.props.userName} />
			</section>
		);
	}
};