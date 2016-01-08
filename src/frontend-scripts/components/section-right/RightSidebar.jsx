'use strict';

import React from 'react';

export default class RightSidebar extends React.Component {
	clickSettingsButton() {
		this.props.onSettingsButtonClick('settings');
	}

	render() {
		return (
			<section className="section-right three wide column">
				<i className="setting icon large" onClick={this.clickSettingsButton.bind(this)}></i>
			</section>
		);
	}
};