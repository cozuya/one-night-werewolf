'use strict';

import React from 'react';
import $ from 'jquery';
import Popup from 'semantic-ui-popup';
import Dropdown from 'semantic-ui-dropdown';
import Progress from 'semantic-ui-progress';
import Modal from 'semantic-ui-modal';
import socket from 'socket.io-client';
import _ from 'lodash';

socket = socket();
$.fn.dropdown = Dropdown;
$.fn.popup = Popup;
$.fn.progress = Progress;
$.fn.modal = Modal;

export default class Table extends React.Component {
	constructor() {
		this.state = {
			firstClickedCard: ''
		};
	}

	componentDidUpdate(prevProps) {
		let gameInfo = this.props.gameInfo,
			userInfo = this.props.userInfo,
			tableState = gameInfo.tableState;

		if (!gameInfo.inProgress && gameInfo.seatedCount === 2 && gameInfo.seated.seat1.userName === this.props.userInfo.userName && !gameInfo.inProgress) {  // todo: should do this on the back end - 1st seat could be disconnected
			socket.emit('startGameCountdown', gameInfo.uid);
		}

		if (gameInfo.tableState.cardsDealt === 'in progress') {
			this.dealCards();

			setTimeout(() => {
				this.revealCard(userInfo.seatNumber);
			}, 2000);
		}

		if (tableState.isNight && tableState.nightAction.action === 'werewolf') {
			if (tableState.nightAction.singleWerewolf) {
				if (!prevProps.gameInfo.tableState.nightAction.singleWerewolf) {
					this.highlightCards([8, 9, 10]);
				}

				if (prevProps.gameInfo.tableState.nightAction && !prevProps.gameInfo.tableState.nightAction.completed && tableState.nightAction.roleClicked) {

					$(`section.table .card${tableState.nightAction.seatClicked} .card-front`).addClass(tableState.nightAction.roleClicked);
					this.revealCard(tableState.nightAction.seatClicked);
				}
			} else {
				console.log(prevProps.gameInfo.tableState);
				if (!Object.keys(prevProps.gameInfo.tableState.nightAction)) { // todo doesn't work
					console.log('Hello World!');
					// this.highlightCards([8, 9, 10]);  todo: highlight player's card
				}
			}
		}

		if (tableState.isNight && tableState.nightAction.action === 'insomniac') {
			console.log(prevProps);
			if (!prevProps.gameInfo.tableState.nightAction) {
				console.log(userInfo.seatNumber);  // todo fix this, does not get to this block.
				this.highlightCards([parseInt(userInfo.seatNumber)]);
			}

			if (prevProps.gameInfo.tableState.nightAction && !prevProps.gameInfo.tableState.nightAction.completed && tableState.nightAction.roleClicked) {

				$(`section.table .card${tableState.nightAction.seatClicked} .card-front`).addClass(tableState.nightAction.roleClicked);
				this.revealCard(tableState.nightAction.seatClicked);
			}
		}

		if (tableState.isNight && tableState.nightAction.action === 'troublemaker') {
			if (!prevProps.gameInfo.tableState.nightAction) {
				// this.highlightCards([8, 9, 10]);  todo: highlight player's card
			}

			if (prevProps.gameInfo.tableState.nightAction && !prevProps.gameInfo.tableState.nightAction.completed && tableState.nightAction.seatsClicked) {
				this.swapCards(tableState.nightAction.seatsClicked);
			}
		}

		if (tableState.isNight && tableState.nightAction.action === 'robber') {
			if (!prevProps.gameInfo.tableState.nightAction) {
				// this.highlightCards([8, 9, 10]);  todo: highlight player's card
			}

			if (prevProps.gameInfo.tableState.nightAction && !prevProps.gameInfo.tableState.nightAction.completed && tableState.nightAction.seatClicked) {
				let playerSeat = Object.keys(gameInfo.seated).find((seat) => {
					return gameInfo.seated[seat].userName === this.props.userInfo.userName;
				}).split('seat')[1];

				console.log(tableState.nightAction);

				this.swapCards([tableState.nightAction.seatClicked, playerSeat]);
				setTimeout(() => {
					$(`section.table .card${tableState.nightAction.seatClicked} .card-front`).addClass(tableState.nightAction.newRole);
					this.revealCard(tableState.nightAction.seatClicked);
				}, 2000);
			}
		}

		if (tableState.isNight && tableState.nightAction.action === 'seer') {
			if (!prevProps.gameInfo.tableState.nightAction) {
				// this.highlightCards([8, 9, 10]);  todo: highlight player's card
			}

			if (prevProps.gameInfo.tableState.nightAction && !prevProps.gameInfo.tableState.nightAction.completed && tableState.nightAction.rolesClicked) {

				tableState.nightAction.rolesClicked.forEach((role, index) => {
					console.log(tableState.nightAction);
					$(`section.table .card${tableState.nightAction.seatsClicked[index]} .card-front`).addClass(tableState.nightAction.rolesClicked[index]);
					this.revealCard(tableState.nightAction.seatsClicked[index]);
				});
			}
		}

		if (tableState.isNight && tableState.nightAction.action === 'minion') { // todo: probably doesn't work.
			if (!prevProps.gameInfo.tableState.nightAction.minion) {
				// this.highlightCards([8, 9, 10]);
			}
		}

		if (tableState.isNight && tableState.nightAction.action === 'mason') { // todo: probably doesn't work.
			if (!prevProps.gameInfo.tableState.nightAction.mason) {
				// this.highlightCards([8, 9, 10]);
			}
		}		

		// console.log(gameInfo.tableState);
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
		}, 1000);

		setTimeout(() => {
			$cards.forEach(($card) => {
				$card.removeClass('card-notify');				
			});
		}, 1750);

		setTimeout(() => {
			$cards.forEach(($card) => {
				$card.addClass('card-notify');				
			});
		}, 2500);

		setTimeout(() => {
			$cards.forEach(($card) => {
				$card.removeClass('card-notify');				
			});
		}, 3250);
	}

	componentDidMount() {
		if (this.props.gameInfo.tableState.cardsDealt === true) {
			this.dealCards();
		}
	}

	revealCard(seatNumber) { // string
		let $cardFlipper = $(`section.table div.card${seatNumber} div.card-flipper`);

		$cardFlipper.addClass('flip');

		setTimeout(() => {
			$cardFlipper.removeClass('flip');			
		}, 4000);
	}

	leaveGame() {
		this.props.updateSeatedUsers(null);
	}

	validateLeaveButton() {
		let gameInfo = this.props.gameInfo,
			isUserSeated = !!Object.keys(gameInfo.seated).find((seat) => {
				return gameInfo.seated[seat].userName === this.props.userInfo.userName;
			});

		if (isUserSeated && this.props.gameInfo.seatedCount === 2) { // todo (far in the future): clear this when game is completed
			return 'app-hidden';
		} else {
			return 'remove icon';
		}
	}

	clickedSeat(e) {
		let seated = this.props.gameInfo.seated,
			userInfo = this.props.userInfo,
			$seat = $(e.currentTarget),
			isUserAlreadySeated = !!Object.keys(seated).find((seat) => {
				return seated[seat].userName === userInfo.userName;
			});

		if (userInfo.userName) {
			if ($seat.hasClass('empty') && !isUserAlreadySeated) {
				this.props.updateSeatedUsers($seat.attr('data-seatnumber'));
			}
		} else {
			$('section.table div.small.modal').modal('show');  // todo: should hook into e.currentTarget for modulatory (sp)
		}
	}

	createCards() {
		let reactDoesntLetMePutClassNameLogicInJSXForNoReason = (num) => {
				return `card card${num}`;
			},
			reactDoesntLetMePutClassNameLogicInJSXForNoReason2 = (num) => {
				let classes = `card-front seat-${num}`,
					role = this.props.gameInfo.tableState.playerPerceivedRole,
					playerSeat = Object.keys(this.props.gameInfo.seated).find((seat) => {
						return this.props.gameInfo.seated[seat].userName === this.props.userInfo.userName;
					});


				if (role && num === parseInt(playerSeat.split('seat')[1])) {
					classes = `${classes} ${role}`;
				}

				return classes;
			}

		return _.range(1, 11).map((num) => { 
			return (
				<div key={num} data-cardnumber={num} onClick={this.handleCardClick.bind(this)} className={reactDoesntLetMePutClassNameLogicInJSXForNoReason(num)}>
					<div className="card-flipper">
						<div className="card-back"></div>
						<div className={reactDoesntLetMePutClassNameLogicInJSXForNoReason2(num)}></div>
					</div>
				</div>
			);
		});
	}

	handleCardClick(e) {
		let $card = $(e.currentTarget),
			gameInfo = this.props.gameInfo;

		if (!gameInfo.tableState.nightAction.completed && gameInfo.tableState.nightAction.action === 'werewolf' && $card.attr('data-cardnumber') > 7) {
			socket.emit('userNightActionEvent', {
				userName: this.props.userInfo.userName,
				uid: gameInfo.uid,
				role: 'singleWerewolf',
				action: $(e.currentTarget).attr('data-cardnumber')
			});
		}

		if (!gameInfo.tableState.nightAction.completed && gameInfo.tableState.nightAction.action === 'insomniac') {
			let playerSeat = Object.keys(gameInfo.seated).find((seat) => {
				return gameInfo.seated[seat].userName === this.props.userInfo.userName;
			}).split('seat')[1];

			if ($card.attr('data-cardnumber') === playerSeat) {
				socket.emit('userNightActionEvent', {
					userName: this.props.userInfo.userName,
					uid: gameInfo.uid,
					role: 'insomniac',
					action: $(e.currentTarget).attr('data-cardnumber')
				});
			}
		}

		if (!gameInfo.tableState.nightAction.completed && gameInfo.tableState.nightAction.action === 'troublemaker') {
			if (this.state.firstClickedCard) {
				if ($card.attr('data-cardnumber') !== this.state.firstClickedCard) {
					socket.emit('userNightActionEvent', {
						userName: this.props.userInfo.userName,
						uid: gameInfo.uid,
						role: 'troublemaker',
						action: [this.state.firstClickedCard, $card.attr('data-cardnumber')]
					});
				}
			} else {
				this.setState({
					firstClickedCard: $card.attr('data-cardnumber')
				});
			}
		}

		if (!gameInfo.tableState.nightAction.completed && gameInfo.tableState.nightAction.action === 'seer') {
			let cardNum = $card.attr('data-cardnumber');

			if (this.state.firstClickedCard || parseInt(cardNum) < 8) {
				let action = [cardNum];

				if (this.state.firstClickedCard) {
					action.push(this.state.firstClickedCard);
				}
				
				socket.emit('userNightActionEvent', {
					userName: this.props.userInfo.userName,
					uid: gameInfo.uid,
					role: 'seer',
					action
				});
			} else {
				if (parseInt(cardNum) > 7) {
					this.setState({
						firstClickedCard: cardNum
					});
				}
			}
		}

		if (!gameInfo.tableState.nightAction.completed && gameInfo.tableState.nightAction.action === 'robber') {
			let playerSeat = Object.keys(gameInfo.seated).find((seat) => {
				return gameInfo.seated[seat].userName === this.props.userInfo.userName;
			}).split('seat')[1];

			if ($card.attr('data-cardnumber') !== playerSeat) {
				socket.emit('userNightActionEvent', {
					userName: this.props.userInfo.userName,
					uid: gameInfo.uid,
					role: 'robber',
					action: $card.attr('data-cardnumber')
				});
			}
		}
	}

	dealCards() {
		let $cards = $('section.table .card');

		$cards.each(function (index) {
			$(this).addClass(`seat${index + 1}`);
		});
	}

	nightBlockerStatusTop () {
		if (this.props.gameInfo.tableState.isNight && !Object.keys(this.props.gameInfo.tableState.nightAction).length) {
			return "nightblocker nightblocker-top-blocked";
		} else {
			return "nightblocker nightblocker-top";
		}
	}

	nightBlockerStatusBottom () {
		if (this.props.gameInfo.tableState.isNight && !Object.keys(this.props.gameInfo.tableState.nightAction).length) {
			return "nightblocker nightblocker-bottom-blocked";
		} else {
			return "nightblocker nightblocker-bottom";
		}
	}

	render() {
		return (
			<section className="table">
				<div className={this.nightBlockerStatusTop()}></div>
				<div className={this.nightBlockerStatusBottom()}></div>
				<div className="tableimage"></div>
				{_.range(1, 11).map((el) => {
					let seated = this.props.gameInfo.seated[`seat${el}`],
						classes = () => {
							return seated ? `seat seat${el}` : `seat seat${el} empty`;
						},
						seatNumber = () => {
							return el;
						},
						user = seated ? this.props.gameInfo.seated[`seat${el}`].userName : '';

					return <div key={el} className={classes()} data-seatnumber={seatNumber()} onClick={this.clickedSeat.bind(this)}><span className="username">{user}</span></div>
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