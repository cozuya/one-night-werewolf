'use strict';

import React from 'react';
import $ from 'jquery';
import Popup from 'semantic-ui-popup';

$.fn.popup = Popup;

export default class Gameroles extends React.Component {
	constructor() {
		
	}

	componentDidMount() {
		// $(`${this.refs.rolecontainer} > div:first-child`).popup({
		// 	inline: true,
		// 	hoverable: true,
		// 	position: 'bottom center',
		// 	delay: {
		// 		show: 300,
		// 		hide: 800
		// 	}
		// });
	}

	setClasses(role) {
		return `role-${role}`;
	}

	// {this.props.roles.map((el, i) => {
	// 				return (
	// 					<div className={setClasses(el))} key={i}></div>
	// 				)
	// 			})}

	render() {
		return (
			<section className="gameroles" ref="rolecontainer">
				
			</section>
		);
	}
};