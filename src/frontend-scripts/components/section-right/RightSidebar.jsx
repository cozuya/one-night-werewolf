'use strict';

import React from 'react';
import Playerlist from './Playerlist.jsx';
import Generalchat from './Generalchat.jsx';

export default class RightSidebar extends React.Component {
	clickSettingsButton() {
		this.props.onSettingsButtonClick('settings');
	}

	render() {
		return (
			<section className="section-right three wide column">
				<section className="right-header">
				{(() => {
					let userInfo = this.props.userInfo;

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
				<Playerlist
					userList={this.props.userList}
				/>
				<div className="ui divider"></div>
				<section className="generalchat">
					<h3 className="ui header">General chat:</h3>
				</section>
			</section>
		);
	}

				// 	<Generalchat
				// 	userInfo={this.props.userInfo}
				// />
};