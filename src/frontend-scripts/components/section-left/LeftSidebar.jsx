'use strict';

import React from 'react';
import SidebarGame from './SidebarGame.jsx';

export default class LeftSidebar extends React.Component {
	createGameClick() {
		this.props.onCreateGameButtonClick('createGame');
	}

	render() { // todo-alpha after leaving a completed game the first player clicked on creategame and nothign happened/noconsole error
		return (
			<section className="section-left three wide column leftsidebar">
				{(() => {
					let { userName } = this.props.userInfo,
						gameBeingCreated = this.props.midSection === 'createGame',
						disabledText;

					if (userName && !gameBeingCreated) {
						return (
							<button className="ui button primary" onClick={this.createGameClick.bind(this)}>Create a new game</button>
						)
					} else {
						return (
							<button className="ui button disabled">{gameBeingCreated ? 'Creating a new game..' : 'Sign in to make games'}</button>
						)
					}
				})()}
				<div className="games-container">
					{this.props.gameList.map((game, i) => {
						return <SidebarGame
									key={i}
									game={game}
									sidebarGameClicked={this.props.sidebarGameClicked}
								/>
					})}
				</div>
			</section>
		);
	}
};