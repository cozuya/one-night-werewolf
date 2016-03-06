'use strict';

import React from 'react';
import Table from './Table.jsx';
import Gamechat from './Gamechat.jsx';
import Gameroles from './Gameroles.jsx';
import { connect } from 'react-redux';
import { updateExpandoInfo, updateClickedGamerole } from '../../actions/actions.js';

class Game extends React.Component {
	roleState(state) {
		let { dispatch } = this.props;

		dispatch(updateExpandoInfo(state));
	}

	selectedGamerole(state) {
		let { dispatch } = this.props;

		dispatch(updateClickedGamerole(state));
	}

	render() {
		return (
			<section className="game">
				<div className="ui grid">
					<div className="row">
						<div className={
							(() => {
								let classes;

								if (this.props.userInfo.gameSettings.disableRightSidebarInGame) {
									classes = 'nine ';
								} else {
									classes = 'ten ';
								}

								return classes += 'wide column table-container';
							})()
						}>
							<Table
								updateSeatedUsers={this.props.updateSeatedUsers}
								gameInfo={this.props.gameInfo}
								userInfo={this.props.userInfo}
							/>
						</div>
						<div className={
							(() => {
								let classes;

								if (this.props.userInfo.gameSettings.disableRightSidebarInGame) {
									classes = 'seven ';
								} else {
									classes = 'six ';
								}

								return classes += 'wide column chat-container game-chat';
							})()
						}>
							<section className="gamestatus">
								{this.props.gameInfo.status}
							</section>
							<Gamechat
								isGeneralChat={false}
								gameInfo={this.props.gameInfo}
								userInfo={this.props.userInfo}
								clickedGameRole={this.props.gameRoleInfo}
								roleState={this.roleState.bind(this)}
								selectedGamerole={this.props.clickedGamerole}
							/>
						</div>
					</div>
				</div>
				<div className={
					(() => {
						let classes = 'row gameroles-container';

						if (this.props.userInfo.gameSettings.disableRightSidebarInGame) {
							classes += ' disabledrightsidebar';
						}

						return classes;
					})()
				}>
					<Gameroles
						userInfo={this.props.userInfo}
						roles={this.props.gameInfo.roles}
						roleState={this.props.expandoInfo}
						selectedGamerole={this.selectedGamerole.bind(this)}
					/>
				</div>
			</section>
		);
	}
};

let select = (state) => {
	return state;
}

export default connect(select)(Game);