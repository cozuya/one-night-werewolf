'use strict';

let React = require('react'),
	Menu = require('../menu/Menu.jsx');

module.exports = class Middle extends React.Component {
	render() {
		return (
			<section className="section-main ten wide column">
				<Menu />
			</section>
		);
	}
};