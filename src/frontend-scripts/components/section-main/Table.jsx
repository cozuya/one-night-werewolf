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
					
					return <div key={el} className={classes()} onClick={this.clickedSeat}>{user}</div>
				})}
				<div className="seat mid1"></div>
				<div className="seat mid2"></div>
				<div className="seat mid3"></div>
				<i className="remove icon" onClick={this.leaveGame}></i>
			</section>
		);
	}
};