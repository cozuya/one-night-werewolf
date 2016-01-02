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
	componentDidUpdate() {
		let gameInfo = this.props.gameInfo;
		
		if (!gameInfo.inProgress && gameInfo.seatedCount === 4 && gameInfo.seated.seat1.userName === this.props.userInfo.userName && !gameInfo.inProgress) {  // todo: should do this on the back end - 1st seat could be disconnected
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

		console.log(gameInfo);
	}

	// shouldComponentUpdate() {
	// 	if (!gameInfo.inProgress && gameInfo.seatedCount === 2 && gameInfo.seated.seat1.userName === this.props.userInfo.userName) {
	// 		return false;
	// 	}

	// 	return true;
	// }

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
			reactDoesntLetMePutClassNameLogicInJSXForNoReason2 = () => {
				let classes = 'card-front',
					role = this.props.gameInfo.tableState.playerPerceivedRole;

				if (role) { // todo: check against player's seat in userinfo and only put that class on that seat as opposed to all classes
					classes = `${classes} ${role}`;
				}

				return classes;
			}

		return _.range(1, 11).map((num) => { // todo: this outputs the player's perceived role to every card instead of just theirs, kinda funny but should probably be looked at eventually.
			return (
				<div key={num} className={reactDoesntLetMePutClassNameLogicInJSXForNoReason(num)}>
					<div className="card-flipper">
						<div className="card-back"></div>
						<div className={reactDoesntLetMePutClassNameLogicInJSXForNoReason2()}></div>
					</div>
				</div>
			);
		});
	}

	dealCards() {
		let $cards = $('section.table .card');
			// endSeatTop = ['20px', '70px', '210px', '320px', '70px', '210px', '320px', '190px', '190px', '190px'],
			// endSeatLeft = ['260px', '430px', '500px', '360px', '90px', '20px', '160px', '180px', '260px', '340px']

		$cards.each(function (index) {
			if (index < 7) {
				$(this).addClass(`seat${index + 1}`);			
			} else {
				$(this).addClass(`mid${index + 1}`);
			}
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
				{_.range(1, 8).map((el) => {
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
				<div className="seat mid1"></div>
				<div className="seat mid2"></div>
				<div className="seat mid3"></div>
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