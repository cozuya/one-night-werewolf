'use strict';

import React from 'react';
import $ from 'jquery';
import Popup from 'semantic-ui-popup';
import Dropdown from 'semantic-ui-dropdown';
import Modal from 'semantic-ui-modal';
import socket from 'socket.io-client';
import _ from 'lodash';

$.fn.popup = Popup;
$.fn.modal = Modal;

export default class Table extends React.Component {
	constructor() {
		this.state = {
			firstClickedCard: '',
		};
	}

	componentDidUpdate(prevProps) {
		let { gameInfo, userInfo } = this.props,
			{ tableState, gameState } = gameInfo,
			prevTableState = prevProps.gameInfo.tableState;

		// if (tableState.cardsDealt === 'in progress') {
		// 	setTimeout(() => {
		// 		this.revealCard(userInfo.seatNumber);
		// 	}, 1500);
		// }

		// if (gameState.isNight && userInfo.seatNumber) {
		// 	this.processNightActions(prevTableState);
		// }

		// if (userInfo.seatNumber && tableState.isVotable && tableState.isVotable.enabled && !prevTableState.isVotable) {
		// 	let nonPlayersCards = _.range(0, 7).filter((seatNumber) => {
		// 		return seatNumber !== parseInt(userInfo.seatNumber);
		// 	});

		// 	this.highlightCards(nonPlayersCards);
		// }

		// if (tableState.cardRoles) {
		// 	tableState.cardRoles.forEach((role, index) => {
		// 		if (role) {
		// 			this.revealCard(index);
		// 		}
		// 	});
		// }

		if (gameInfo.inProgress && !prevProps.gameInfo.inProgress) {
			let $cards = $('div.card'),
				centerTop = 190,
				centerLeft = 260,
				shuffleInterval = setInterval(() => {
					$cards.each(function () {
						$(this).css({
							top: `${(190 + (Math.floor(Math.random() * 30) - 15)).toString()}px`,
							left: `${(260 + (Math.floor(Math.random() * 30) - 15)).toString()}px`
						});
					});
				}, 300);

			setTimeout(() => { // quality stuff here
				clearInterval(shuffleInterval);
			}, 5000);
		}

		console.log(gameInfo);
	}

	shouldComponentUpdate(nextProps) {
		return !_.isEqual(nextProps.gameInfo, this.props.gameInfo);
	}

	componentDidMount() {
		if (!Object.keys(this.props.userInfo).length || this.props.userInfo.gameSettings && !this.props.userInfo.gameSettings.disablePopups) {
			$('i.warning.sign.icon').popup({
				inline: true,
				hoverable: true,
				lastResort: true,
				delay: {
					show: 700,
					hide: 800
				}
			});
		}

		if (this.props.gameInfo.tableState.cardRoles) {
			this.props.gameInfo.tableState.cardRoles.forEach((role, index) => {
				if (role) {
					this.revealCard(index);
				}
			});
		}
	}

