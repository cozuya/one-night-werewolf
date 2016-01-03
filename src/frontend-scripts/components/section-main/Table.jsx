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
	componentDidUpdate(prevProps) {
		let gameInfo = this.props.gameInfo,
			tableState = gameInfo.tableState;
		
		if (!gameInfo.inProgress && gameInfo.seatedCount === 2 && gameInfo.seated.seat1.userName === this.props.userInfo.userName && !gameInfo.inProgress) {  // todo: should do this on the back end - 1st seat could be disconnected
			socket.emit('startGameCountdown', gameInfo.uid);
		}

		if (gameInfo.tableState.cardsDealt === 'in progress') {
			this.dealCards();

			setTimeout(() => { // todo: add seat to userinfo, check for that before firing reveal.
				let playerSeat = Object.keys(gameInfo.seated).find((seat) => {
					return gameInfo.seated[seat].userName === this.props.userInfo.userName;
				});

				this.revealCard(playerSeat.split('seat')[1]);
			}, 2000);
		}

		if (tableState.isNight && tableState.nightAction.action === 'werewolf' && tableState.nightAction.singleWerewolf) {
			if (!prevProps.gameInfo.tableState.nightAction.singleWerewolf) {
				this.highlightCards([8, 9, 10]);
			}

			console.log(prevProps.gameInfo.tableState.nightAction);
			console.log(gameInfo.tableState.nightAction);

			if (prevProps.gameInfo.tableState.nightAction && !prevProps.gameInfo.tableState.nightAction.completed && tableState.nightAction.roleClicked) {

				$(`section.table .card${tableState.nightAction.seatClicked} .card-front`).addClass(tableState.nightAction.roleClicked);
				this.revealCard(tableState.nightAction.seatClicked);
			}
		}

		if (tableState.isNight && tableState.nightAction.action === 'insomniac') {
			if (!prevProps.gameInfo.tableState.nightAction) {
				// this.highlightCards([8, 9, 10]);  todo: highlight player's card
			}

			if (prevProps.gameInfo.tableState.nightAction && !prevProps.gameInfo.tableState.nightAction.completed && tableState.nightAction.roleClicked) {

				$(`section.table .card${tableState.nightAction.seatClicked} .card-front`).addClass(tableState.nightAction.roleClicked);
				this.revealCard(tableState.nightAction.seatClicked);
			}
		}		

		// console.log(gameInfo.tableState);
	}

	highlightCards(cards) { // array of numbers 1-10
		// todo: obv badly needs to be rewritten.

		let $cards2 = $('section.table').add('.card8').add('.card9').add('.card10');

		$cards2.addClass('card-notify');

		setTimeout(() => {
			$cards2.removeClass('card-notify');
		}, 2000);
	}

	componentDidMount() {
		if (this.props.gameInfo.tableState.cardsDealt === true) {
			this.dealCards();
		}
	}

	revealCard(seatNumber) {
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
		console.log('clickedseat fired');

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
			});

			if ($card.attr('data-cardnumber') === playerSeat.split('seat')[1]) {
				socket.emit('userNightActionEvent', {
					userName: this.props.userInfo.userName,
					uid: gameInfo.uid,
					role: 'insomniac',
					action: $(e.currentTarget).attr('data-cardnumber')
				});
			}
		}
	}

	dealCards() {
		let $cards = $('section.table .card');
			// endSeatTop = ['20px', '70px', '210px', '320px', '70px', '210px', '320px', '190px', '190px', '190px'],
			// endSeatLeft = ['260px', '430px', '500px', '360px', '90px', '20px', '160px', '180px', '260px', '340px']

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