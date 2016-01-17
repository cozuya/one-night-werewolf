'use strict';

import React from 'react';
import Table from './Table.jsx';
import Gamechat from './Gamechat.jsx';
import Gameroles from './Gameroles.jsx';

export default class Game extends React.Component {
	roleState(state = '') {
		// todo: this isn't working the way I want/gameroles is not being updated.
		return state;
	}

	render() {
		return (
			<section className="game">
				<div className="ui grid">
					<div className="row">
						<div className="ten wide column table-container">
							<Table
								updateSeatedUsers={this.props.updateSeatedUsers}
								gameInfo={this.props.gameInfo}
								userInfo={this.props.userInfo}
							/>
						</div>
						<div className="six wide column chat-container">
							<section className="gamestatus">
								{this.props.gameInfo.status}
							</section>
							<Gamechat
								gameInfo={this.props.gameInfo}
								userInfo={this.props.userInfo}
								roleState={this.roleState.bind(this)}
							/>
						</div>
					</div>
				</div>
				<div className="row gameroles-container">
					<Gameroles
						userInfo={this.props.userInfo}
						roles={this.props.gameInfo.roles}
						roleState={this.roleState}
					/>
				</div>
			</section>
		);
	}
};