'use strict';

import React from 'react';
import $ from 'jquery';
import Popup from 'semantic-ui-popup';
import _ from 'lodash';

$.fn.popup = Popup;

export default class Table extends React.Component {
	constructor() {
		this.state = {
			firstClickedCard: '',
			showClaims: false
		};
	}
// todo-alpha make a new component in u/l corner with game name and length
	componentDidUpdate(prevProps) {
		let { gameInfo, userInfo } = this.props,
			{ gameState } = gameInfo;

		if (gameInfo.gameState.isStarted && !prevProps.gameInfo.gameState.isStarted) {
			let $cards = $('div.card'),
				centerTop = 190,
				centerLeft = 260,
				shuffleInterval = setInterval(() => {
					$cards.each(function () {
						$(this).css({
							top: `${(190 + (Math.floor(Math.random() * 30) - 15)).toString()}px`,
							left: `${(260 + (Math.floor(Math.random() * 30) - 15)).toString()}px`
						});
					});
				}, 300);

			setTimeout(() => { // quality stuff here
				clearInterval(shuffleInterval);
			}, 5000);
		}

		if (userInfo.seatNumber && gameState.isStarted && userInfo.gameSettings && !this.props.userInfo.gameSettings.disablePopups && !prevProps.gameInfo.gameState.isStarted) {
			$(this.refs.reportIcon).popup({
				inline: true,
				hoverable: true,
				lastResort: true,
				delay: {
					show: 700,
					hide: 800
				}
			});
		}
		console.log(this.props.gameInfo);
	}

	shouldComponentUpdate(nextProps) {
		return !_.isEqual(nextProps.gameInfo, this.props.gameInfo);
	}

	leaveGame() {
		if (this.props.gameInfo.gameState.isCompleted) {
			this.props.updateSeatedUsers(null, true);			
		} else {
			this.props.updateSeatedUsers(null);
		}
	}

	handleSeatClicked(e) {
		let { seated } = this.props.gameInfo,
			{ userInfo, gameInfo } = this.props,
			$seat = $(e.currentTarget);

		if (userInfo.userName) {
			if ($seat.hasClass('empty') && !userInfo.seatNumber && !gameInfo.gameState.isCompleted) {
				this.props.updateSeatedUsers($seat.attr('data-seatnumber'));
			} else {
				this.props.selectedPlayer({
					playerName: $(e.currentTarget).find('span.username').text(),
					random: Math.random().toString(36).substring(2)
				});
			}
		} else {
			$(this.refs.signinModal).modal('show');
		}
	}

	createCards() {
		let { gameInfo, userInfo } = this.props,
			{ gameState, tableState } = gameInfo;

		return _.range(0, 10).map((num) => { 
			return (
				<div key={num} data-cardnumber={num} onClick={this.handleCardClicked.bind(this)} className={
						(() => {
							let classes = `card card${num}`;

							if (tableState.seats[num].swappedWithSeat || tableState.seats[num].swappedWithSeat === 0) {
								classes += ` seat${tableState.seats[num].swappedWithSeat}`;
							} else if (gameState.cardsDealt) {
								classes += ` seat${num}`;
							}

							if (gameState.isCompleted) {
								classes += ` notransition`;
							}

							return classes;
						})()
					}>
					<div className={
						(() => {
							let classes = 'card-flipper';

							if (tableState.seats[num].isFlipped) {
								classes += ' flip';
							}

							if (tableState.seats[num].highlight) {
								classes += ` card-${tableState.seats[num].highlight}`;
							}

							return classes;
						})()
					}><div className={
						(() => {
							let classes;

							if (!gameState.isCompleted && gameState.isStarted && tableState.seats[num].claim && this.state.showClaims) {
								classes = `claim claim-${tableState.seats[num].claim}`;
							} else {
								classes = 'card-back';
							}

							return classes;
						})()
					}></div>
						<div className={
							(() => {
								let classes = `card-front seat-${num}`,
									seat = tableState.seats[num];

								if (seat.role) {
									classes += ` ${seat.role}`;
								}

								return classes;
							})()
						}></div>
					</div>
				</div>
			);
		});
	}

