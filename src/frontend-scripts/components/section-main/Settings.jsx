import React from 'react';
import $ from 'jquery';
import Popup from 'semantic-ui-popup';
import Checkbox from 'semantic-ui-checkbox';

$.fn.popup = Popup;
$.fn.checkbox = Checkbox;

export default class Settings extends React.Component {
	constructor() {
		super();
		this.leaveSettings = this.leaveSettings.bind(this);
	}

	componentDidMount() {
		const {socket} = this.props;

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
				socket.emit('updateGameSettings', {
					disablePopups: true
				});
			},
			onUnchecked() {
				socket.emit('updateGameSettings', {
					disablePopups: false
				});
			}
		});

		$(this.refs.timestamps).checkbox({
			onChecked() {
				socket.emit('updateGameSettings', {
					enableTimestamps: true
				});
			},
			onUnchecked() {
				socket.emit('updateGameSettings', {
					enableTimestamps: false
				});
			}
		});

		$(this.refs.sidebar).checkbox({
			onChecked() {
				socket.emit('updateGameSettings', {
					disableRightSidebarInGame: true
				});
			},
			onUnchecked() {
				socket.emit('updateGameSettings', {
					disableRightSidebarInGame: false
				});
			}
		});

		$(this.refs.theme).checkbox({
			onChecked() {
				socket.emit('updateGameSettings', {
					enableDarkTheme: true
				});
			},
			onUnchecked() {
				socket.emit('updateGameSettings', {
					enableDarkTheme: false
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
				<i className="remove icon" onClick={this.leaveSettings} />
				<div className="ui header">
					<div className="content">
						Game settings
						<div className="sub header">
							Account settings can be found <a href="/account" target="_blank" rel="noopener noreferrer">here</a> (new tab).
						</div>
					</div>
				</div>
				<div className="ui grid">
					<div className="four wide column popups">
						<h4 className="ui header">Disable informational popups</h4>
						<div className="ui fitted toggle checkbox" ref="popups">
							<input type="checkbox" name="popups" defaultChecked={this.props.userInfo.gameSettings.disablePopups} />
							<label />
						</div>
						<div className="ui small popup transition hidden">
							Disable most popups (but not this one) that explain game terms and concepts.
						</div>
					</div>
					<div className="four wide column popups">
						<h4 className="ui header">Add timestamps to in-game chats</h4>
						<div className="ui fitted toggle checkbox" ref="timestamps">
							<input type="checkbox" name="timestamps" defaultChecked={this.props.userInfo.gameSettings.enableTimestamps} />
							<label />
						</div>
					</div>
					<div className="four wide column popups">
						<h4 className="ui header">Hide right sidebar while in games</h4>
						<div className="ui fitted toggle checkbox" ref="sidebar">
							<input type="checkbox" name="sidebar" defaultChecked={this.props.userInfo.gameSettings.disableRightSidebarInGame} />
							<label />
						</div>
					</div>
					<div className="four wide column popups">
						<h4 className="ui header">Use dark theme (reloads page)</h4>
						<div className="ui fitted toggle checkbox" ref="theme">
							<input type="checkbox" name="sidebar" defaultChecked={this.props.userInfo.gameSettings.enableDarkTheme} />
							<label />
						</div>
					</div>
				</div>
			</section>
		);
	}
}

Settings.propTypes = {
	onLeaveSettings: React.PropTypes.func,
	userInfo: React.PropTypes.object,
	socket: React.PropTypes.object
};