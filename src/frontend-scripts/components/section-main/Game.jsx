'use strict';

import React from 'react';
import Table from './Table.jsx';
import Gamechat from './Gamechat.jsx';
import Gameroles from './Gameroles.jsx';
import { connect } from 'react-redux';
import { updateExpandoInfo, updateClickedGamerole, updateClickedPlayer } from '../../actions/actions.js';

class Game extends React.Component {
	roleState(state) {
		const { dispatch } = this.props;

		dispatch(updateExpandoInfo(state));
	}

	selectedGamerole(state) {
		const { dispatch } = this.props;

		dispatch(updateClickedGamerole(state));
	}

	selectedPlayer(state) {
		const { dispatch } = this.props;
		
		dispatch(updateClickedPlayer(state));
	}

	render() {
		return (
			<section className="game">
				<div className="ui grid">
					<div className="row">
						<div className={
							(() => {
								let classes;

								if (this.props.userInfo.gameSettings && this.props.userInfo.gameSettings.disableRightSidebarInGame) {
									classes = 'eight ';
								} else {
									classes = 'ten ';
								}

								return classes += 'wide column table-container';
							})()
						}>
							<Table
								onUserNightActionEventSubmit={this.props.onUserNightActionEventSubmit}
								onUpdateTruncateGameSubmit={this.props.onUpdateTruncateGameSubmit}
								onUpdateSelectedForEliminationSubmit={this.props.onUpdateSelectedForEliminationSubmit}
								onUpdateReportGame={this.props.onUpdateReportGame}
								onSeatingUser={this.props.onSeatingUser}
								onLeaveGame={this.props.onLeaveGame}
								selectedPlayer={this.selectedPlayer.bind(this)}
								gameInfo={this.props.gameInfo}
								userInfo={this.props.userInfo}
								socket={this.props.socket}
							/>
						</div>
						<div className={
							(() => {
								let classes;

								if (this.props.userInfo.gameSettings && this.props.userInfo.gameSettings.disableRightSidebarInGame) {
									classes = 'eight ';
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
								gameInfo={this.props.gameInfo}
								userInfo={this.props.userInfo}
								onNewGameChat={this.props.onNewGameChat}
								clickedGameRole={this.props.gameRoleInfo}
								clickedPlayer={this.props.clickedPlayerInfo}
								roleState={this.roleState.bind(this)}
								selectedGamerole={this.props.clickedGamerole}
								selectedPlayer={this.props.clickedPlayer}
								socket={this.props.socket}
							/>
						</div>
					</div>
				</div>
				<div className={
					(() => {
						let classes = 'row gameroles-container';

						if (this.props.userInfo.gameSettings && this.props.userInfo.gameSettings.disableRightSidebarInGame) {
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
						gameInfo={this.props.gameInfo}
					/>
				</div>
			</section>
		);
	}
};

const select = (state) => {
	return state;
}

export default connect(select)(Game);