'use strict';

import React from 'react';
import Menu from '../menu/Menu.jsx';
import Defaultmid from './Defaultmid.jsx';
import Creategame from './Creategame.jsx';
import Game from './Game.jsx';

export default class Main extends React.Component {
	render() {
		let midsection = (() => {
			switch (this.props.midsection) {
				case 'createGame':
					return <Creategame userName={this.props.userName} />
				case 'game':
					return <Game userName={this.props.userName} />
				default:
					return <Defaultmid />
			}
		})();

		return (
			<section className="section-main ten wide column">
				<Menu userName={this.props.userName} />
				{midsection}
			</section>
		);
	}
};