	createSeats() {
		let { gameInfo, userInfo } = this.props;

		return _.range(0, 10).map((el) => {
			let seated = this.props.gameInfo.seated[`seat${el}`],
				user = seated ? gameInfo.seated[`seat${el}`].userName : '';

			return (
					<div key={el} className={
						(() => {
							return `seat-container seat-container${el}`;								
						})()
					}>
						<div className={seated ? `seat seat${el}` : `seat seat${el} empty`} data-seatnumber={el} onClick={this.handleSeatClicked.bind(this)}>
							<span className={
								(() => {
									let classes = 'username';

									if (seated && !gameInfo.seated[`seat${el}`].connected) {
										classes += ' socket-not-present';
									}

									if (userInfo.seatNumber === el.toString()) {
										classes += ' currentuser';
									}

									return classes;												
								})()
							}>{user}</span>
						</div>
						<div className={
							(() => {
								let classes = 'eliminator',
									{ eliminations } = gameInfo.gameState;

								if (el < 7 && eliminations && eliminations[el]) {
									classes += ` target-seat${gameInfo.gameState.eliminations[el].seatNumber}`;
								}

								if (eliminations && eliminations[el] && eliminations[el].transparent) {
									classes += ' transparent';
								}

								return classes;
							})()
						}></div>
					</div>
				);
			});
	}

	handleCardClicked(e) {
		let $card = $(e.currentTarget),
			cardNumber = $card.attr('data-cardnumber'),
			{ gameInfo, userInfo } = this.props,
			{ tableState, gameState } = gameInfo,
			data = {
				uid: gameInfo.uid
			};

		if (tableState.nightAction && !tableState.nightAction.completed && !gameState.isDay && gameState.phase === tableState.nightAction.phase) {
			data.userName = userInfo.userName;

			if (tableState.nightAction.action === 'singleWerewolf' && $card.attr('data-cardnumber') > 6) {
				data.role = 'singleWerewolf';
				data.action = cardNumber;
				this.props.onUserNightActionEventSubmit(data);
			}

			if (tableState.nightAction.action === 'insomniac' && cardNumber === userInfo.seatNumber) {
				data.role = 'insomniac';
				data.action = cardNumber;
				this.props.onUserNightActionEventSubmit(data);
			}

			if (tableState.nightAction.action === 'troublemaker' && parseInt(cardNumber) < 7 && cardNumber !== userInfo.seatNumber) {
				let { firstClickedCard } = this.state;

				if (firstClickedCard) {
					if (cardNumber !== firstClickedCard) {
						data.role = 'troublemaker';
						data.action = [this.state.firstClickedCard, cardNumber];
						this.props.onUserNightActionEventSubmit(data);
					}
				} else {
					this.setState({
						firstClickedCard: cardNumber
					});
				}
			}

			if (tableState.nightAction.action === 'seer' && cardNumber !== userInfo.seatNumber) {
				let { firstClickedCard } = this.state;

				if (firstClickedCard || parseInt(cardNumber) < 7) {
					let action = [cardNumber];

					if (firstClickedCard) {
						action.push(this.state.firstClickedCard);
					}

					data.role = 'seer';
					data.action = action;				
					this.props.onUserNightActionEventSubmit(data);
				} else if (parseInt(cardNumber) > 6) {
					this.setState({
						firstClickedCard: cardNumber
					});
				}
			}

			if (tableState.nightAction.action === 'robber' && parseInt(cardNumber) < 7 && cardNumber !== userInfo.seatNumber) {
				data.role = 'robber';
				data.action = cardNumber;
				this.props.onUserNightActionEventSubmit(data);
			}
		}

		if (gameInfo.tableState.isVotable && gameInfo.tableState.isVotable.enabled && userInfo.seatNumber) {
			let swappedWithSeat = tableState.seats[parseInt(cardNumber)].swappedWithSeat;

			if ((swappedWithSeat === 0 || swappedWithSeat) && userInfo.seatNumber !== swappedWithSeat || !swappedWithSeat && userInfo.seatNumber !== cardNumber) {
				$card.parent().find('.card').removeClass('card-select');
				$card.addClass('card-select');
				this.props.onUpdateSelectedForEliminationSubmit({
					uid: gameInfo.uid,
					seatNumber: userInfo.seatNumber,
					selectedForElimination: swappedWithSeat || cardNumber
				});
			}
		}
	}

