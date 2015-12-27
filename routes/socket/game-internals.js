'use strict';

import { games, secureGame } from './game.js';
import _ from 'lodash';

export function getSocketsByUid(uid) {
	let game = games.find((el) => {
			return el.uid === uid;
		}),
		seatedPlayerNames = Object.keys(game.seated).map((seat) => {
			return game.seated[seat].userName;
		}),
		sockets = {},
		roomSockets = Object.keys(io.sockets.adapter.rooms[game.uid]).map((sockedId) => {
			return io.sockets.connected[sockedId];
		});

		sockets.playerSockets = roomSockets.filter((socket) => {
			return seatedPlayerNames.indexOf(socket.handshake.session.passport.user) >= 0;
		}),
		sockets.observerSockets = roomSockets.filter((socket) => {
			return seatedPlayerNames.indexOf(socket.handshake.session.passport.user) === -1;
		});

	return sockets;
}

export function startGame(game) {
	let allWerewolvesNotInCenter = false,
		assignRoles = () => {
			let _roles = _.clone(game.roles);

			game.internals.seatedPlayers.map((player, index) => {
				let roleIndex = Math.floor((Math.random() * _roles.length)),
					role = _roles[roleIndex];

				if (role === 'werewolf' && !allWerewolvesNotInCenter) {
					allWerewolvesNotInCenter = true;
				}

				player.trueRole = role;
				player.seat = index + 1;
				_roles.splice(roleIndex, 1);
			});

			game.internals.centerRoles = [..._roles];
		};

	Object.keys(game.seated).map((seat, i) => {
		return game.internals.seatedPlayers[i] = {
			userName: game.seated[seat].userName
		};
	});

	assignRoles();

	if (game.kobk && !allWerewolvesNotInCenter) {
		while (!allWerewolvesNotInCenter) {
			assignRoles();
		}
	}

	game.internals.seatedPlayers.forEach((player, i) => {
		player.gameChats = [];
		updateInprogressSystemChat(game, {
			gameChat: true,
			userName: player.userName,
			chat: `The game begins and you receive the ${player.trueRole.toUpperCase()} role.`,
			seat: i + 1
		});
	});

	updateInprogressSystemChat(game, {
		gameChat: true,
		chat: 'The game begins.'
	});

	beginPreNightPhase(game);
}

let updateInprogressSystemChat = (game, chat) => {
	let sockets = getSocketsByUid(game.uid),	
		gameChats = chat.userName ? game.internals.seatedPlayers[chat.seat - 1].gameChats : game.internals.unSeatedGameChats,
		tempChats, cloneGame;

	chat.timestamp = new Date();
	gameChats.push(chat);
	cloneGame = _.clone(game);
	tempChats = gameChats.concat(cloneGame.chats);
	tempChats.sort((chat1, chat2) => {
		return chat1.timestamp - chat2.timestamp;
	});

	cloneGame.chats = tempChats;

	if (chat.userName) {
		let playerSocket = sockets.playerSockets.find((sock) => {
			return chat.userName === sock.handshake.session.passport.user;
		});

		playerSocket.emit('gameUpdate', secureGame(cloneGame));
	} else {
		// todo: need to figure out how to make a new observer see these gamechats after they have been generated here.
		sockets.observerSockets.forEach((sock) => {
			sock.emit('gameUpdate', secureGame(cloneGame));
		});
	}
}

export function updateInprogressNonSystemChat(game, chat) {
	let sockets = getSocketsByUid(game.uid),
		generateChats = (nonGameChats) => {
			let tempChats = _.clone(game).chats;

			tempChats = tempChats.concat(nonGameChats);
			tempChats.sort((chat1, chat2) => {
				return chat1.timestamp - chat2.timestamp;
			});

			return tempChats;
		};

	chat.timestamp = new Date();
	game.chats.push(chat);

	sockets.playerSockets.forEach((playerSocket, index) => {
		let cloneGame = _.clone(game);

		cloneGame.chats = generateChats(cloneGame.internals.seatedPlayers[index].gameChats);
		playerSocket.emit('gameUpdate', secureGame(cloneGame));
	});

	sockets.observerSockets.forEach((observerSocket) => {
		let cloneGame = _.clone(game);

		cloneGame.chats = generateChats(cloneGame.internals.unSeatedGameChats);
		observerSocket.emit('gameUpdate', secureGame(cloneGame));
	});
}

let beginPreNightPhase = () => {
	// todo: deal with this race condition/overwriting the sendnewgamechat of starting the game
	// game.status = 'Dealing..';
	// io.in(game.uid).emit('gameUpdate', secureGame(game));
}