	processNightActions(prevTableState) {
		let { gameInfo, userInfo } = this.props,
			tableState = gameInfo.tableState;

		if (tableState) {
			switch (tableState.nightAction.action) {
				case 'werewolf':
					if (tableState.nightAction.singleWerewolf) {
						if (!prevTableState.nightAction.singleWerewolf) {
							this.highlightCards([7, 8, 9]);
						}

						if (prevTableState.nightAction && !prevTableState.nightAction.completed && tableState.nightAction.roleClicked) {

							$(`section.table .card${tableState.nightAction.seatClicked} .card-front`).addClass(tableState.nightAction.roleClicked);
							this.revealCard(tableState.nightAction.seatClicked);
						}
					} else {
						if (!prevTableState.nightAction.action) {
							let otherSeats = tableState.nightAction.otherSeats.filter((seat) => {
								return seat !== parseInt(userInfo.seatNumber);
							});

							this.highlightCards(otherSeats);
						}
					}
					break;

				case 'insomniac':
					if (!prevTableState.nightAction.action) {
						this.highlightCards([parseInt(userInfo.seatNumber)]);
					}

					if (prevTableState.nightAction && !prevTableState.nightAction.completed && tableState.nightAction.roleClicked) {
						$(`section.table .card${tableState.nightAction.seatClicked} .card-front`).addClass(tableState.nightAction.roleClicked);
						this.revealCard(tableState.nightAction.seatClicked);
					}
					break;
				
				case 'troublemaker':
					if (!prevTableState.nightAction.action) {
						let nonPlayersCards = _.range(0, 7).filter((seatNumber) => {
							return seatNumber !== parseInt(userInfo.seatNumber);
						});

						this.highlightCards(nonPlayersCards);
					}

					if (prevTableState.nightAction && !prevTableState.nightAction.completed && tableState.nightAction.seatsClicked) {
						this.swapCards(tableState.nightAction.seatsClicked);
					}
					break;

				case 'robber':
					if (!prevTableState.nightAction.action) {
						let nonPlayersCards = _.range(0, 7).filter((seatNumber) => {
							return seatNumber !== parseInt(userInfo.seatNumber);
						});

						this.highlightCards(nonPlayersCards);
					}

					if (prevTableState.nightAction && !prevTableState.nightAction.completed && tableState.nightAction.seatClicked) {
						this.swapCards([tableState.nightAction.seatClicked, userInfo.seatNumber]);
						setTimeout(() => {
							$(`section.table .card${tableState.nightAction.seatClicked} .card-front`).addClass(tableState.nightAction.newRole);
							this.revealCard(tableState.nightAction.seatClicked);
						}, 2000);
					}
					break;

				case 'seer':
					if (!prevTableState.nightAction.action) {
						let nonPlayersCards = _.range(0, 10).filter((seatNumber) => {
							return seatNumber !== parseInt(userInfo.seatNumber);
						});

						this.highlightCards(nonPlayersCards);
					}

					if (prevTableState.nightAction && !prevTableState.nightAction.completed && tableState.nightAction.rolesClicked) {
						tableState.nightAction.rolesClicked.forEach((role, index) => {
							$(`section.table .card${tableState.nightAction.seatsClicked[index]} .card-front`).addClass(tableState.nightAction.rolesClicked[index]);
							this.revealCard(tableState.nightAction.seatsClicked[index]);
						});
					}
					break;

				case 'minion':
					if (!prevTableState.nightAction.action) {
						this.highlightCards(tableState.nightAction.others);
					}
					break;

				case 'mason':
					if (!prevTableState.nightAction.action) {
						this.highlightCards(tableState.nightAction.others);
					}
					break;
			}
		}
	}

	swapCards(cards) {
		let $card1 = $(`section.table .card${cards[0]}`),
			$card2 = $(`section.table .card${cards[1]}`);

		$card1.removeClass(`seat${cards[0]}`).addClass(`seat${cards[1]}`);
		$card2.removeClass(`seat${cards[1]}`).addClass(`seat${cards[0]}`);
	}

	highlightCards(cards) { // array of numbers 1-10
		let $cards = cards.map((cardNum) => {
			return $(`section.table .card${cardNum}`);
		});

		setTimeout(() => {
			$cards.forEach(($card) => {
				$card.addClass('card-notify');				
			});
		}, 1500);

		setTimeout(() => {
			$cards.forEach(($card) => {
				$card.removeClass('card-notify');				
			});
		}, 2000);

		setTimeout(() => {
			$cards.forEach(($card) => {
				$card.addClass('card-notify');				
			});
		}, 2500);

		setTimeout(() => {
			$cards.forEach(($card) => {
				$card.removeClass('card-notify');				
			});
		}, 3000);
	}

	leaveGame() {
		if (this.props.gameInfo.completedGame) {
			this.props.updateSeatedUsers(null, true);			
		} else {
			this.props.updateSeatedUsers(null);
		}
	}

	clickedSeat(e) {
		let { seated } = this.props.gameInfo,
			{ userInfo, gameInfo } = this.props,
			$seat = $(e.currentTarget);

		if (userInfo.userName) {
			if ($seat.hasClass('empty') && !userInfo.seatNumber && !this.props.gameInfo.completedGame) {
				this.props.updateSeatedUsers($seat.attr('data-seatnumber'));
			} else {
				this.props.selectedPlayer({
					playerName: $(e.currentTarget).find('span.username').text(),
					random: Math.random().toString(36).substring(2)
				});
			}
		} else {
			$('section.table div.small.modal').modal('show');
		}
	}

