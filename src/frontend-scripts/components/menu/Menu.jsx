'use strict';

import React from 'react';

export default class Menu extends React.Component {
	clickSettingsButton(e) {
		let { gameInfo, userInfo } = this.props,
			{ gameState } = gameInfo;

		if (gameState && gameState.isCompleted && userInfo.seatNumber || gameState && !userInfo.seatNumber || gameState && !gameState.isStarted) {
			this.props.onLeaveGame(userInfo.seatNumber, true);
		} else if (!gameState) {
			this.props.onSettingsButtonClick('settings');
		}
	}

	// todo-alpha player who goes to another page on another tab gets logged out?

	render() {
		return (
			<section className="ui menu">
				<p>
					<a href="/" target="blank">One Night Werewolf</a>
				</p>
				<div className="item right">
				{(() => {
					let { gameInfo, userInfo } = this.props,
						iconClasses = () => {
							let classes = 'setting icon large';

							if (gameInfo.gameState && gameInfo.gameState.isStarted && !gameInfo.gameState.isCompleted) {
								classes += ' disabled';
							}

							return classes;
						};

					if (!userInfo.userName) {
						return (
							<div className="ui buttons">
								<div className="ui button" id="signin">Sign in</div>
								<div className="or"></div>
								<div className="ui button" id="signup">Sign up</div>
							</div>
						);
					} else {
						return (
							<div>
								<div className="loggedin">
									Logged in as <span className="playername">{userInfo.userName}</span>
								</div>
								<i className={iconClasses()} onClick={this.clickSettingsButton.bind(this)}></i>
							</div>
						);
					}
				})()}
				</div>
			</section>
		);
	}
};