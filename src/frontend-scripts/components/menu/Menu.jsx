'use strict';

let React = require('react');

module.exports = class Menu extends React.Component {
	render() {
		return (
			<section className="top ui sidebar menu visible pusher">
				<p className="item">One Night Werewolf</p>
				<a className="item right">Sign in</a>
				<a className="item right">Sign up</a>
			</section>
		);
	}
};