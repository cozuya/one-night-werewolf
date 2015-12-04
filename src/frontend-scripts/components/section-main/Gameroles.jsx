'use strict';

import React from 'react';
import $ from 'jquery';
import Popup from 'semantic-ui-popup';
import Dropdown from 'semantic-ui-dropdown';
import Progress from 'semantic-ui-progress';

$.fn.dropdown = Dropdown;
$.fn.popup = Popup;
$.fn.progress = Progress;

export default class Gameroles extends React.Component {
	constructor() {
		
	}

	componentDidMount() {
		
	}

	render() {
		return (
			<section className="gameroles">
				
			</section>
		);
	}
};