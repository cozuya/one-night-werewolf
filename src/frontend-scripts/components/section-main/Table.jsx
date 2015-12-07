'use strict';

import React from 'react';
import $ from 'jquery';
import Popup from 'semantic-ui-popup';
import Dropdown from 'semantic-ui-dropdown';
import Progress from 'semantic-ui-progress';

$.fn.dropdown = Dropdown;
$.fn.popup = Popup;
$.fn.progress = Progress;

export default class Table extends React.Component {
	constructor() {
		
	}

	componentDidMount() {

	}

	leaveGame() {
		
	}

	clickedSeat(el) {
		let seated = this.props.gameInfo.seated,
			$seat = $(el.currentTarget);

		console.log(this.props.userInfo.userName);
		console.log($seat);

		if (this.props.userInfo.userName) {
			if ($seat.hasClass('empty')) {
				console.log('hi');
				this.props.seatUser();
			}
		} else {
			// popup something that tells them they must be signed in to play
		}
		console.log(el);
		console.log(this.props);
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
						user;

					user = seated ? this.props.gameInfo.seated[`seat${el}`].userName : 'Empty seat';
					
					return <div key={el} className={classes()} data-seatnumber="el" onClick={this.clickedSeat.bind(this)}>{user}</div>
				})}
				<div className="seat mid1"></div>
				<div className="seat mid2"></div>
				<div className="seat mid3"></div>
				<i className="remove icon" onClick={this.leaveGame}></i>
			</section>
		);
	}
};