	nightBlockerStatus(position) {
		let { gameInfo } = this.props;

		if (gameInfo.tableState.isNight || gameInfo.gameState.isNight && !gameInfo.tableState.nightAction || gameInfo.tableState.nightAction && gameInfo.gameState.isNight && gameInfo.tableState.nightAction.phase !== gameInfo.gameState.phase) {
			return position === 'top' ? 'nightblocker nightblocker-top-blocked' : 'nightblocker nightblocker-bottom-blocked';
		} else {
			return position === 'top' ? 'nightblocker nightblocker-top': 'nightblocker nightblocker-bottom';
		}
	}
	
	handleTruncateClicked(e) {
		let { gameInfo, userInfo } = this.props;

		if (userInfo.seatNumber && !gameInfo.isNight && gameInfo.isStarted) {
			let clicked = !!$(e.currentTarget).is(':checked');

			this.props.onUpdateTruncateGameSubmit({
				truncate: clicked,
				userName: userInfo.userName,
				uid: gameInfo.uid
			});
		}
	}

	handleClickedReportGame() {
		this.props.onUpdateReportGame({
			seatNumber: this.props.userInfo.seatNumber,
			uid: this.props.gameInfo.uid
		});
	}

	createReportGame() {
		let { gameInfo, userInfo } = this.props,
			{ gameState, tableState } = gameInfo;

		if (userInfo.seatNumber && gameState.isStarted) {
			let iconClasses = () => {
				let classes = 'warning sign icon';

				if (gameInfo.tableState.reported) {
					classes += ' report-game-clicked';
				}

				return classes;
			}

			return (
				<div className="table-uid">
					Game ID: {gameInfo.uid}
					<i onClick={this.handleClickedReportGame.bind(this)} ref="reportIcon" className={iconClasses()}></i>
					<div className="ui popup transition hidden">
							Player abuse? Mark this game for reporting to the administrators for review.  Found a bug?  Send us an email.
					</div>
				</div>
			);
		}
	}

	createUserGameOptions() {
		let { gameInfo, userInfo } = this.props,
			{ gameState} = gameInfo,
			toggleClaims = () => {
				this.setState({
					showClaims: $('input', this.refs.showclaims).is(':checked')
				});
			}

		if (userInfo.seatNumber && gameState.isStarted && gameState.isDay) { // todo alpha end game early should be hidden when below 15 seconds
			return (
				<div className="game-options-container">
					<div className="ui fitted toggle checkbox truncate-game">
						<input type="checkbox" name="truncate-game" onClick={this.handleTruncateClicked.bind(this)}></input>
						<label>End the game early</label>
					</div>
					<div className="ui fitted toggle checkbox checked showclaims" ref="showclaims">
						<input type="checkbox" name="show-claims" onClick={toggleClaims}></input>
						<label>Hide claims</label>
					</div>
				</div>
			);
		}
	}

	render() {
		let { gameInfo, userInfo } = this.props;

		return (
			<section className="table">
				<div className={this.nightBlockerStatus('top')}></div>
				<div className={this.nightBlockerStatus('bottom')}></div>
				<div className="tableimage"></div>
				{this.createSeats()}
				{this.createCards()}
				{(() => {
					if (!userInfo.seatNumber || !gameInfo.gameState.isStarted || gameInfo.gameState.isCompleted) {
						return <i onClick={this.leaveGame.bind(this)} className='remove icon'></i>
					}
				})()}
				{this.createReportGame()}
				{this.createUserGameOptions()}
				<div className="ui basic small modal" ref="signinModal">
					<i className="close icon"></i>
					<div className="ui header">You will need to sign in or sign up for an account to play.</div>
				</div>
			</section>
		);
	}
};