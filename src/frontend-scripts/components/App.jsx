'use strict';

import React from 'react';
import LeftSidebar from './section-left/LeftSidebar.jsx'
import Main from './section-main/Main.jsx'
import RightSidebar from './section-right/RightSidebar.jsx'

export default class App extends React.Component {
	render() {
		console.log(this.props);
		return (
			<section className="ui grid">
				<LeftSidebar />
				<Main />
				<RightSidebar />
			</section>
		);
	}
};