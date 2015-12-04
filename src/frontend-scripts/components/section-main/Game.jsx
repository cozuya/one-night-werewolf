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

	// <div className="row gameroles-container">
	// 				<Gameroles />
	// 			</div>

	render() {
		return (
			<section className="game ui grid">
				<div className="row">
					<div className="ten wide column table-container">
						<Table />
					</div>
					<div className="six wide column chat-container">
						<Gamechat />
					</div>
				</div>
				
			</section>
		);
	}
};