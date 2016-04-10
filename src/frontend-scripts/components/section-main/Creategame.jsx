'use strict';

import React from 'react';
import $ from 'jquery';
import Popup from 'semantic-ui-popup';
import Dropdown from 'semantic-ui-dropdown';
import Progress from 'semantic-ui-progress';
import { defaultRolesArray } from '../../../../iso/util.js';

$.fn.dropdown = Dropdown;
$.fn.popup = Popup;
$.fn.progress = Progress;

export default class Creategame extends React.Component {
	constructor() {
		this.state = {
			roles: ['werewolf', 'werewolf']
		}
	}

	componentDidMount() {
		if (!this.props.userInfo.gameSettings.disablePopups) {
			$('section.creategame .info-popup').popup({
				inline: true,
				hoverable: true,
				lastResort: true,
				delay: {
					show: 400,
					hide: 800
				}
			});
		}

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

	handleChangeRole(e) {
		let $target = $(e.target),
			role = $target.parent().find('div:first-child').attr('data-role'),
			$progress = $(this.refs.progressbar),
			roles = this.state.roles,
			werewolfTeamCount = roles.filter((el) => {
				return el === 'werewolf' || el === 'minion';
			}).length,
			tannerTeamCount = roles.filter((el) => {
				return el === 'tanner';
			}).length,
			currentRoleCount = roles.filter((el) => {
				return el === role;
			}).length;

		if (role === 'werewolf' || role === 'minion') {
			werewolfTeamCount++;
		}

		if (role === 'tanner') {
			tannerTeamCount++;
		}

		if ($target.hasClass('plus')) {
			if (roles.length <= 9 && werewolfTeamCount <= 5 && tannerTeamCount <= 3) {
				roles.push(role);
				this.setState({roles});
				$progress.progress('increment');
			}
		} else if (roles.length >= 0 && currentRoleCount > 0 && ((role === 'werewolf' && currentRoleCount !== 2) || role !== 'werewolf')) {
			roles.splice(roles.indexOf(role), 1);
			this.setState({roles});
			$progress.progress('decrement');
		}
	}

	roleCount(role) {
		return this.state.roles.filter((el) => {
			return el === role;
		}).length;
	}

	clearRoles() {
		this.setState({roles: ['werewolf', 'werewolf']});
		$(this.refs.progressbar).progress({
			value: 2,
			label: 'ratio',
			text: {
				ratio: '{value} of {total} roles'
			}
		});
	}

	selectDefaultRoles() {
		this.setState({roles: defaultRolesArray});
		$(this.refs.progressbar).progress({
			value: 10,
			label: 'ratio',
			text: {
				ratio: '{value} of {total} roles'
			}
		});
	}

	leaveCreateGame() {
		this.props.onLeaveCreateGame('default');
	}

	createNewGame() {
		this.props.onCreateGameSubmit({
			kobk: $('section.creategame div.killorbekilled input').is(':checked'),
			time: $('section.creategame div.timeofgame > div.dropdown span').text(),
			name: $('section.creategame div.gamename > div > input').val().length ? $('section.creategame div.gamename > div > input').val() : 'New Game',
			roles: this.state.roles,
			seated: {
				seat0: {
					userName: this.props.userInfo.userName,
					connected: true
				}
			},
			status: 'Waiting for more players..',
			chats: [],
			tableState: {
				seats: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]
			},
			gameState: {
				reportedGame: {
					0: false,
					1: false,
					2: false,
					3: false,
					4: false,
					5: false,
					6: false
				}
			},
			uid: Math.random().toString(36).substring(6)
		});	
	}

