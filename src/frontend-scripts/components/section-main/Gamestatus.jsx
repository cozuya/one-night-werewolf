'use strict';

import React from 'react';

export default class Gamestatus extends React.Component {
	constructor() {
		
	}

	componentDidMount() {
	}

	componentDidUpdate() {

	}

	countDown() {
		let time = this.props.gameInfo.status.countDown,
			timer = setInterval(() => {
				if (time === 0) {
					clearInterval(timer);
				}

				this.setState({time});
				time--;
			}, 1000);

		this.setState({newTimer: false});
	}

	processStatus() {
		let gameInfo = this.props.gameInfo;

		if (gameInfo.status.countDown) {
			return (
				<div>
					{gameInfo.status.preCountdown}
					{this.state.time}
					{gameInfo.status.postCountdown}
				</div>
			);
		} else {
			return gameInfo.status.message;
		}
	}

	// <p>{this.props.gameInfo.status}</p>
	// <p dangerouslySetInnerHTML={{__html: this.foo()}}></p>

	render() {
		return (
			<section className="gamestatus">
				{this.props.gameInfo.status}
			</section>
		);
	}
};