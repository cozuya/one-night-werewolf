'use strict';

let { sendInprogressChats } = require('./gamechat'),
	getTrueRoleBySeatNumber = (game, num) => {
		num = parseInt(num);

		return num < 7 ? game.internals.seatedPlayers[num].trueRole : game.internals.centerRoles[num - 7];
	},
	updatedTrueRoles = [];

module.exports.updateUserNightActionEvent = (socket, data) => {
	let { games } = require('./game'),
		game = games.find((el) => {
			return el.uid === data.uid;
		}),
		player = game.internals.seatedPlayers.find((player) => {
			return player.userName === data.userName;
		}),
		chat = {
			gameChat: true,
			userName: player.userName,
			seat: player.seat,
			timestamp: new Date()
		},
		eventMap = {
			singleWerewolf() {
				let selectedCard = {
					7: 'CENTER LEFT',
					8: 'CENTER MIDDLE',
					9: 'CENTER RIGHT'
				},
				roleClicked = getTrueRoleBySeatNumber(game, data.action);

				player.nightAction.roleClicked = roleClicked;
				player.nightAction.seatClicked = data.action;
				player.nightAction.completed = true;
				chat.chat = `You select the ${selectedCard[data.action]} card and it is revealed to be a ${roleClicked.toUpperCase()}.`;
			},
			insomniac() {
				let roleClicked = getTrueRoleBySeatNumber(game, data.action);

				player.nightAction.roleClicked = roleClicked;
				player.nightAction.seatClicked = data.action;
				player.nightAction.completed = true;
				chat.chat = `You look at your own card and it is revealed to be a ${roleClicked.toUpperCase()}.`;
			},
			troublemaker() {
				let seat1player = game.internals.seatedPlayers.find((player) => {
						return player.seat === parseInt(data.action[0]);
					}),
					seat2player = game.internals.seatedPlayers.find((player) => {
						return player.seat === parseInt(data.action[1]);
					});

				updatedTrueRoles = game.internals.seatedPlayers.map((player, index) => {
					if (player.userName === seat1player.userName) {
						return seat2player.trueRole;
					} else if (player.userName === seat2player.userName) {
						return seat1player.trueRole;
					} else {
						return player.trueRole;
					}
				});

				player.nightAction.seatsClicked = data.action;
				player.nightAction.completed = true;
				chat.chat = `You swap the two cards between ${seat1player.userName.toUpperCase()} and ${seat2player.userName.toUpperCase()}.`;
			},
			robber() {
				let robberPlayer = game.internals.seatedPlayers.find((player) => {
						return player.userName === data.userName;
					}),
					swappedPlayer = game.internals.seatedPlayers.find((player) => {
						return player.seat === parseInt(data.action);
					}),
					swappedPlayerOriginalRole = swappedPlayer.trueRole;

				updatedTrueRoles = game.internals.seatedPlayers.map((player, index) => {
					if (player.userName === robberPlayer.userName) {
						return swappedPlayer.trueRole;
					}

					if (player.userName === swappedPlayer.userName) {
						return robberPlayer.trueRole;
					}

					return player.trueRole;
				});
				player.nightAction.seatClicked = data.action;
				player.nightAction.newRole = swappedPlayerOriginalRole;
				player.nightAction.completed = true;
				chat.chat = `You exchange cards between yourself and ${swappedPlayer.userName.toUpperCase()} and view your new role, which is a ${swappedPlayer.trueRole.toUpperCase()}.`;
			},
			seer() {
				let selectedCard = {
					7: 'CENTER LEFT',
					8: 'CENTER MIDDLE',
					9: 'CENTER RIGHT'
				},
				rolesClicked = data.action.map((role) => {
					return getTrueRoleBySeatNumber(game, role);
				});

				player.nightAction.rolesClicked = rolesClicked;
				player.nightAction.seatsClicked = data.action;
				player.nightAction.completed = true;

				if (data.action.length === 1) {
					let playerClicked = game.internals.seatedPlayers[parseInt(data.action)].userName;

					chat.chat = `You select to see the card of ${playerClicked.toUpperCase()} and it is a ${rolesClicked[0].toUpperCase()}.`;
				} else {
					chat.chat = `You select to see the ${selectedCard[data.action[1]].toUpperCase()} and ${selectedCard[data.action[0]].toUpperCase()} cards and they are a ${rolesClicked[1].toUpperCase()} and a ${rolesClicked[0].toUpperCase()}.`;
				}
			}
		};

	if (!player.nightAction.completed) {
		eventMap[data.role]();
	}

	player.gameChats.push(chat);
	sendInprogressChats(game);
};

module.exports.updatedTrueRoles = updatedTrueRoles;