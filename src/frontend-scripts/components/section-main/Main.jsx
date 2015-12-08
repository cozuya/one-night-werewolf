'use strict';

import React from 'react';
import Menu from '../menu/Menu.jsx';
import Defaultmid from './Defaultmid.jsx';
import Creategame from './Creategame.jsx';
import Game from './Game.jsx';

export default class Main extends React.Component {
	variableWidth() {
		let classes = this.props.midsection === 'game' ? 'thirteen' : 'ten';

		classes += ' wide column section-main';  // yes semantic requires classes in specific order... ascii shrug

		return classes;
	}
	
	render() {
		let midsection = (() => {
			switch (this.props.midsection) {
				case 'createGame':
					return <Creategame
								userInfo={this.props.userInfo}
								onCreateGameSubmit={this.props.onCreateGameSubmit}
							/>
				case 'game':
					return <Game
								updateSeatedUsers={this.props.updateSeatedUsers}
								userInfo={this.props.userInfo}
								gameInfo={this.props.gameInfo}
							/>
				default:
					return <Defaultmid
								quickDefault={this.props.quickDefault} />
			}
		})();

		return (
			<section className={this.variableWidth()}>
				<Menu userInfo={this.props.userInfo} />
				{midsection}
			</section>
		);
	}
};