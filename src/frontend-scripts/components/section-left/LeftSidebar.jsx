'use strict';

import React from 'react';
import $ from 'jquery';
import SidebarGame from './SidebarGame.jsx';

export default class LeftSidebar extends React.Component {
	createGameClick() {
		this.props.onCreateGameButtonClick('createGame');
	}

	render() {
		return (
			<section className={(() => {
				let classes = 'section-left three wide column leftsidebar';

				if (this.props.midsection === 'game') {
					classes += ' app-hidden';
				}

				return classes;
			})()}>
				{(() => {
					let { userName } = this.props.userInfo,
						gameBeingCreated = this.props.midsection === 'createGame',
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