'use strict';

let React = require('react');

module.exports = class Left extends React.Component {
	render() {
		return (
			<section className="section-left three wide column">
				<button className="ui button primary">Create a new game</button>
			</section>
		);
	}
};