	createCards() {
		let { gameInfo, userInfo } = this.props,
			{ gameState, tableState } = gameInfo;

		return _.range(0, 10).map((num) => { 
			return (
				<div key={num} data-cardnumber={num} onClick={this.handleCardClick.bind(this)} className={
						(() => {
							let classes = `card card${num}`;

							if (gameState.cardsDealt
							 	// todo-alpha replace this || this.props.gameInfo.tableState.phase === 'elimination'
							 	) {
								classes += ` seat${num}`;
							}

							return classes;
						})()
					}>
					<div className={
						(() => {
							let classes = 'card-flipper';

							if (tableState.seats[num].flipped) {
								classes += ' flip';
							}

							if (tableState.seats[num].highlight) {
								classes += ` card-${seat.highlight}`;
							}

							return classes;
						})()
					}><div className="card-back"></div>
						<div className={
							(() => {
								let classes = `card-front seat-${num}`,
									seat = tableState.seats[num];


								if (seat.role) {
									classes += ` ${seat.role}`;
								}

								return classes;
							})()
						}></div>
					</div>
				</div>
			);
		});
	}

	handleCardClick(e) {
		let $card = $(e.currentTarget),
			cardNumber = $card.attr('data-cardnumber'),
			{ gameInfo, userInfo } = this.props,
			data = {
				userName: this.props.userInfo.userName,
				uid: gameInfo.uid
			};

		if (!gameInfo.tableState.nightAction.completed && gameInfo.tableState.nightAction.action === 'werewolf' && $card.attr('data-cardnumber') > 6) {
			data.role = 'singleWerewolf';
			data.action = cardNumber;
			this.props.onUserNightActionEventSubmit(data);
		}

		if (!gameInfo.tableState.nightAction.completed && gameInfo.tableState.nightAction.action === 'insomniac') {
			let playerSeat = Object.keys(gameInfo.seated).find((seat) => {
				return gameInfo.seated[seat].userName === this.props.userInfo.userName;
			}).split('seat')[1];

			if (cardNumber === playerSeat) {
				data.role = 'insomniac';
				data.action = cardNumber;
				this.props.onUserNightActionEventSubmit(data);
			}
		}

		if (!gameInfo.tableState.nightAction.completed && gameInfo.tableState.nightAction.action === 'troublemaker') {
			if (this.state.firstClickedCard && cardNumber !== this.props.userInfo.seatNumber) {
				if (cardNumber !== this.state.firstClickedCard) {
					data.role = 'troublemaker';
					data.action = [this.state.firstClickedCard, cardNumber];
					this.props.onUserNightActionEventSubmit(data);
				}
			} else if (cardNumber !== this.props.userInfo.seatNumber) {
				this.setState({
					firstClickedCard: cardNumber
				});
			}
		}

		if (!gameInfo.tableState.nightAction.completed && gameInfo.tableState.nightAction.action === 'seer') {
			if (this.state.firstClickedCard || parseInt(cardNumber) < 7) {
				let action = [cardNumber];

				if (this.state.firstClickedCard) {
					action.push(this.state.firstClickedCard);
				}

				data.role = 'seer';
				data.action = action;				
				this.props.onUserNightActionEventSubmit(data);
			} else {
				if (parseInt(cardNumber) > 6) {
					this.setState({
						firstClickedCard: cardNumber
					});
				}
			}
		}

		if (!gameInfo.tableState.nightAction.completed && gameInfo.tableState.nightAction.action === 'robber') {
			let playerSeat = Object.keys(gameInfo.seated).find((seat) => {
				return gameInfo.seated[seat].userName === this.props.userInfo.userName;
			}).split('seat')[1];

			if (cardNumber !== playerSeat) {
				data.role = 'robber';
				data.action = cardNumber;
				this.props.onUserNightActionEventSubmit(data);
			}
		}

		if (gameInfo.tableState.isVotable && !gameInfo.tableState.isVotable.completed) {  // todo-alpha: players can vote to eliminate themselves...
			$card.parent().find('.card').removeClass('card-select');
			$card.addClass('card-select');
			this.props.onUpdateSelectedForEliminationSubmit({
				uid: gameInfo.uid,
				seatNumber: userInfo.seatNumber,
				selectedForElimination: cardNumber // todo-alpha: very possible that this could be wrong PLAYER i.e. current user is TM and swaps cards 1 and 2 then selects player 2 (actually now card 1) and this variable will be card 1.  probably add "data-originalseatnumber" attribute.
			});
		}
	}

	nightBlockerStatus(position) {
		let { gameInfo } = this.props;

		if (gameInfo.tableState.isNight || gameInfo.gameState.isNight && !gameInfo.tableState.nightAction || gameInfo.tableState.nightAction && gameInfo.gameState.isNight && gameInfo.tableState.nightAction.phase !== gameInfo.gameState.phase) {
			return position === 'top' ? 'nightblocker nightblocker-top-blocked' : 'nightblocker nightblocker-bottom-blocked';
		} else {
			return position === 'top' ? 'nightblocker nightblocker-top': 'nightblocker nightblocker-bottom';
		}
	}
	
