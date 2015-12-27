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

		if (!gameInfo.inProgress && gameInfo.seatedCount === 2 && gameInfo.seated.seat1.userName === this.props.userInfo.userName) {
			socket.emit('startGameCountdown', gameInfo.uid);
		}

		if (gameInfo.inProgress && gameInfo.status === 'Dealing..') {
			this.dealCards();
		}
	}

	// shouldComponentUpdate() {
	// 	let gameInfo = this.props.gameInfo;

	// 	if (!gameInfo.inProgress && gameInfo.seatedCount === 2 && gameInfo.seated.seat1.userName === this.props.userInfo.userName) {
	// 		return false;
	// 	}

	// 	return true;
	// }

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

	unStartedGame() {
		let reactDoesntLetMePutClassNameLogicInJSXForNoReason = (num) => {
			return `card card${num}`;
		};

		if (!this.props.gameInfo.inProgress || /^Game starts in/.test(this.props.gameInfo.status) || /^Dealing../.test(this.props.gameInfo.status)) {
			return _.range(1, 11).map((num) => {
				return <div key={num} className={reactDoesntLetMePutClassNameLogicInJSXForNoReason(num)}></div>
			});
		}
	}

	dealCards() {
		let $cards = $('section.table .cards'),
			endSeatTop = ['20px', '70px', '210px', '320px', '70px', '210px', '320px'],
			endSeatLeft = ['260px', '430px', '500px', '360px', '90px', '20px', '160px'];

		$cards.each((index) => {
			$(this).animate({
				top: endSeatTop[index],
				left: endSeatLeft[index]
			}, 3000);
		});
	}

	render() {
		return (
			<section className="table">
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
				{this.unStartedGame()}
				<i onClick={this.leaveGame.bind(this)} className={this.validateLeaveButton()}></i>
				<div className="ui basic small modal">
					<i className="close icon"></i>
					<div className="ui header">You will need to sign in or sign up for an account to play.</div>
				</div>
			</section>
		);
	}
};