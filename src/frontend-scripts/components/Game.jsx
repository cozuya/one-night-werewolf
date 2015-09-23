'use strict';

let React = require('react'),
	Menu = require('./menu/Menu.jsx'),
	Left = require('./left/Left.jsx'),
	Middle = require('./middle/Middle.jsx'),
	Right = require('./right/Right.jsx');

module.exports = class Game extends React.Component {
	render() {
		return (
			<section className="main">
				<Left />
				<Menu />
				<Middle />
				<Right />
			</section>
		);
	}
};