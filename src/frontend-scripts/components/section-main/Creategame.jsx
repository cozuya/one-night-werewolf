'use strict';

import React from 'react';
import $ from 'jquery';
import Popup from 'semantic-ui-popup';
import Dropdown from 'semantic-ui-dropdown';

$.fn.dropdown = Dropdown;
$.fn.popup = Popup;

export default class Creategame extends React.Component {
	componentDidMount () {
		$(this.refs.defaultrolespopup).popup({
			inline: true,
			hoverable: true,
			position: 'bottom center',
			delay: {
				show: 300,
				hide: 800
			}
		});

		$(this.refs.timedropdown).dropdown({
			on: 'hover'
		});
	}

	render() {
		return (
			<section className="creategame">
				<div className="ui header">
					<div className="content">
						Create a new game
						<div className="sub header">
							Select 10 roles to make a game.
						</div>
					</div>
				</div>
				<div className="ui grid">
					<div className="four wide column gamename">
						<h4 className="ui header">Game name</h4>
						<div className="ui input">
							<input placeholder="New Game"></input>
						</div>
						<p>*Optional</p>
					</div>
					<div className="four wide column selectdefaults">
						<h4 className="ui header">Select default roles</h4>
						<div className="ui basic button" ref="defaultrolespopup">
							Select
						</div>
						<div className="ui small popup top left transition hidden">
							Automatically selects 2 werewolves, 3 villagers, and one each of the seer, robber, troublemaker, insomniac, and hunter.
						</div>
					</div>
					<div className="four wide column">
						<h4 className="ui header">Time of game</h4>
						<div className="ui dropdown" ref="timedropdown">
							<i className="dropdown icon"></i>
							<div className="menu">
								<div className="item">0:30</div>
								<div className="item">1:00</div>
								<div className="item">1:30</div>
								<div className="item">2:00</div>
								<div className="item">2:30</div>
								<div className="item">3:00</div>
								<div className="item">3:30</div>
								<div className="item">4:00</div>
								<div className="item">4:30</div>
								<div className="item">5:00</div>
							</div>
						</div>
					</div>
					<div className="four wide column">
						4
					</div>
				</div>
			</section>
		);
	}
};