'use strict';

let React = require('react');


module.exports = class Menu extends React.Component {
	render() {
		return (
			<section className="ui large menu visible">
				<p className="item">One Night Werewolf</p>
				<div className="item right">
					<a className="ui inverted button">Sign in</a>
					<a className="ui inverted button">Sign up</a>
				</div>
			</section>
		);
	}
};