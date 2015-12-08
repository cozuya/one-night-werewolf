'use strict';

// let Chatroom = require('../models/chatroom');

let games = [];

export function sendGameList() {
	let gameList = games.map((game) => {
		return {
			kobk: game.kobk,
			time: game.time,
			name: game.name,
			roles: game.roles,
			seatedCount: game.seatedCount,
			inProgress: game.inProgress,
			uid: game.uid
		};
	});

	io.emit('gameList', gameList);
}

export function createGame(socket, game) {
	games.push(game);
	sendGameList();
	socket.join(game.uid);
};

export function sendGameInfo(socket, uid) {
	let game = games.find((el) => {
		return el.uid === uid;
	});

	socket.join(uid);
	socket.emit('gameUpdate', game);
}

export function updateSeatedUsers(socket, data) {
	let game = games.find((el) => {
		return el.uid === data.uid;
	});


	if (typeof data.user !== 'undefined') {
		game.seated[`seat${data.seatNumber}`] = data.user;
		game.seatedCount++;
	} else {
		for (var key in game.seated) {
			if (game.seated.hasOwnProperty(key)) {
				if (game.seated[key].userName === socket.handshake.session.passport.user) {
					delete game.seated[key];
					game.seatedCount--;
				}
			}
		}
		socket.leave(game.uid);
	}

	socket.broadcast.to(data.uid).emit('gameUpdate', game).emit('gameUpdate', game);
	sendGameList();
}




	// let games = [],
	// 	gameList = () => {
	// 		io.emit('gameList', games);
	// 	};

	// io.on('connection', (socket) => {
	// 	socket.on('addGame', (game) => {
	// 		games.push(game);
	// 		gameList();
	// 	});

	// 	socket.on('getGameList', gameList);
	// });

	// let chats = [],
	// 	users = [],
	// 	userCount = 0,
	// 	sendChats = () => {
	// 		io.emit('chatsEmit', chats);
	// 	},
	// 	sendUsers = () => {
	// 		io.emit('usersEmit', users);
	// 	},
	// 	initialConnection = true,
	// 	chatroom;



	// io.on('connection', (socket) => {
	// 	if (socket.handshake.session.passport && Object.keys(socket.handshake.session.passport).length > 0) {
	// 		socket.userName = socket.handshake.session.passport.user;
	// 		socket.userIndex = userCount;
	// 		userCount++;
	// 		users.push({
	// 			userName: socket.userName,
	// 			wasMentioned: false
	// 		});
	// 		sendUsers();

	// 		if (initialConnection) {
	// 			initialConnection = false;
	// 			chatroom = new Chatroom({
	// 				createdBy: socket.userName,
	// 				createdAt: new Date()
	// 			});
	// 			chatroom.save();
	// 		}
	// 	} else {
	// 		socket.userName = null;
	// 	}
	// 	socket.on('getChats', sendChats);
	// 	socket.on('newChat', (chat) => {
	// 		if (socket.userName) {
	// 			chats.push({
	// 				author: socket.userName,
	// 				chatMsg: chat
	// 			});
	// 			sendChats();
	// 		}
	// 	});
	// 	socket.on('mentionedUser', (mentionedUser) => {
	// 		for (let user of users) {
	// 			if (user.userName === mentionedUser) {
	// 				user.wasMentioned = true;
	// 				sendUsers();
	// 				setTimeout(() => {
	// 					user.wasMentioned = false;
	// 					sendUsers();
	// 				}, 2000);
	// 			}
	// 		}
	// 	});

	// 	socket.on('getUsers', sendUsers);
	// });