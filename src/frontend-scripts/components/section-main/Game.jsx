'use strict';

import React from 'react';
import Table from './Table.jsx';
import Gamechat from './Gamechat.jsx';
import Gameroles from './Gameroles.jsx';

export default class Game extends React.Component {
	constructor() {
		
	}

	componentDidMount() {
		
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
							/>
						</div>
					</div>
				</div>
				<div className="row gameroles-container">
					<Gameroles
						userInfo={this.props.userInfo}
						roles={this.props.gameInfo.roles}
					/>
				</div>
			</section>
		);
	}
};