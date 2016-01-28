'use strict';

import React from 'react';
import $ from 'jquery';
import Popup from 'semantic-ui-popup';
import { roleMap } from '../../../../iso/util.js';

$.fn.popup = Popup;

export default class Gameroles extends React.Component {
	componentDidMount() {
		if (this.props.userInfo.userName && !this.props.userInfo.gameSettings.disablePopups) {
			$('div.roles').popup({
				inline: true,
				hoverable: true,
				lastResort: true,
				delay: {
					show: 700,
					hide: 800
				}
			});
		}
	}

	handleRoleClick(e) {
		console.log(e.currentTarget);		
	}

	// componentDidUpdate () {
	// 	console.log(this.props);
	// }	

	render() {
		return (
			<section className="gameroles">
				<div className="ui right pointing label">
  					Roles in this game:
				</div>
					{(() => {
						return this.props.roles.map((role, i) => {
							return (
								<div key={i}>
									<div onClick={this.handleRoleClick.bind(this)} className={
										(() => {
											let notifyClass = this.props.roleState === 'notify' ? 'notify' : '';
											
											return `roles ${role} ${this.props.roleState} ${notifyClass}`;
										})()
									}></div>
									<div className="ui small popup transition hidden top left" dangerouslySetInnerHTML={{__html: roleMap[role].description}}></div>
								</div>
							);
						});
					})()}
			</section>
		);
	}
};