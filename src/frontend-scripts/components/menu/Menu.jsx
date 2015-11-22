'use strict';

let React = require('react');

let r = require('react-redux');

let Provider = require('react-redux').Provider;

console.log(r);

module.exports = class Menu extends React.Component {
	render() {
		return (
			<section className="ui menu">
				<p className="item">One Night Werewolf</p>
				<div className="item right">
					<div className="ui buttons">
    					<div className="ui button">Sign in</div>
    					<div className="or"></div>
    					<div className="ui button">Sign up</div>
  					</div>
				</div>
			</section>
		);
	}
};