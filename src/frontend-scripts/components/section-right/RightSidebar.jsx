'use strict';

import React from 'react';
import Playerlist from './Playerlist.jsx';
import Generalchat from './Generalchat.jsx';
import $ from 'jquery';

export default class RightSidebar extends React.Component {
	clickSettingsButton(e) {
		let { gameState } = this.props.gameInfo;

		if (!gameState || gameState && gameState.isCompleted || gameState && !gameState.isStarted) {
			if (this.props.midSection === 'game') {
				if (this.props.gameInfo.gameState.isCompleted) {
					this.props.updateSeatedUsers(null, true, true);
				} else {
					this.props.updateSeatedUsers(null, null, true);
				}
			}
			this.props.onSettingsButtonClick('settings');
		}
	}

	render() {
		let iconClasses = () => {
			let classes = 'setting icon large',
				{ gameState } = this.props.gameInfo;

			if (gameState && gameState.isStarted && !gameState.isCompleted) {
				classes += ' disabled';
			}

			return classes;
		};

		return (
			<section className="section-right three wide column">
				<section className="right-header">
				{(() => {
					let userInfo = this.props.userInfo;

					if (userInfo.userName) {
						return (
							<div>
								<div>
									Logged in as <span className="playername">{this.props.userInfo.userName}</span>
								</div>
								<i className={iconClasses()} onClick={this.clickSettingsButton.bind(this)}></i>
							</div>
						);
					}
				})()}
				</section>
				<Playerlist
					userList={this.props.userList}
				/>
				<div className="ui divider right-sidebar-divider"></div>
				<Generalchat
					onGeneralChatSubmit={this.props.onGeneralChatSubmit}
					generalChats={this.props.generalChats}
					userInfo={this.props.userInfo}
				/>
			</section>
		);
	}
};