'use strict';

let React = require('react'),
	LeftSidebar = require('./section-left/LeftSidebar.jsx'),
	Main = require('./section-main/Main.jsx'),
	RightSidebar = require('./section-right/RightSidebar.jsx');


module.exports = class Game extends React.Component {
	render() {
		return (
			<section>
				<LeftSidebar />
				<Main />
				<RightSidebar />
			</section>
		);
	}
};