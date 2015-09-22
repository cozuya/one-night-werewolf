'use strict';

let React = require('react');

module.exports = class Game extends React.Component {
	render() {
		return (
			<section className="main">
				<Left />
				<Middle />
				<Right />
			</section>
		);
	}
};