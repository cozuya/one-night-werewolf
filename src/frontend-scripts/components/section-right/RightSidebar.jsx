'use strict';

import React from 'react';
import Playerlist from './Playerlist.jsx';
import Generalchat from './Generalchat.jsx';

export default class RightSidebar extends React.Component {
	render() {
		return (
			<section className="section-right three wide column">
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