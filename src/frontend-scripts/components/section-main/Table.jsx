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

	render() {
		return (
			<section className="table">
				<div className="tableimage"></div>
				<div className="seat seat1"></div>
				<div className="seat seat2"></div>
				<div className="seat seat3"></div>
				<div className="seat seat4"></div>
				<div className="seat seat5"></div>
				<div className="seat seat6"></div>
				<div className="seat seat7"></div>
			</section>
		);
	}
};