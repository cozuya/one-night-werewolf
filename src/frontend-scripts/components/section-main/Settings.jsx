'use strict';

import React from 'react';
import $ from 'jquery';
import Popup from 'semantic-ui-popup';
import Dropdown from 'semantic-ui-dropdown';
import Progress from 'semantic-ui-progress';
import Checkbox from 'semantic-ui-checkbox';
import { defaultRolesArray } from '../../../../iso/util.js';

$.fn.dropdown = Dropdown;
$.fn.popup = Popup;
$.fn.progress = Progress;
$.fn.checkbox = Checkbox;
// todo-alpha leaving game to go to settings doesn't delete game as it should
export default class Settings extends React.Component {
	componentDidMount() {
		let self = this;

		$(this.refs.popups).popup({
			inline: true,
			hoverable: true,
			position: 'bottom left',
			delay: {
				show: 300,
				hide: 800
			}
		}).checkbox({
			onChecked() {
				self.props.onUpdatedGameSettings({
					disablePopups: true
				});
			},
			onUnchecked() {
				self.props.onUpdatedGameSettings({
					disablePopups: false
				});
			},
		});

		$(this.refs.timestamps).checkbox({
			onChecked() {
				self.props.onUpdatedGameSettings({
					enableTimestamps: true
				});
			},
			onUnchecked() {
				self.props.onUpdatedGameSettings({
					enableTimestamps: false
				});
			}
		});

		$(this.refs.sidebar).checkbox({
			onChecked() {
				self.props.onUpdatedGameSettings({
					disableRightSidebarInGame: true
				});
			},
			onUnchecked() {
				self.props.onUpdatedGameSettings({
					disableRightSidebarInGame: false
				});
			}
		});		
	}

	leaveSettings() {
		this.props.onLeaveSettings('default');
	}

	render() {
		return (
			<section className="settings">
				<i className="remove icon" onClick={this.leaveSettings.bind(this)}></i>
				<div className="ui header">
					<div className="content">
						Game settings
						<div className="sub header">
							Account settings can be found <a href='/account' target="blank">here</a> (new tab).
						</div>
					</div>
				</div>
				<div className="ui grid">
					<div className="four wide column popups">
						<h4 className="ui header">Disable informational popups</h4>
						<div className="ui fitted toggle checkbox" ref="popups">
							<input type="checkbox" name="popups" defaultChecked={this.props.userInfo.gameSettings.disablePopups}></input>
							<label></label>
						</div>
						<div className="ui small popup transition hidden">
							Disable most popups (but not this one) that explain game terms and concepts.
						</div>
					</div>
					<div className="four wide column popups">
						<h4 className="ui header">Add timestamps to in-game chats</h4>
						<div className="ui fitted toggle checkbox" ref="timestamps">
							<input type="checkbox" name="timestamps" defaultChecked={this.props.userInfo.gameSettings.enableTimestamps}></input>
							<label></label>
						</div>
					</div>
					<div className="four wide column popups">
						<h4 className="ui header">Hide right sidebar while in games</h4>
						<div className="ui fitted toggle checkbox" ref="sidebar">
							<input type="checkbox" name="sidebar" defaultChecked={this.props.userInfo.gameSettings.disableRightSidebarInGame}></input>
							<label></label>
						</div>
					</div>
				</div>
			</section>
		);
	}
};