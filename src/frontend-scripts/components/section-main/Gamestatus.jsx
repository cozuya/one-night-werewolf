'use strict';

import React from 'react';

export default class Gamestatus extends React.Component {
	constructor() {
		this.state = {
			time: 0,
			newTimer: true
		}		
	}

	componentDidMount() {
		console.log(this.props.gameInfo);
	}

	componentDidUpdate() {
		if (this.props.gameInfo.status.countDown && !this.state.newTimer) {
			this.countDown();
		}
	}

	countDown() {
		let time = this.props.gameInfo.status.countDown,
			timer = setInterval(() => {
				console.log(time);
				if (time === 0) {
					clearInterval(timer);
				}

				this.setState({time});
				time--;
			}, 1000);

		this.setState({newTimer: false});
	}

	processStatus() {
		if (this.props.gameInfo.status.countDown) {
			return (
				<div>
					{this.props.gameInfo.status.preCountdown}
					{this.state.time}
					{this.props.gameInfo.status.postCountdown}
				</div>
			);
		} else {
			return this.props.gameInfo.status.preCountdown;
		}
	}

	// <p>{this.props.gameInfo.status}</p>
	// <p dangerouslySetInnerHTML={{__html: this.foo()}}></p>

	render() {
		return (
			<section className="gamestatus">
				{this.processStatus()}
			</section>
		);
	}
};