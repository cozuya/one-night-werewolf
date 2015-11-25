'use strict';

let React = require('react'),
	Menu = require('../menu/Menu.jsx');

export default class Main extends React.Component {
	render() {
		return (
			<section className="section-main ten wide column">
				<Menu />
			</section>
		);
	}
};