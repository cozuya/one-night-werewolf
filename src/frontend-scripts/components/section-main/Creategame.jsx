'use strict';

import React from 'react';
import $ from 'jquery';
import Popup from 'semantic-ui-popup';
import Dropdown from 'semantic-ui-dropdown';
import Progress from 'semantic-ui-progress';

$.fn.dropdown = Dropdown;
$.fn.popup = Popup;
$.fn.progress = Progress;

export default class Creategame extends React.Component {
	componentDidMount () {
		$(this.refs.defaultrolespopup).add(this.refs.kobkpopup).popup({
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

		$(this.refs.progressbar).progress({
			percent: 20,
			total: 10,
			label: 'ratio',
			text: {
				ratio: '{value} of {total}'
			}
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
					<div className="four wide column timeofgame">
						<h4 className="ui header">Time of game</h4>
						<div className="ui dropdown" ref="timedropdown">
							<span className="text">3:00</span>
							<i className="dropdown icon">
								<div className="menu"></div>
							</i>
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
					<div className="four wide column killorbekilled">
						<h4 className="ui header">Kill or be killed mode</h4>
						<div className="ui fitted toggle checkbox" ref="kobkpopup">
							<input type="checkbox" name="kobk" defaultChecked></input>
							<label></label>
						</div>
						<div className="ui small popup top left transition hidden">
							At least one player is a werewolf i.e. not all werewolf cards are in the center.
						</div>
					</div>
				</div>
				{/* roles go here */}
				<div className="ui teal progress" ref="progressbar" data-value="2" data-total="10">
					<div className="bar"></div>
				</div>
			</section>
		);
	}
};