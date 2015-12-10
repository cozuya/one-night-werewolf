'use strict';

import React from 'react';

export default class RightSidebar extends React.Component {
	render() {
		return (
			<section className="section-right three wide column">
				<i className="setting icon large" onClick={this.props.settingClick}></i>
			</section>
		);
	}
};