	render() {
		return (
			<section className="creategame">
				<i className="remove icon" onClick={this.leaveCreateGame.bind(this)}></i>
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
							<input maxLength="14" placeholder="New Game"></input>
						</div>
					</div>
					<div className="four wide column selectdefaults">
						<h4 className="ui header">Select default roles</h4>
						<div className="ui basic button info-popup" onClick={this.selectDefaultRoles.bind(this)}>
							Select
						</div>
						<div className="ui small popup top left transition hidden">
							Automatically selects 2 werewolves, 3 villagers, and one each of the seer, robber, troublemaker, insomniac, and hunter.
						</div>
					</div>
					<div className="four wide column timeofgame">
						<h4 className="ui header">Length of game</h4>
						<div className="ui dropdown" ref="timedropdown">
							<span className="text">3:00</span>
							<i className="dropdown icon">
								<div className="menu"></div>
							</i>
							<div className="menu">
								<div className="item">0:05</div>
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
						<div className="ui fitted toggle checkbox">
							<input type="checkbox" name="kobk" className="info-popup"></input>
							<label></label>
						</div>
						<div className="ui small popup top left transition hidden">
							At least one player is a werewolf i.e. all werewolf cards cannot be in the center.
						</div>
					</div>
				</div>
				<div className="ui grid five column pickroles">
					<div className="row">
						<div className={this.state.roles.length === 2 ? 'disabled' : ''} onClick={this.clearRoles.bind(this)}>Clear</div>
					</div>
					<div className="row">
						<div className="column werewolf">
							<div className="info-popup" data-role="werewolf"></div>
							<div className="ui small popup transition hidden top left">
								Werewolves wake up first, and look for other werewolves.  If there are none, they may look at a center card.  There is a minimum of 2 werewolves in every game, and a maximum of 5 werewolf team roles in every game.  Werewolves are on the <span>werewolf team.</span>
							</div>
							<i className="minus icon" onClick={this.handleChangeRole.bind(this)}></i>
							<span>{this.roleCount('werewolf')}</span>
							<i className="plus icon" onClick={this.handleChangeRole.bind(this)}></i>
						</div>
						<div className="column minion">
							<div className="info-popup" data-role="minion"></div>
							<div className="ui small popup bottom right transition hidden">
								Minions wake up, and get to see who the werewolves are - but the werewolves are not aware of who the minions are.  Minions win if the werewolves win, and in the event of no werewolves, win if a villager dies.  There is a maximum of 5 werewolf team roles in every game.  Minions are on the <span>werewolf team.</span>
							</div>
							<i className="minus icon" onClick={this.handleChangeRole.bind(this)}></i>
							<span>{this.roleCount('minion')}</span>
							<i className="plus icon" onClick={this.handleChangeRole.bind(this)}></i>
						</div>
						<div className="column mason">
							<div className="info-popup" data-role="mason"></div>
							<div className="ui small popup bottom right transition hidden">
								Masons wake up, and look for other masons.  Masons are on the <span>village team.</span>
							</div>
							<i className="minus icon" onClick={this.handleChangeRole.bind(this)}></i>
							<span>{this.roleCount('mason')}</span>
							<i className="plus icon" onClick={this.handleChangeRole.bind(this)}></i>
						</div>
						<div className="column">
							<div className="info-popup" data-role="seer"></div>
							<div className="ui small popup bottom right transition hidden">
								Seers wake up, and may look at another player's card, or two of the center cards.  Seers are on the <span>village team.</span>
							</div>
							<i className="minus icon" onClick={this.handleChangeRole.bind(this)}></i>
							<span>{this.roleCount('seer')}</span>
							<i className="plus icon" onClick={this.handleChangeRole.bind(this)}></i>
						</div>
						<div className="column">
							<div className="info-popup" data-role="robber"></div>
							<div className="ui small popup bottom right transition hidden">
								Robbers wake up, and may look at another player's card.  If so, they swap that player's card with their own, and then become the team of the card they have stolen (and vice versa); however, they do not take an additional night action.  Robbers are on the <span>village team.</span>
							</div>
							<i className="minus icon" onClick={this.handleChangeRole.bind(this)}></i>
							<span>{this.roleCount('robber')}</span>
							<i className="plus icon" onClick={this.handleChangeRole.bind(this)}></i>
						</div>
					</div>
					<div className="row">
						<div className="column">
							<div className="info-popup" data-role="troublemaker"></div>
							<div className="ui small popup bottom right transition hidden">
								Troublemakers wake up, and may swap the cards of two players without looking at them.  Troublemakers are on the <span>village team.</span>
							</div>
							<i className="minus icon" onClick={this.handleChangeRole.bind(this)}></i>
							<span>{this.roleCount('troublemaker')}</span>
							<i className="plus icon" onClick={this.handleChangeRole.bind(this)}></i>
						</div>
						<div className="column">
							<div className="info-popup" data-role="insomniac"></div>
							<div className="ui small popup bottom right transition hidden">
								Insomniacs wake up, and may look at their card to see if they are still the insomniac.  Insomniacs are on the <span>village team.</span>
							</div>
							<i className="minus icon" onClick={this.handleChangeRole.bind(this)}></i>
							<span>{this.roleCount('insomniac')}</span>
							<i className="plus icon" onClick={this.handleChangeRole.bind(this)}></i>
						</div>
						<div className="column">
							<div className="info-popup" data-role="hunter"></div>
							<div className="ui small popup bottom right transition hidden">
								Hunters do not wake up.  If a hunter is eliminated, the player he or she is selecting for elimination is also eliminated.  Hunters are on the <span>village team.</span>
							</div>
							<i className="minus icon" onClick={this.handleChangeRole.bind(this)}></i>
							<span>{this.roleCount('hunter')}</span>
							<i className="plus icon" onClick={this.handleChangeRole.bind(this)}></i>
						</div>
						<div className="column tanner">
							<div className="info-popup" data-role="tanner"></div>
							<div className="ui small popup bottom right transition hidden">
								Tanners do not wake up.  Tanners are suicidal and only win if they are eliminated.  There is a maximum of 3 tanners per game.  Tanners are on <span className="tanner-inner">their own team individually</span> and do not win if another tanner wins.
							</div>
							<i className="minus icon" onClick={this.handleChangeRole.bind(this)}></i>
							<span>{this.roleCount('tanner')}</span>
							<i className="plus icon" onClick={this.handleChangeRole.bind(this)}></i>
						</div>
						<div className="column">
							<div className="info-popup" data-role="villager"></div>
							<div className="ui small popup bottom right transition hidden">
								Villagers do not wake up.  Villagers are on the <span>village team.</span>
							</div>
							<i className="minus icon" onClick={this.handleChangeRole.bind(this)}></i>
							<span>{this.roleCount('villager')}</span>
							<i className="plus icon" onClick={this.handleChangeRole.bind(this)}></i>
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
						<div className={
							(() => {
								let classes = 'ui button primary',
									disabled = this.state.roles.length !== 10 ? 'disabled ' : ''; // strings and ternaries don't mix well

								return disabled + classes;
							})()
						} onClick={this.createNewGame.bind(this)}>
							Create game
						</div>
					</div>
				</div>
			</section>
		);
	}
};