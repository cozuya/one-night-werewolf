'use strict';

import React from 'react';
import $ from 'jquery';
import Popup from 'semantic-ui-popup';
import Dropdown from 'semantic-ui-dropdown';
import Progress from 'semantic-ui-progress';
import Modal from 'semantic-ui-modal';
import socket from 'socket.io-client';

socket = socket();
$.fn.dropdown = Dropdown;
$.fn.popup = Popup;
$.fn.progress = Progress;
$.fn.modal = Modal;

export default class Table extends React.Component {
	componentDidUpdate() {
		let gameInfo = this.props.gameInfo;

		// if (!gameInfo.inProgress && gameInfo.seatedCount === 7) {
		if (!gameInfo.inProgress && gameInfo.seatedCount === 2) {
			socket.emit('startGameCountdown', gameInfo.uid);
		}
	}

	leaveGame() {
		this.props.updateSeatedUsers(null);
	}

	validateLeaveButton() {
		// need to disable when user is seated and seatedCount === 7

		return 'remove icon';
	}

	clickedSeat(el) {
		let seated = this.props.gameInfo.seated,
			userInfo = this.props.userInfo,
			$seat = $(el.currentTarget),
			isUserAlreadySeated = Object.keys(seated).find((seat) => {
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

	render() {
		return (
			<section className="table">
				<div className="tableimage"></div>
				{[1,2,3,4,5,6,7].map((el) => {
					let seated = this.props.gameInfo.seated[`seat${el}`],
						classes = () => {
							return seated ? `seat seat${el}` : `seat seat${el} empty`;
						},
						seatNumber = () => {
							return el;
						},
						user = seated ? this.props.gameInfo.seated[`seat${el}`].userName : 'Empty seat';
					
					return <div key={el} className={classes()} data-seatnumber={seatNumber()} onClick={this.clickedSeat.bind(this)}>{user}</div>
				})}
				<div className="seat mid1"></div>
				<div className="seat mid2"></div>
				<div className="seat mid3"></div>
				<i onClick={this.leaveGame.bind(this)} className={this.validateLeaveButton()}></i>
				<div className="ui basic small modal">
					<i className="close icon"></i>
					<div className="ui header">You will need to sign in or sign up for an account to play.</div>
				</div>
			</section>
		);
	}
};