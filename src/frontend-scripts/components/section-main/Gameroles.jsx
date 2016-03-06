'use strict';

import React from 'react';
import $ from 'jquery';
import Popup from 'semantic-ui-popup';
import { roleMap } from '../../../../iso/util.js';

$.fn.popup = Popup;

export default class Gameroles extends React.Component {
	componentDidMount() {
		if (!Object.keys(this.props.userInfo).length || !this.props.userInfo.gameSettings.disablePopups) {
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
		this.props.selectedGamerole({
			role: $(e.currentTarget).attr('data-role'),
			random: Math.random().toString(36).substring(2)
		});
	}

	componentDidUpdate () {
		// console.log(this.props);
	}

	render() {

		// todo popups don't have team names colors working
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
											
											return `roles role-${role} ${this.props.roleState} ${notifyClass}`;
										})()
									}

									data-role={role}
									></div>
									<div className="ui small popup transition hidden top left" dangerouslySetInnerHTML={{__html: roleMap[role].description}}></div>
								</div>
							);
						});
					})()}
			</section>
		);
	}
};