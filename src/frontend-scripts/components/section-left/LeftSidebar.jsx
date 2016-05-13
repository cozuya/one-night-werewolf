'use strict';

import React from 'react';
import SidebarGame from './SidebarGame.jsx';

export default class LeftSidebar extends React.Component {
	createGameClick() {
		this.props.onCreateGameButtonClick('createGame');
	}

	render() {
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
					{this.props.gameList.sort((a, b) => {  // todo-alpha in progress appeared under completed
						if (!a.gameState.isStarted && b.gameState.isStarted) {
							return -1;
						} else if (a.gameState.isStarted && !b.gameState.isStarted) {
							return 1;
						} else if (!a.gameState.isStarted && !b.gameState.isStarted) {
							return b.seatedCount - a.seatedCount;
						}


						if (a.gameState.isStarted && !a.gameState.isCompleted) {
							if (!b.gameState.isStarted) {
								return -1;
							} else {
								return 0;
							}
						}

						if (b.gameState.isStarted && !b.gameState.isCompleted) {
							if (!a.gameState.isStarted) {
								return 1;
							} else {
								return 0;
							}
						}

						if (a.gameState.isCompleted && !b.gameState.isCompleted) {
							return 1;
						} else if (b.gameState.isCompleted && !a.gameState.isCompleted) {
							return -1;
						}

						return 0;
					}).map((game, index) => {
						return <SidebarGame
									key={index}
									game={game}
									sidebarGameClicked={this.props.sidebarGameClicked}
								/>
					})}
				</div>
			</section>
		);
	}
};