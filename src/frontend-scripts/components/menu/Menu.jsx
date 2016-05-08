'use strict';

import React from 'react';

export default class Menu extends React.Component {
	render() {
		return (
			<section className="ui menu">
				<img src="images/ww-logo-fs2.png" alt="One Night Werewolf logo" />
				<p>
					<a href="/" target="blank">One Night Werewolf</a>
				</p>
				<div className="item right">
				{(() => {
					if (!this.props.userInfo.userName) {
						return (
							<div className="ui buttons">
								<div className="ui button" id="signin">Sign in</div>
								<div className="or"></div>
								<div className="ui button" id="signup">Sign up</div>
							</div>
						);
					}
				})()}
				</div>
			</section>
		);
	}
};