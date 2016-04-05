'use strict';

import React from 'react';
import $ from 'jquery';
import Popup from 'semantic-ui-popup';
import Dropdown from 'semantic-ui-dropdown';
import Modal from 'semantic-ui-modal';
import socket from 'socket.io-client';
import _ from 'lodash';

$.fn.popup = Popup;
$.fn.modal = Modal;

export default class Table extends React.Component {
	constructor() {
		this.state = {
			firstClickedCard: '',
		};
	}

	componentDidUpdate(prevProps) {
		let { gameInfo, userInfo } = this.props;

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
	}

	shouldComponentUpdate(nextProps) {
		return !_.isEqual(nextProps.gameInfo, this.props.gameInfo);
	}

	componentDidMount() {
		if (!Object.keys(this.props.userInfo).length || this.props.userInfo.gameSettings && !this.props.userInfo.gameSettings.disablePopups) {
			$('i.warning.sign.icon').popup({
				inline: true,
				hoverable: true,
				lastResort: true,
				delay: {
					show: 700,
					hide: 800
				}
			});
		}
	}

	leaveGame() {
		if (this.props.gameInfo.gameState.isCompleted) {
			this.props.updateSeatedUsers(null, true);			
		} else {
			this.props.updateSeatedUsers(null);
		}
	}

	clickedSeat(e) {
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
			$('section.table div.small.modal').modal('show');
		}
	}

	createCards() {
		let { gameInfo, userInfo } = this.props,
			{ gameState, tableState } = gameInfo;

		return _.range(0, 10).map((num) => { 
			return (
				<div key={num} data-cardnumber={num} onClick={this.handleCardClick.bind(this)} className={
						(() => {
							let classes = `card card${num}`;

							if (tableState.seats[num].swappedWithSeat) {
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
					}><div className="card-back"></div>
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
						<div className={seated ? `seat seat${el}` : `seat seat${el} empty`} data-seatnumber={el} onClick={this.clickedSeat.bind(this)}>
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

	createClaims() {
		let { tableState, gameState } = this.props.gameInfo;

		if (!gameState.isCompleted && gameState.isStarted) {
			return _.range(0, 7).map((el) => {
				return (
					<div key={el} className="claim-container">
						<div className={
							(() => {
								let classes = `claim claim${el}`;

								if (tableState.seats[el].claim) {
									classes += ` claim-${tableState.seats[el].claim}`;
								}

								return classes;
							})()
						}></div>
					</div>
				)
			});
		}
	}

	handleCardClick(e) {
		let $card = $(e.currentTarget),
			cardNumber = $card.attr('data-cardnumber'),
			{ gameInfo, userInfo } = this.props,
			{ tableState } = gameInfo,
			data = {
				uid: gameInfo.uid
			};

		if (tableState.nightAction && !tableState.nightAction.completed) {
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

			if (swappedWithSeat && userInfo.seatNumber !== swappedWithSeat || !swappedWithSeat && userInfo.seatNumber !== cardNumber) {
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
	
	truncateClicked(e) {
		let { gameInfo, userInfo } = this.props;

		if (userInfo.seatNumber && !gameInfo.isNight && gameInfo.inProgress) {
			let clicked = !!$(e.currentTarget).is(':checked');

			this.props.onUpdateTruncateGameSubmit({
				truncate: clicked,
				userName: userInfo.userName,
				uid: gameInfo.uid
			});
		}
	}

	clickedReportGame() {
		this.props.onUpdateReportGame({
			seatNumber: this.props.userInfo.seatNumber,
			userName: this.props.userInfo.userName,
			uid: this.props.gameInfo.uid
		});
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
					{this.createClaims()}
				<i onClick={this.leaveGame.bind(this)} className={(() => {
					if ((!!userInfo.seatNumber && Object.keys(gameInfo.seated).length === 7 && !gameInfo.gameState.isCompleted) || (gameInfo.inProgress && !gameInfo.completedGame)) {
						return 'app-hidden';
					} else {
						return 'remove icon';
					}
				})()}></i>
				<div className={
					(() => {
						let classes = 'table-uid';

						if (!this.props.gameInfo.inProgress) {
							classes += ' app-hidden';
						}

						return classes;
					})()
				}>
					Game ID: {gameInfo.uid}
					<i onClick={this.clickedReportGame.bind(this)} className={
						(() => {
							let classes = 'warning sign icon'; // todo-alpha should only show for seated players

							if (!Object.keys(this.props.userInfo).length) {
								classes += ' app-hidden';
							}

							if (this.props.userInfo.seatNumber && this.props.gameInfo.tableState.reportedGame && this.props.gameInfo.tableState.reportedGame[this.props.userInfo.seatNumber]) {
								classes += ' report-game-clicked';
							}

							return classes;
						})()
					}></i>
					<div className="ui popup transition hidden">
							Player abuse? Mark this game for reporting to the administrators for review.  Found a bug?  Send us an email.
					</div>
				</div>
				<div className={
					(() => {
						let classes = 'ui fitted toggle checkbox truncate-game',
							{ gameInfo } = this.props;

						if (!gameInfo.inProgress || gameInfo.tableState.isNight || (gameInfo.tableState.cardRoles && gameInfo.tableState.cardRoles.length) || /VOTE/.test(gameInfo.status) || /Game.starts/.test(gameInfo.status)) {  // pretty much total crap right here
							classes += ' app-hidden';
						}

						return classes;
					})()
				}>
					<input type="checkbox" name="truncate-game" onClick={this.truncateClicked.bind(this)}></input>
					<label>End the game early</label>
				</div>
				<div className="ui basic small modal">
					<i className="close icon"></i>
					<div className="ui header">You will need to sign in or sign up for an account to play.</div>
				</div>
			</section>
		);
	}
};