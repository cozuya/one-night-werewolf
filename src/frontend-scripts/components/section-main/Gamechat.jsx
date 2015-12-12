'use strict';

import React from 'react';
import $ from 'jquery';
import Popup from 'semantic-ui-popup';
import Dropdown from 'semantic-ui-dropdown';
import Progress from 'semantic-ui-progress';

$.fn.dropdown = Dropdown;
$.fn.popup = Popup;
$.fn.progress = Progress;

export default class Gamechat extends React.Component {
	constructor() {
		
	}

	componentDidMount() {
		
	}

	clickExpand(el) {
		$(el.currentTarget).next().find('input').val('testing');
	}

	// <section className="segment previewbar">
	// 				<i className="large comment outline icon"></i>
	// 			</section>

	render() {
		return (
			<section className="gamechat">
				<section className="ui pointing menu">
					<a className="item active">All</a>
					<a className="item">Chat</a>
					<a className="item">Game</a>
				</section>
				<section className="segment chats">
				</section>
				<section className="segment inputbar">
					<i className="large expand icon" onClick={this.clickExpand.bind(this)}></i>
					<div className="ui action input">
						<input placeholder="Chat.."></input>
						<button className="ui button">Chat</button>
					</div>
					<i className="large delete icon"></i>
				</section>
			</section>
		);
	}
};