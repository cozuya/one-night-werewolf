'use strict';

// let Chatroom = require('../models/chatroom');

export let games = [];

export function addGame(game) {
	games.push(game);
	sendGameList();
}

export function sendGameList() {
	io.emit('gameList', games);
}

export function updateGameList(data) {
	let game = games.find((el) => {
		return el.uid === data.gameID;
	}),
	index = games.indexOf(game);
	

	console.log(data);
	console.log(games);
	console.log(index);
	console.log(games[index]);
	games[index].seated[`seat${data.seatNumber}`] = data.user;
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