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
	constructor() {
		this.handleChangeRole = this.handleChangeRole.bind(this);
		// this.roleCount = this.roleCount.bind(this);
		this.state = {
			roles: ['werewolf', 'werewolf']
		}
	}

	componentDidMount() {
		$(this.refs.defaultrolespopup).add(this.refs.kobkpopup).popup({
			inline: true,
			hoverable: true,
			position: 'bottom center',
			delay: {
				show: 300,
				hide: 800
			}
		});

		$(this.refs.role_werewolf).add(this.refs.role_minion).add(this.refs.role_mason).popup({
			inline: true,
			hoverable: true,
			lastResort: false,
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
				ratio: '{value} of {total} roles'
			}
		});
	}

	handleChangeRole(el) {
		let role = $(el.target).parent().find('p').attr('data-role'),
			increment = $(el.target).hasClass('plus'),
			$progress = $(this.refs.progressbar),
			roles = this.state.roles,
			werewolfCount = roles.filter((el) => {
				return el === 'werewolf';
			}).length;

		console.log(werewolfCount);

		if (increment) {
			if (roles.length <= 7) {
				roles.push(role);
				this.setState({roles});
				$progress.progress('increment');
			}
		} else {
			if (roles.length >= 0 && werewolfCount >= 2) {
				roles.splice(roles.indexOf(role), 1);
				console.log(roles);
				this.setState({roles});
				$progress.progress('decrement');
			}
		}

		// console.log(this.state.roles);
	}

	roleCount(role) {
		return this.state.roles.filter((el) => {
			return el === role;
		}).length;
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
						<h4 className="ui header">Game name<small>*Optional</small></h4>
						<div className="ui input">
							<input placeholder="New Game"></input>
						</div>
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
							At least one player is a werewolf i.e. all werewolf cards cannot be in the center.
						</div>
					</div>
				</div>
				<div className="ui grid five column pickroles">
					<div className="row">
						<div className="column werewolf">
							<p ref="role_werewolf" data-role="werewolf">Werewolf</p>
							<div className="ui small popup transition hidden">
								Werewolves wake up first, and look for other werewolves.  If there are none, they may look at a center card.
								  There is a minimum of 2 werewolves in every game.  Werewolves are on the <span>werewolf team.</span>
							</div>
							<i className="minus icon" onClick={this.handleChangeRole}></i>
							<span>{this.roleCount('werewolf')}</span>
							<i className="plus icon" onClick={this.handleChangeRole}></i>
						</div>
						<div className="column minion">
							<p ref="role_minion">Minion</p>
							<div className="ui small popup bottom right transition hidden">
								Minions wake up, and get to see who the werewolves are - but the werewolves are not aware of who the minions are.  Minions win if the werewolves win, and in the event of no werewolves, win if a villager dies.  Minions are on the <span>werewolf team.</span>
							</div>
							<i className="minus icon"></i>
							<span>0</span>
							<i className="plus icon"></i>
						</div>
						<div className="column mason">
							<p ref="role_mason">Mason</p>
							<div className="ui small popup bottom right transition hidden">
								Masons wake up, and look for other masons.  Masons are on the <span>village team.</span>
							</div>
							<i className="minus icon"></i>
							<span>0</span>
							<i className="plus icon"></i>
						</div>
						<div className="column">
							<p>Seer</p>
							<div className="ui small popup bottom right transition hidden">
								Seers wake up, and have the choice of looking at another player's card, or two of the center cards.  Seers are on the <span>village team.</span>
							</div>
							<i className="minus icon"></i>
							<span>0</span>
							<i className="plus icon"></i>
						</div>
						<div className="column">
							<p>Robber</p>
							<div className="ui small popup bottom right transition hidden">
								Robbers wake up, and look at another player's card.  They then swap that player's card with their own, and become the role and team they have stolen (and vice versa) - however they do not do an additional night action.  Robbers are on the <span>village team.</span>
							</div>
							<i className="minus icon"></i>
							<span>0</span>
							<i className="plus icon"></i>
						</div>
					</div>
					<div className="row">
						<div className="column">
							<p>Troublemaker</p>
							<div className="ui small popup bottom right transition hidden">
								Troublemakers wake up, and swap the cards of two players without looking at them.  Troublemakers are on the <span>village team.</span>
							</div>
							<i className="minus icon"></i>
							<span>0</span>
							<i className="plus icon"></i>
						</div>
						<div className="column">
							<p>Insomniac</p>
							<div className="ui small popup bottom right transition hidden">
								Insomniacs wake up, and look at their card again to see if they are still the insomniac.  Insomniacs are on the <span>village team.</span>
							</div>
							<i className="minus icon"></i>
							<span>0</span>
							<i className="plus icon"></i>
						</div>
						<div className="column">
							<p>Hunter</p>
							<div className="ui small popup bottom right transition hidden">
								Hunters do not wake up.  If a hunter is eliminated, the player he or she is selecting for elimination is also eliminated.  Hunters are on the <span>village team.</span>
							</div>
							<i className="minus icon"></i>
							<span>0</span>
							<i className="plus icon"></i>
						</div>
						<div className="column tanner">
							<p>Tanner</p>
							<div className="ui small popup bottom right transition hidden">
								Tanners do not wake up.  Tanners are suicidal and only win if they are eliminated.  Tanners are on <span>their own team individually</span> and do not win if another tanner wins.
							</div>
							<i className="minus icon"></i>
							<span>0</span>
							<i className="plus icon"></i>
						</div>
						<div className="column">
							<p>Villager</p>
							<div className="ui small popup bottom right transition hidden">
								Villagers do not wake up.  Villagers are on the <span>village team.</span>
							</div>
							<i className="minus icon"></i>
							<span>0</span>
							<i className="plus icon"></i>
						</div>
					</div>
				</div>
				<div className="ui grid footer">
					<div className="twelve wide column">
						<div className="ui teal progress" ref="progressbar" data-value="2" data-total="10">
							<div className="bar">
								<div className="progress"></div>
							</div>
						</div>
					</div>
					<div className="four wide column">
						<div className="ui button primary disabled">
							Create game
						</div>
					</div>
				</div>
			</section>
		);
	}
};