'use strict';

import React from 'react';
import $ from 'jquery';
import Popup from 'semantic-ui-popup';
import Dropdown from 'semantic-ui-dropdown';
import Modal from 'semantic-ui-modal';
import socket from 'socket.io-client';
import _ from 'lodash';

socket = socket();
$.fn.dropdown = Dropdown;
$.fn.popup = Popup;
$.fn.modal = Modal;

export default class Table extends React.Component {
	constructor() {
		this.state = {
			firstClickedCard: ''
		};
	}

	componentDidUpdate(prevProps) {
		let { gameInfo, userInfo } = this.props,
			{ tableState } = gameInfo,
			prevTableState = prevProps.gameInfo.tableState;

			console.log(tableState);

		if (tableState.cardsDealt === 'in progress') {
			this.dealCards();

			setTimeout(() => {
				this.revealCard(userInfo.seatNumber);
			}, 1500);
		}

		if (tableState.isNight && userInfo.seatNumber) {
			this.processNightActions(prevTableState);
		}

		if (userInfo.seatNumber && tableState.isVotable && tableState.isVotable.enabled && !prevTableState.isVotable) {
			let nonPlayersCards = _.range(0, 7).filter((seatNumber) => {
				return seatNumber !== parseInt(userInfo.seatNumber);
			});

			this.highlightCards(nonPlayersCards);
		}

		if (tableState.cardRoles) {
			tableState.cardRoles.forEach((role, index) => {
				this.revealCard(index);
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

	componentDidMount() {
		if (this.props.gameInfo.tableState.cardsDealt === true) {
			this.dealCards();
		}
	}

	revealCard(seatNumber) { // string
		let $cardFlipper = $(`section.table div.card${seatNumber} div.card-flipper`);

		$cardFlipper.addClass('flip');

		if (!this.props.gameInfo.tableState.cardRoles) {
			setTimeout(() => {
				$cardFlipper.removeClass('flip');			
			}, 4000);
		}
	}

	leaveGame() {
		this.props.updateSeatedUsers(null);
	}

	validateLeaveButton() {
		let { gameInfo } = this.props,
			isUserSeated = !!Object.keys(gameInfo.seated).find((seat) => { // todo check userinfo
				return gameInfo.seated[seat].userName === this.props.userInfo.userName;
			});

		if (isUserSeated && this.props.gameInfo.seatedCount === 2) { // todo (far in the future): clear this when game is completed
			return 'app-hidden';
		} else {
			return 'remove icon';
		}
	}

	clickedSeat(e) {
		let { seated } = this.props.gameInfo,
			{ userInfo } = this.props,
			$seat = $(e.currentTarget),
			isUserAlreadySeated = !!Object.keys(seated).find((seat) => { // todo check userinfo
				return seated[seat].userName === userInfo.userName;
			});

		if (userInfo.userName) {
			if ($seat.hasClass('empty') && !isUserAlreadySeated) {
				this.props.updateSeatedUsers($seat.attr('data-seatnumber'));
			}
		} else {
			$('section.table div.small.modal').modal('show');
		}
	}

	createCards() {
		return _.range(0, 10).map((num) => { 
			return (
				<div key={num} data-cardnumber={num} onClick={this.handleCardClick.bind(this)} className={
						(() => {
							return `card card${num}`;
						})()
					}>
					<div className="card-flipper">
						<div className="card-back"></div>
						<div className={
							(() => {
								let classes = `card-front seat-${num}`,
									{ tableState } = this.props.gameInfo,
									{ playerPerceivedRole } = tableState,
									playerSeat = Object.keys(this.props.gameInfo.seated).find((seat) => { // todo check userinfo
										return this.props.gameInfo.seated[seat].userName === this.props.userInfo.userName;
									});

								if (playerPerceivedRole && num === parseInt(playerSeat.split('seat')[1])) {
									classes = `${classes} ${playerPerceivedRole}`;
								} else if (tableState.cardRoles && !!tableState.cardRoles[num]) {
									console.log(tableState.cardRoles[num]);
									classes = `${classes} ${tableState.cardRoles[num]}`;
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
			socket.emit('userNightActionEvent', data);
		}

		if (!gameInfo.tableState.nightAction.completed && gameInfo.tableState.nightAction.action === 'insomniac') {
			let playerSeat = Object.keys(gameInfo.seated).find((seat) => {
				return gameInfo.seated[seat].userName === this.props.userInfo.userName;
			}).split('seat')[1];

			if (cardNumber === playerSeat) {
				data.role = 'insomniac';
				data.action = cardNumber;
				socket.emit('userNightActionEvent', data);
			}
		}

		if (!gameInfo.tableState.nightAction.completed && gameInfo.tableState.nightAction.action === 'troublemaker') {
			if (this.state.firstClickedCard && cardNumber !== this.props.userInfo.seatNumber) {
				if (cardNumber !== this.state.firstClickedCard) {
					data.role = 'troublemaker';
					data.action = [this.state.firstClickedCard, cardNumber];
					socket.emit('userNightActionEvent', data);
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
				socket.emit('userNightActionEvent', data);
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
				socket.emit('userNightActionEvent', data);
			}
		}

		if (gameInfo.tableState.isVotable && !gameInfo.tableState.isVotable.completed) {  // todo: players can vote to eliminate themselves...
			$card.parent().find('.card').removeClass('card-select');
			$card.addClass('card-select');
			socket.emit('updateSelectedForElimination', {
				uid: gameInfo.uid,
				seatNumber: userInfo.seatNumber,
				selectedForElimination: cardNumber // todo: very possible that this could be wrong PLAYER i.e. current user is TM and swaps cards 1 and 2 then selects player 2 (actually now card 1) and this variable will be card 1.  probably add "data-originalseatnumber" attribute.
			});
		}
	}

	dealCards() {
		let $cards = $('section.table .card');

		$cards.each(function (index) {
			$(this).addClass(`seat${index}`);
		});
	}

	nightBlockerStatus(position) {
		if (this.props.gameInfo.tableState.isNight && !Object.keys(this.props.gameInfo.tableState.nightAction).length) {
			return position === 'top' ? 'nightblocker nightblocker-top-blocked' : 'nightblocker nightblocker-bottom-blocked';
		} else {
			return position === 'top' ? 'nightblocker nightblocker-top': 'nightblocker nightblocker-bottom';
		}
	}

	render() {
		return (
			<section className="table">
				<div className={this.nightBlockerStatus('top')}></div>
				<div className={this.nightBlockerStatus('bottom')}></div>
				<div className="tableimage"></div>
					{_.range(0, 10).map((el) => {
						let { gameInfo } = this.props,
							seated = gameInfo.seated[`seat${el}`],
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
										<span className="username">{user}</span>
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
				<i onClick={this.leaveGame.bind(this)} className={this.validateLeaveButton()}></i>
				<div className="ui basic small modal">
					<i className="close icon"></i>
					<div className="ui header">You will need to sign in or sign up for an account to play.</div>
				</div>
			</section>
		);
	}
};