'use strict';

import React from 'react';
import SidebarGame from './SidebarGame.jsx';

export default class LeftSidebar extends React.Component {
	createGameClick() {
		this.props.onCreateGameButtonClick('createGame');
	}

	render() { // todo-alpha sort gamelist
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
					{this.props.gameList.sort((a, b) => { // todo-alpha these bounce/change on updates at least for in progress games
						if (a.gameState.isCompleted) {
							return 1;
						}

						if (b.gameState.isCompleted) {
							return -1;
						}

						if (a.gameState.isStarted && !a.gameState.isCompleted) {
							if (b.gameState.isCompleted) {
								return -1;
							} else {
								return 1;
							}
						}

						if (a.gameState.isCompleted && b.gameState.isCompleted) {
							return 0;
						}

						if (b.gameState.isStarted && !b.gameState.isCompleted) {
							if (a.gameState.isCompleted) {
								return 1;
							} else {
								return -1;
							}
						}

						if (!a.gameState.isStarted) {
							if (!b.gameState.isStarted) {
								if (a.seatedCount >= b.seatedCount) {
									return -1;
								} else {
									return 1;
								}
							} else {
								return 1;
							}
						}
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