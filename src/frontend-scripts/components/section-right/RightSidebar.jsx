'use strict';

import React from 'react';
import Playerlist from './Playerlist.jsx';

export default class RightSidebar extends React.Component {
	clickSettingsButton() {
		this.props.onSettingsButtonClick('settings');
	}

	render() {
		return (
			<section className="section-right three wide column">
				<section className="header">
				{(() => {
					let userInfo = this.props.userInfo;

					// todo not working as desired

					if (userInfo.userName && !userInfo.seatNumber) {
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
				<Playerlist />
			</section>
		);
	}
};