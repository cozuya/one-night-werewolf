'use strict';

import React from 'react';

export default class Menu extends React.Component {
	render() {
		let userName = this.props.userInfo.userName,
			rightSection = (() => {
				if (userName) {
					return <span>Logged in as <a href="/account" target="blank">{userName}</a></span>
				} else {
					return (
						<div className="ui buttons">
							<div className="ui button" id="signin">Sign in</div>
							<div className="or"></div>
							<div className="ui button" id="signup">Sign up</div>
						</div>
					)
				}
			})();


		return (
			<section className="ui menu">
				<p className="item"><a href="/" target="blank">One Night Werewolf</a></p>
				<div className="item right">
					{rightSection}
				</div>
			</section>
		);
	}
};