'use strict';

import React from 'react';
import Playerlist from './Playerlist.jsx';
import Generalchat from './Generalchat.jsx';
import $ from 'jQuery';

export default class RightSidebar extends React.Component {
	clickSettingsButton(e) {
		if (!$(e.currentTarget).hasClass('disabled')) {
			this.props.onSettingsButtonClick('settings');
		}
	}

	render() {
		return (
			<section className={
				(() => {
					let classes = 'section-right three wide column';

					if (this.props.midsection === 'game' && this.props.userInfo.gameSettings.disableRightSidebarInGame) {
						classes += ' app-hidden';
					}

					return classes;
				})()}>
				<section className="right-header">
				{(() => {
					let userInfo = this.props.userInfo;

					if (userInfo.userName) {
						return (
							<div>
								<div>
									Logged in as <span className="playername">{this.props.userInfo.userName}</span>
								</div>
								<i className={userInfo.seatNumber ? 'setting icon large disabled' : 'setting icon large'} onClick={this.clickSettingsButton.bind(this)}></i>
							</div>
						);
					}
				})()}
				</section>
				<Playerlist
					userList={this.props.userList}
				/>
				<div className="ui divider right-sidebar-divider"></div>
				<section className="generalchat">
					<h3 className="ui header">Chat</h3>
				</section>
			</section>
		);
	}
};