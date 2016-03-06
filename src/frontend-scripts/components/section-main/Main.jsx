'use strict';

import React from 'react';
import Menu from '../menu/Menu.jsx';
import Defaultmid from './Defaultmid.jsx';
import Creategame from './Creategame.jsx';
import Settings from './Settings.jsx';
import Game from './Game.jsx';

export default class Main extends React.Component {
	render() {
		return (
			<section className={
				(() => {
					let classes;

					if (this.props.midsection === 'game') {
						if (this.props.userInfo.gameSettings.disableRightSidebarInGame) {
							classes = 'sixteen';
						} else {
							classes = 'thirteen';
						}
					} else {
						classes = 'ten';
					}

					classes += ' wide column section-main';  // yes semantic requires classes in specific order... ascii shrug
					return classes;
				})()
			}>
				<Menu userInfo={this.props.userInfo} />
				{(() => {
					switch (this.props.midsection) {
						case 'createGame':
							return <Creategame
										userInfo={this.props.userInfo}
										onCreateGameSubmit={this.props.onCreateGameSubmit}
										onLeaveCreateGame={this.props.onLeaveCreateGame}
									/>
						case 'game':
							return <Game
										updateSeatedUsers={this.props.updateSeatedUsers}
										userInfo={this.props.userInfo}
										gameInfo={this.props.gameInfo}
									/>
						case 'settings':
							return <Settings
										onLeaveSettings={this.props.onLeaveSettings}
										userInfo={this.props.userInfo}
									/>
						default:
							return <Defaultmid
										quickDefault={this.props.quickDefault}
									/>
					}
				})()}
			</section>
		);
	}
};