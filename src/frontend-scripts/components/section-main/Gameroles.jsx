'use strict';

import React from 'react';
import $ from 'jquery';
import Popup from 'semantic-ui-popup';
import { roleMap } from '../../../../iso/util.js';

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
		return `roles ${role}`;
	}

	formatRoles(role) {
		return role === 'troublemaker' ? 'trouble\nmaker' : role;
	}

	renderRoles(roles) {
		return roles.map((role, i) => {
			return (
				<div className={this.setClasses(role)} key={i}>
					<p>{this.formatRoles(role)}</p>
					<div className="ui small popup transition hidden">
						{roleMap[role].description}
					</div>
				</div>
			);
		});
	}


	render() {
		return (
			<section className="gameroles" ref="rolecontainer">
				<div className="ui right pointing label">
  					Roles in this game:
				</div>
				{this.renderRoles(this.props.roles)}
			</section>
		);
	}
};