	truncateClicked(e) {
		let { gameInfo, userInfo } = this.props;

		if (userInfo.seatNumber && !gameInfo.isNight && gameInfo.inProgress) {
			let clicked = !!$(e.currentTarget).is(':checked');

			this.props.onUpdateTruncateGameSubmit({
				truncate: clicked,
				userName: userInfo.userName,
				uid: gameInfo.uid
			});
		}
	}

	clickedReportGame() {
		this.props.onUpdateReportGame({
			seatNumber: this.props.userInfo.seatNumber,
			userName: this.props.userInfo.userName,
			uid: this.props.gameInfo.uid
		});
	}

	render() {
		let { gameInfo, userInfo } = this.props;

		return (
			<section className="table">
				<div className={this.nightBlockerStatus('top')}></div>
				<div className={this.nightBlockerStatus('bottom')}></div>
				<div className="tableimage"></div>
					{_.range(0, 10).map((el) => {
						let seated = gameInfo.seated[`seat${el}`],
							classes = () => {
								return seated ? `seat seat${el}` : `seat seat${el} empty`;
							},
							seatNumber = () => {
								return el;
							},
							user = seated ? gameInfo.seated[`seat${el}`].userName : '';

						return (
								<div key={el} className={
									(() => {
										return `seat-container seat-container${el}`;								
									})()
								}>
									<div className={classes()} data-seatnumber={seatNumber()} onClick={this.clickedSeat.bind(this)}>
										<span className={
											(() => {
												let classes = 'username';

												if (seated && !gameInfo.seated[`seat${el}`].connected) {
													classes += ' socket-not-present';
												}

												if (userInfo.seatNumber === el.toString()) {
													classes += ' currentuser';
												}

												return classes;												
											})()
										}>{user}</span>
									</div>
									<div className={
										(() => {
											let classes = 'eliminator';

											if (el < 7 && gameInfo.tableState.eliminations && Object.keys(gameInfo.tableState.eliminations[el]).length) {
												classes += ` target-seat${gameInfo.tableState.eliminations[el].seatNumber}`;
											}

											if (gameInfo.tableState.eliminations && gameInfo.tableState.eliminations[el] && gameInfo.tableState.eliminations[el].transparent) {
												classes += ' transparent';
											}

											return classes;
										})()
									}></div>
								</div>
							);

					})}
					{this.createCards()}
				<i onClick={this.leaveGame.bind(this)} className={(() => {
					if ((!!userInfo.seatNumber && Object.keys(gameInfo.seated).length === 7 && !gameInfo.completedGame) || (gameInfo.inProgress && !gameInfo.completedGame)) {
						return 'app-hidden';
					} else {
						return 'remove icon';
					}
				})()}></i>
				<div className={
					(() => {
						let classes = 'table-uid';

						if (!this.props.gameInfo.inProgress) {
							classes += ' app-hidden';
						}

						return classes;
					})()
				}>
					Game ID: {gameInfo.uid}
					<i onClick={this.clickedReportGame.bind(this)} className={
						(() => {
							let classes = 'warning sign icon'; // todo-alpha should only show for seated players

							if (!Object.keys(this.props.userInfo).length) {
								classes += ' app-hidden';
							}

							if (this.props.userInfo.seatNumber && this.props.gameInfo.tableState.reportedGame && this.props.gameInfo.tableState.reportedGame[this.props.userInfo.seatNumber]) {
								classes += ' report-game-clicked';
							}

							return classes;
						})()
					}></i>
					<div className="ui popup transition hidden">
							Player abuse? Mark this game for reporting to the administrators for review.  Found a bug?  Send us an email.
					</div>
				</div>
				<div className={
					(() => {
						let classes = 'ui fitted toggle checkbox truncate-game',
							{ gameInfo } = this.props;

						if (!gameInfo.inProgress || gameInfo.tableState.isNight || (gameInfo.tableState.cardRoles && gameInfo.tableState.cardRoles.length) || /VOTE/.test(gameInfo.status) || /Game.starts/.test(gameInfo.status)) {  // pretty much total crap right here
							classes += ' app-hidden';
						}

						return classes;
					})()
				}>
					<input type="checkbox" name="truncate-game" onClick={this.truncateClicked.bind(this)}></input>
					<label>End the game early</label>
				</div>
				<div className="ui basic small modal">
					<i className="close icon"></i>
					<div className="ui header">You will need to sign in or sign up for an account to play.</div>
				</div>
			</section>
		);
	}
};